import { supabaseNow } from "utils/date";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "./supabase-client";
import { Color } from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import ListItem from "@tiptap/extension-list-item";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextStyle from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import { generateJSON } from "@tiptap/react";
import { generateText } from "@tiptap/core";

const re = RegExp("(^|[^#])#[^#]+?#[^#]", "g");
const meaningLessWord = new Set(["exemple", "example", "examples", "exemples", "ex", "eg", "ie"]);
export const EXTENSIONS = [
  TextStyle,
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
  }),
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
  Image.configure({
    inline: true,
  }),
];
export function getNumberOfTitles(note) {
  return Array.from(note.valeur.matchAll(re)).length;
}

export async function searchNotes(filter) {
  let queryBuilder = createBaseSelect();
  let noteIdsOrder;
  if (filter.q) {
    // NLP Search
    [queryBuilder, noteIdsOrder] = await getNoteUrisByNLQuery(
      filter,
      queryBuilder
    );
  } else {
    queryBuilder = getNoteUrisByFilter(filter, queryBuilder);
  }
  const { data } = await queryBuilder.range(
    filter.offset,
    filter.offset + filter.count - 1
  );
  let views = notesToView(data);
  if (noteIdsOrder) {
    const noteIdToOrder = new Map();
    noteIdsOrder.forEach((id, index) => noteIdToOrder.set(id, index));
    views = [...views].sort(
      (noteA, noteB) =>
        (noteIdToOrder.get(noteA.id) || 0) - (noteIdToOrder.get(noteB.id) || 0)
    );
  }
  return views;
}
async function getNoteUrisByNLQuery(filter, queryBuilder) {
  let {q, tags} = filter
  if(tags && !Array.isArray(tags)) {
    tags = [tags]
  }
  if(tags) {
    tags = tags.filter(t => !!t)
  }
  console.log(filter)
  const embeddingResponse = await fetch(
    process.env.REACT_APP_EMBEDDING_SERVICE_URL,
    {
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ sentences: [q] }),
    }
  );
  if (!embeddingResponse.ok) {
    console.log("An error occurred while calculating embeddings");
    return null;
  }
  const { embeddings } = await embeddingResponse.json();
  const rpcQuery = 
  {
    embedding: embeddings[0],
    match_threshold: 0.75,
    match_count: 10
  }
  if(tags && tags.length > 0) {
    rpcQuery['tag_uris'] = tags
  }
  const { error: matchError, data: similarNotes } = await supabase.rpc(
    tags ? "match_note_embeddings_and_tags" : "match_note_embeddings",rpcQuery
  );
  const noteIds = similarNotes.map((n) => n.note_id);
  console.error(matchError);
  console.log(noteIds);
  return [queryBuilder.in("id", noteIds), noteIds];
}

export async function deleteNote(noteUri) {
  await supabase.from("note").delete(1).eq("uri", noteUri);
}

export async function uspertNote(note) {
  const now = supabaseNow();
  let uri = note.uri;
  let noteModel;
  if (uri) {
    const { data } = await supabase.from("note").select().eq("uri", uri);
    if (data && data.length > 0) {
      noteModel = data[0];
    }
  } else {
    uri = uuidv4();
  }
  if (noteModel) {
    noteModel.source_id = null;
    await supabase.from("note_tag").delete().eq("note_id", noteModel.id);
  } else {
    noteModel = { uri, created_at: now };
  }
  noteModel.value_json = note.valueJson;
  noteModel.mime_type = note.mimeType;
  noteModel.file_id = note.fileId;
  noteModel.subs = note.subs;
  if (note.source) {
    const { data } = await supabase
      .from("note_source")
      .select("id")
      .eq("uri", note.source)
      .single();
    if (data) {
      noteModel.source_id = data.id;
      await supabase
        .from("note_source")
        .update({ last_used: now })
        .eq("id", data.id);
    }
  }
  if (noteModel.id) {
    await supabase.from("note").update(noteModel).eq("id", noteModel.id);
  } else {
    const { data, error } = await supabase
      .from("note")
      .insert(noteModel)
      .select();
    noteModel = data[0];
  }
  if (note.tags) {
    const { data } = await supabase
      .from("tag")
      .select("id")
      .in("uri", note.tags);
    const noteTagsToUpsert = data.map((tag) => {
      return {
        note_id: noteModel.id,
        tag_id: tag.id,
      };
    });
    const { error } = await supabase.from("note_tag").insert(noteTagsToUpsert);
    const tagIds = data.map((t) => t.id);
    if (tagIds && tagIds.length > 0) {
      await supabase.from("tag").update({ last_used: now }).in("id", tagIds);
    }
  }
  const insertedNote = await findNoteByUri(noteModel.uri);
  upsertEmbeddings(insertedNote)
  return insertedNote;
}

export async function findNoteByUri(uri) {
  const { data } = await createBaseSelect().eq("uri", uri);
  let noteView;
  if (data && data.length > 0) {
    noteView = noteToView(data[0]);
  } else {
    noteView = null;
  }
  return noteView;
}

export function notesToView(data) {
  return data.map((d) => noteToView(d));
}

