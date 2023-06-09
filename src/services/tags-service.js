import { sanitize } from "utils/string"
import { supabase } from "./supabase-client"

export async function searchTags(q, offset, count) {
  let builder = supabase.from('tag').select()
  if(q) {
    const sanitizedSearch = sanitize(q)
    builder = builder.contains('valeur_recherche', sanitizedSearch)
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
