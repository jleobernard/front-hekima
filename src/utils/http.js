import {getSession, setSession} from "./storage";
import jwt_decode from "jwt-decode";

const deltaForExpiration = 0;
const rootUrl = process.env.REACT_APP_API_ROOT_URL ? process.env.REACT_APP_API_ROOT_URL : '';
export const refreshToken = (force = false) => {
  return new Promise((resolve, reject) => {
    try {
      const session = getSession();
      if(!(session && session.refresh)) {
        window.location.href = process.env.PUBLIC_URL+'/login';
      } else {
        const decoded = jwt_decode(session.access);
        if (force || ((decoded.exp * 1000) < (Date.now() - deltaForExpiration))) {
            exchange("/api/token:refresh", {refresh: session.refresh})
            .then(response => {
              setSession(response);
              resolve(response);
            }).catch(err => {
              if (err && err.code === 'token_not_valid') {
                window.location.href = process.env.PUBLIC_URL+'/login';
              }
              reject();
            });
        } else {
          resolve(session);
        }
      }
    } catch(e) {
      console.error(e)
      if(window.location.pathname === '/login') {
        reject()
      } else {
        window.location.href = process.env.PUBLIC_URL + '/login';
      }
    }
  });
};
export const httpDelete = (url, body, protectedCall = true) => {
  if(protectedCall) {
    return refreshToken().then(session => exchange(url, body, session.access, 'DELETE'))
  } else {
    return exchange(url, body, null, 'DELETE');
  }
};
export const post = (url, body, protectedCall = true) => {
  if(protectedCall) {
    return refreshToken().then(session => exchange(url, body, session.access))
  } else {
    return exchange(url, body);
  }
};

function constructUrl(url, params) {
  let target = url
  if(params && Object.keys(params).length > 0) {
    if (target.indexOf('?') < 0) {
      target += '?'
    } else {
      target += '&'
    }
    target += asParams(params)
  }
  return target
}
export const get = (url, params, protectedCall = true) => {
  const realUrl = constructUrl(url, params)
  if(protectedCall) {
    return refreshToken().then(session => exchange(realUrl, null, session.access, 'GET'))
  } else {
    return exchange(realUrl, null, null, 'GET');
  }
};

export const patch = (url, body, protectedCall = true) => {
  if(protectedCall) {
    return refreshToken().then(session => exchange(url, body, session.access, 'PATCH'))
  } else {
    return refreshToken().then(session => exchange(url, body, null, 'PATCH'))
  }
};

export const upload = (url, file, protectedCall = false) => {
  if(protectedCall) {
    return refreshToken().then(session => doUpload(url, file, session.access))
  } else {
    return doUpload(url, file);
  }
}
export const uploadFilesWithRequest = (url, request, files, protectedCall = false) => {
  if(protectedCall) {
    return refreshToken().then(session => doUploadFilesWithRequest(url, request, files, session.access))
  } else {
    return doUploadFilesWithRequest(url, request, files);
  }
}
const methodWithBodies = ['POST', 'GET', 'PATCH', 'PUT'];
const exchange = (url, body, accessToken, method = 'POST') => {
  const headers = {}
  const loggingIn = url === '/api/login'
  if(loggingIn) {
    headers['Content-Type'] = 'application/json'
    body = body ? JSON.stringify(body) : null
  }
  if(accessToken) {
    headers['Authorization'] =  'Bearer ' + accessToken;
  }
  return new Promise((resolve, reject) => {
    fetch(rootUrl + url,{
      method: method,
      redirect: 'manual',
      headers,
      body
    }).then(response => {
      if(response.ok) {
        if(loggingIn) {
          response.json().then(authResponse => {
            setSession(authResponse)
            resolve()
          }).catch(reject)
        } else if(methodWithBodies.indexOf(method) >= 0) {
          return response.json().then(resolve).catch(reject);
        } else {
          resolve();
        }
      } else {
        if(response.status === 401) {
          if(loggingIn || window.location.pathname === '/login') {
            reject(response)
          } else {
            window.location.href = '/login?redirect=' + encodeURIComponent(document.location.pathname+document.location.search);
          }
        } else {
          response.json().then(json => reject(json)).catch(() => reject(response));
        }
      }
    }).catch(err => {
      console.error(err)
      reject(err)
    });
  });
};
const doUpload = (url, file, accessToken) => {
  const headers = {
  };
  if(accessToken) {
    headers['Authorization'] =  'Bearer ' + accessToken;
  }
  const formData = new FormData()
  formData.append('file', file)
  return new Promise((resolve, reject) => {
    fetch(url, {
      headers,
      method: 'POST',
      body: formData
    }).then(response => {
      if(response.ok) {
        return response.json().then(resolve).catch(reject);
      } else {
        response.json().then(json => reject(json)).catch(() => reject(response));
      }
    })
    .catch(reject);
  })
}
const doUploadFilesWithRequest = (url, request, files, accessToken) => {
  const headers = {
  };
  if(accessToken) {
    headers['Authorization'] =  'Bearer ' + accessToken;
  }
  const formData = new FormData()
  formData.append('request', JSON.stringify(request))
  files.forEach(file => {
    formData.append('files', file)
  })
  return new Promise((resolve, reject) => {
    fetch(url, {
      headers,
      method: 'POST',
      body: formData
    }).then(response => {
      if(response.ok) {
        return response.json().then(resolve).catch(reject);
      } else {
        response.json().then(json => reject(json)).catch(() => reject(response));
      }
    })
    .catch(reject);
  })
}

const asParams = (params)=> {
  return Object.keys(params || {})
  .map(key => key + "=" + encodeURIComponent(params[key]))
  .join("&");
}