export function noteToView(d) {
  if (d.note_source) {
    d.source = d.note_source;
    delete d.note_source;
  }
  if (d.valeur && !d.value_json) {
    d.valeur = upgradeOldText(d.valeur);
  }
  if (d.value_json) {
    d.valueJson = d.value_json;
    delete d.value_json;
  }
  if (d.tag) {
    d.tags = d.tag;
    delete d.tag;
  }
  if (d.subs && d.subs.subs) {
    d.subs = d.subs.subs;
  }
  return d;
}

function createBaseSelect() {
  return supabase.from("note").select(`
    id,
      uri, valeur, mime_type, file_id, created_at, files, subs,
      value_json,
      note_source(id, uri, titre, source_type, auteur),
      tag(id, uri, valeur)
  `);
}

function getNoteUrisByFilter(filter, queryBuilder) {
  if (filter.source) {
    queryBuilder.eq(
      "source_id",
      supabase.from("source").select("id").eq("uri", filter.source)
    );
  }
  queryBuilder.order("created_at", { ascending: false });
  return queryBuilder;
}

export async function refreshNote(note) {
  if (!note.valueJson && note.valeur) {
    console.log("updating valeur field of note", note.uri);
    const valueJson = convertTextToJson(upgradeOldText(note.valeur));
    note.valueJson = valueJson;
    note.valeur = null;
    const {error} = await supabase
      .from("note")
      .update({ value_json: valueJson, valeur: null })
      .eq("uri", note.uri);
    if(error) {
      console.error("Cannot update old value")
      return false;
    }
  }
  const result = await upsertEmbeddings(note);
  return result;
}
async function upsertEmbeddings(note) {
  const value = note.valueJson;
  const noteId = note.id;
  const embeddingRequest = {
    primer: getTitle(value),
    sentences: getSentences(value),
  };
  try {
    const embeddingResponse = await fetch(
      process.env.REACT_APP_EMBEDDING_SERVICE_URL,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(embeddingRequest),
      }
    );
    if (embeddingResponse.ok) {
      const { embeddings } = await embeddingResponse.json();
      const embeddingData = embeddings.map((embedding) => {
        return { note_id: noteId, embedding: embedding };
      });
      await supabase.from("note_embedding").delete().eq("note_id", noteId);
      await supabase.from("note_embedding").insert(embeddingData);
      return true
    } else {
      console.error("Could not embed response", embeddingResponse);
      return false
    }
  } catch (e) {
    console.error("Error while fetching", e)
    return false
  }
}

function getTitle(jsonContent) {
  let title = "";
  if (jsonContent) {
    const type = jsonContent.type;
    if (type === "heading") {
      title = generateText(jsonContent, EXTENSIONS);
    }
    const children = jsonContent.content || [];
    for (let i = 0; !title && i < children.length; i++) {
      title = getTitle(children[i]);
    }
  }
  return title;
}

function getSentences(jsonContent) {
  const plainText = generateText(jsonContent, EXTENSIONS);
  const sentences = plainText
    .split(/[$.!?\|]|\n/)
    .map((s) => s.trim())
    .filter((s) => !!s)
    .filter((s) => meaningfulSentence(s));
  return sentences;
}

function meaningfulSentence(text) {
  const raw = text
    .replaceAll(/[\|\[\]:;\\.\\?!\\(\)/\\#={}]/g, " ")
    .trim()
    .replaceAll(/\s+/g, " ")
    .replaceAll(/--+/g, " ")
    .trim()
    .toLowerCase();
  return raw.length > 0 && !meaningLessWord.has(raw);
}

function upgradeOldText(plainText) {
  return plainText
    .replaceAll("\\n", "<br />")
    .replaceAll(/###(.+?)###/g, "<h1>$1</h1>")
    .replaceAll(/###(.+?)###/g, "<h2>$1</h2>")
    .replaceAll(/#(.+?)#/g, "<h1>$1</h1>");
}

function convertTextToJson(text) {
  return generateJSON(text, EXTENSIONS);
}



async function sleep(timeout) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), timeout)
  })
}
export async function refreshAllNotes() {
  const query = supabase.from("note").select(`
  id, uri, valeur, value_json
`);
  const { data: notes, error } = await query;
  if(error) {
    console.error(error)
  } else {
    console.log(notes.length, "notes to migrate")
    const percentage = Math.floor(notes.length / 100)
    const errors = []
    let retry = false;
    for(let idx = 0; idx < notes.length; idx ++) {
      const note = notes[idx]
      try {
        const ok = await refreshNote({
          id: note.id,
          uri: note.uri,
          valeur: note.valeur,
          valueJson: note.value_json
        })
        if(ok) {
          if(retry) {
            console.error("Note ", note.uri, "finally passed");
            errors.pop()
            retry = false
          }
        } else {
          if(retry) {
            console.log(note.uri, "really did not pass")
            retry = false;
          } else {
            console.error("Error while treating note ", note.uri);
            errors.push(note.uri)
            await sleep(5000)
            idx --
            retry = true
          }
        }
      } catch(e) {
        if(retry) {
          console.error("Really couldn't pass ", note.uri, e);
          retry = false
        } else {
          console.error("Error while treating note ", note.uri, e);
          errors.push(note.uri)
          await sleep(5000)
          idx --
          retry = true
        }
      }
      if(idx > 0 && (idx % percentage) === 0) {
        console.log(idx + 1, " notes migrated")
      }
      await sleep(100)
    }
    console.log("Done with ", errors.length, " errors")
    if(errors.length > 0) {
      console.error(errors)
    }
  }
}
