import { supabase } from "./supabase-client"
import { v4 as uuidv4 } from 'uuid';


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

export async function uspertNote(note) {
  // WIP - cannot see tags in tag selector
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
    noteModel = {uri}
  }
  noteModel.value_json = note.valueJson
  noteModel.mime_type = note.mimeType
  noteModel.file_id = note.fileId
  if(note.source) {
    const {data} = await supabase.from("note_source").select('id').eq('uri', note.source)
    if(data && data.length > 0) {
      noteModel.source_id = data[0].id
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
    for(let tag of data) {
      const { error } = await supabase.from("note_tag").insert({
          note_id: noteModel.id,
          tag_id: tag.id
      })
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
  }
  if(d.value_json) {
    d.valueJson = d.value_json
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
  return queryBuilder;
}