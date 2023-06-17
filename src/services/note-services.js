import { supabaseNow } from "utils/date";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "./supabase-client";


const re = RegExp('(^|[^#])#[^#]+?#[^#]','g')
export function getNumberOfTitles(note) {
  return Array.from(note.valeur.matchAll(re)).length
}

export async function searchNotes(filter) {
  let queryBuilder = createBaseSelect()
  if(filter.q) {
    // NLP Search
    console.warn("not yet implemented")
  } else {
    queryBuilder = getNoteUrisByFilter(filter, queryBuilder)
  }
  const {data} = await queryBuilder.range(filter.offset, filter.offset + filter.count - 1)
  return notesToView(data)
}

export async function deleteNote(noteUri) {
  await supabase.from('note').delete(1).eq('uri', noteUri)
}

export async function uspertNote(note) {
  const now = supabaseNow()
  let uri = note.uri;
  let noteModel;
  if(uri) {
    const {data} = await supabase.from("note").select().eq('uri', uri);
    if(data && data.length > 0) {
      noteModel = data[0]
    }
  } else {
    uri = uuidv4()
  }
  if(noteModel) {
    noteModel.source_id = null
    await supabase.from('note_tag').delete().eq('note_id', noteModel.id)
  } else {
    noteModel = {uri, created_at: now}
  }
  noteModel.value_json = note.valueJson
  noteModel.mime_type = note.mimeType
  noteModel.file_id = note.fileId
  if(note.source) {
    const {data} = await supabase.from("note_source").select('id').eq('uri', note.source).single()
    if(data) {
      noteModel.source_id = data.id
      await supabase.from('note_source').update({last_used: now}).eq('id', data.id)
    }
  }
  if(noteModel.id) {
    await supabase.from("note").update(noteModel).eq('id', noteModel.id)
  } else {
    const {data, error} = await supabase.from("note").insert(noteModel).select()
    noteModel = data[0]
  }
  if(note.tags) {
    const { data } = await supabase.from("tag").select('id').in('uri', note.tags)
    const noteTagsToUpsert = data.map(tag => {
      return {
        note_id: noteModel.id,
        tag_id: tag.id
      }
    })
    const { error } = await supabase.from("note_tag").insert(noteTagsToUpsert)
    const tagIds = data.map(t => t.id)
    if(tagIds && tagIds.length > 0) {
      await supabase.from("tag").update({last_used: now}).in('id', tagIds)
    }
  }
  const insertedNote = await findNoteByUri(noteModel.uri)
  return insertedNote
}

export async function findNoteByUri(uri) {
  const {data} = await createBaseSelect().eq('uri', uri);
  let noteView;
  if(data && data.length > 0) {
    noteView = noteToView(data[0]);
  } else {
    noteView = null;
  }
  return noteView;
}

export function notesToView(data) {
  return data.map(d => noteToView(d))
}

export function noteToView(d) {
  if(d.note_source) {
    d.source = d.note_source 
    delete d.note_source
  }
  if(d.valeur) {
    d.valeur = d.valeur.replaceAll('\\n', '<br />')
  }
  if(d.value_json) {
    d.valueJson = d.value_json
    delete d.value_json
  }
  if(d.tag) {
    d.tags = d.tag
    delete d.tag
  }
  return d
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
  if(filter.source) {
    queryBuilder.eq('source_id', supabase.from("source").select("id").eq('uri', filter.source))
  }
  queryBuilder.order('created_at', {ascending: false})
  return queryBuilder;
}