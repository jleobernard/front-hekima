import { notifyError } from 'store/features/notificationsSlice';

export async function createEmbeddingForQuery(query) {
    const serviceQuery = {
        sentences: [query],
        type: 'query'
    }
    return new Promise((resolve, reject) => {
        fetch(process.env.REACT_APP_EMBEDDING_SERVICE_URL,{
            method: "POST",
            redirect: 'manual',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(serviceQuery)
          }).then(async response => {
            if(response.ok) {
              response.json().then(embeddingResponse => {
                resolve(embeddingResponse.embedding)
              }).catch(reject)
            } else {
              notifyError(`Impossible de calculer l'embedding ${response}`)
              reject('embedding.error')
            }
          }).catch(reject)
    })
  }