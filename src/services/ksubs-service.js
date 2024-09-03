import { notifyError } from 'store/features/notificationsSlice';

export async function search(q) {
    return new Promise((resolve, reject) => {
        fetch(
            `${process.env.REACT_APP_KSUBS_SEARCHER_SERVICE_URL}?${new URLSearchParams({ q }).toString()}`,
        {
            method: "GET",
            redirect: 'manual'
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


export async function getSubs(name, from, to) {
  return new Promise((resolve, reject) => {
    const query = {name, from, to, action: 'subs'}
      fetch(
          `${process.env.REACT_APP_KSUBS_SEARCHER_SERVICE_URL}?${new URLSearchParams(query).toString()}`,
      {
          method: "GET",
          redirect: 'manual'
        }).then(async response => {
          if(response.ok) {
            response.json().then(subs => {
              resolve(subs)
            }).catch(reject)
          } else {
            notifyError(`Impossible de chercher des sous-titres ${response}`)
            reject('ksubs.subs.error')
          }
        }).catch(reject)
  })
}