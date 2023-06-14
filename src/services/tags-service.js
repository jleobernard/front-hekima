import { sanitize } from "utils/string"
import { supabase } from "./supabase-client"
import sha1 from 'js-sha1';
import { supabaseNow } from "utils/date";

export async function searchTags(q, offset, count) {
  let builder = supabase.from('tag').select()
  if(q) {
    const sanitizedSearch = sanitize(q)
    builder = builder.like('valeur_recherche', `%${sanitizedSearch}%`)
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
  const sources = (data || []);
  return sources;
}

export async function upsertTag(valeur) {
  const realValue = valeur.trim()
  const uri = sha1(realValue)
  const { data, error} = await supabase.from('tag').select().eq('uri', uri).maybeSingle()
  if(data) {
    console.warn('Tag ', valeur, ' already exists')
    return data
  }
  const insertResponse = await supabase.from('tag').insert({
    uri,
    valeur,
    valeur_recherche: sanitize(valeur),
    last_used: supabaseNow()}).select()
  if(insertResponse.error) {
    console.error('Cannot insert tag', valeur, error)
    throw insertResponse.error
  } else {
    return insertResponse.data[0]
  }
}