import { sanitize } from "utils/string"
import { supabase } from "./supabase-client"
import sha1 from 'js-sha1';
import { supabaseNow } from "utils/date";

export async function searchSources(q, offset, count) {
  let builder = supabase.from('note_source').select()
  if(q) {
    const sanitizedSearch = sanitize(q)
    builder = builder.like('titre_recherche', `%${sanitizedSearch}%`)
  }
  let realOffset = offset;
  let realCount = count;
  if(isNaN(offset) || offset < 0) {
    realOffset = 0;
  }
  if(isNaN(realCount) || realCount < 0) {
    realCount = 20;
  } else if(realCount > 100) {
    realCount = 100;
  }
  builder = builder.range(realOffset, realOffset + realCount - 1)
  .order('last_used', {ascending: false})
  const {data} = await builder;
  const sources = (data || []).map(s => toView(s));
  return sources;
}


export async function upsertSource(sourceView) {
  let upserted;
  const uri = sourceView.uri ? sourceView.uri : sha1(`${sourceView.auteur}#${sourceView.titre}#${sourceView.type}`)
  const { data, error} = await supabase.from('note_source').select().eq('uri', uri).maybeSingle()
  if(data) {
    console.warn('Source ', sourceView, ' already exists')
    upserted = data
  } else {
    const insertResponse = await supabase.from('note_source').insert({
      uri,
      titre: sourceView.titre,
      titre_recherche: sanitize(sourceView.titre),
      auteur: sourceView.auteur,
      source_type: sourceView.type,
      last_used: supabaseNow()}
    ).select().single()
    if(insertResponse.error) {
      console.error('Cannot insert source', sourceView, error)
      throw insertResponse.error
    } else {
      upserted = insertResponse.data
    }
  }
  return toView(upserted)
}

function toView(model) {
  return {
    uri: model.uri,
    titre: model.titre,
    auteur: model.auteur,
    type: model.source_type
  }
}