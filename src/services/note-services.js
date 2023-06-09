import { supabase } from "./supabase-client"

const re = RegExp('(^|[^#])#[^#]+?#[^#]','g')
export function getNumberOfTitles(note) {
  return Array.from(note.valeur.matchAll(re)).length
}

export async function uspertNote(note) {
  
  return {}
}