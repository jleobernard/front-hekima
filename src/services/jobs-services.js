import { supabase } from "./supabase-client";

const jobs = [];
let lastUpdated = -1;
const freshness = 60000;

export async function searchJobs() {
  const query = supabase.from("jobs").select(`uri, state`);
  const {data, error} = await query;
  if(error) {
    console.error(error);
    return null
  } else {
    lastUpdated = Date.now()
    jobs.splice(0, jobs.length);
    jobs.push(...data)
    return jobs;
  }
}
export async function getJob(uri, force) {
  if(force || Date.now() > lastUpdated + freshness) {
    await searchJobs();
  }
  return jobs.filter(j => j.uri === uri)[0]
}


export async function uspertJob(uri) {
  const jobModel = {uri}
  const {error} = await supabase.from("note").insert(jobModel)
  if(error) {
    console.error(error)
  }
  lastUpdated = -1
}


export async function insertJob(uri) {
  const jobModel = {
    uri,
    progress: 0,
    state: 'SENT'
  }
  lastUpdated = -1
  return await supabase.from('jobs').upsert(jobModel, {onConflict: "uri"}).select()
}

export async function deleteJob(uri) {
  lastUpdated = -1
  return await supabase.from('jobs').delete().eq('uri', uri)
}

export function getJobUriForVideoClipping(name, from, to) {
  return `${name}_${from}_${to}.mp4`
}

