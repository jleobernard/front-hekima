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
      reject(e);
    }
  });
};
export const httpDelete = (url, body, protectedCall = false) => {
  if(protectedCall) {
    return refreshToken().then(session => exchange(url, body, session.access, 'DELETE'))
  } else {
    return exchange(url, body, null, 'DELETE');
  }
};
export const post = (url, body, protectedCall = false) => {
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
export const get = (url, params, protectedCall = false) => {
  const realUrl = constructUrl(url, params)
  if(protectedCall) {
    return refreshToken().then(session => exchange(realUrl, null, session.access, 'GET'))
  } else {
    return exchange(realUrl, null, null, 'GET');
  }
};

export const patch = (url, body) => {
  return refreshToken().then(session => exchange(url, body, session.access, 'PATCH'))
};

export const upload = (url, file, protectedCall = false) => {
  if(protectedCall) {
    return refreshToken().then(session => doUpload(url, file, session.access))
  } else {
    return doUpload(url, file);
  }
}
const methodWithBodies = ['POST', 'GET', 'PATCH', 'PUT'];
const exchange = (url, body, accessToken, method = 'POST') => {
  const headers = {}
  const loggingIn = url === '/api/login'
  if(loggingIn) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    const formBody = [];
    for (const property in body) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(body[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    body = formBody.join("&");
  } else {
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
        if(!loggingIn && methodWithBodies.indexOf(method) >= 0) {
          return response.json().then(resolve).catch(reject);
        } else {
          resolve();
        }
      } else {
        if(response.type === 'opaqueredirect') {
          if(loggingIn) {
            return resolve();
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

const doGet = (url, params, accessToken) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  if(accessToken) {
    headers['Authorization'] =  'Bearer ' + accessToken;
  }
  return new Promise((resolve, reject) => {
      fetch(rootUrl + url + "?" + asParams(params),{
        method: 'GET',
        headers
      }).then(response => {
        if(response.ok) {
          return response.json().then(resolve).catch(reject);
        } else {
          response.json().then(json => reject(json)).catch(() => reject(response));
        }
      });
    })
};
const asParams = (params)=> {
  return Object.keys(params || {})
  .map(key => key + "=" + encodeURIComponent(params[key]))
  .join("&");
}
