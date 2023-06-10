import { supabase } from "./supabase-client"

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
  
  return {}
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

export async function notesToView(data) {
  return data.map(d => noteToView(d))
}

export async function noteToView(d) {
  if(d.note_source) {
    d.source = d.note_source 
  }
  if(d.valeur_json) {
    d.valeurJson = d.valeur_json
  }
  return d
}

function createBaseSelect() {
  return supabase.from("note").select(`
    id,
      uri, valeur, mime_type, file_id, created_at, files, subs,
      note_source(id, uri, titre, source_type, auteur)
  `);
}


function getNoteUrisByFilter(filter, queryBuilder) {
  if(filter.source) {
    queryBuilder.eq('source_id', supabase.from("source").select("id").eq('uri', filter.source))
  }
  return queryBuilder;
}