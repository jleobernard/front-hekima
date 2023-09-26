let client = null;
let tokenInfo = {
  token: null,
  refreshAt: -1,
};
let observers = [];
let loaded = false;

function load() {
  if (!loaded) {
    if (localStorage) {
      const raw = localStorage.getItem("gcp-access");
      if (raw) {
        tokenInfo = JSON.parse(raw);
      }
    }
    loaded = true;
  }
}
export function getClient() {
  if (client == null) {
    load();
    client = window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.REACT_APP_GCP_PUBLIC_ID,
      scope: "https://www.googleapis.com/auth/devstorage.read_only",
      callback: (response) => {
        tokenInfo.token = response.access_token;
        tokenInfo.refreshAt = Date.now() + response.expires_in * 1000;
        localStorage.setItem("gcp-access", JSON.stringify(tokenInfo));
        if (observers && observers.length > 0) {
          observers.forEach((observer) => observer.handler());
        }
      },
    });
  }
  return client;
}

export async function getAccessToken() {
  load();
  return new Promise((resolve) => {
    if (Date.now() > tokenInfo.refreshAt) {
      const id = String(Math.random());
      observers.push({
        id,
        handler: () => {
          resolve(tokenInfo.token);
          observers = observers.filter((o) => o.id !== id);
        },
      });
      getClient().requestAccessToken();
    } else {
      resolve(tokenInfo.token);
    }
  });
}
