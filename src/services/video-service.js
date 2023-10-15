import { notifyError } from "store/features/notificationsSlice";
import { insertJob } from "./jobs-services";
import { getAccessToken } from "./gcp-service";

export async function clipVideo(videoName, from, to) {
    await insertJob(`${videoName}_${from}_${to}`)
    const accessToken = await getAccessToken()
    return new Promise((resolve, reject) => {
        fetch(process.env.REACT_APP_VIDEO_CLIPPER_URL,
        {
            method: "POST",
            redirect: 'manual',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                parts: [
                    {video: videoName, from, to}
                ],
                accessToken
            })
          }).then(async response => {
            if(response.ok) {
              response.json().then(searchResponse => {
                resolve(searchResponse.result)
              }).catch(reject)
            } else {
              notifyError(`Impossible de chercher des sous-titres ${response}`)
              reject('ksubs.search.error')
            }
          }).catch(reject)
    })
}
