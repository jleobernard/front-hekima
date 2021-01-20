let user = null;
function initializeUser() {
  if(typeof(localStorage) !== 'undefined') {
    user = JSON.parse(localStorage.getItem('user'));
    //console.log("User is " + user);
  }
}
export const setSession = (session) => {
  if(typeof(localStorage) !== 'undefined') {
    const jwt = session.tokens || session;
    if(jwt.access) {
      localStorage.setItem('access', jwt.access);
    }
    if(jwt.refresh) {
      localStorage.setItem('refresh', jwt.refresh);
    }
    if(session.user) {
      user = session.user;
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
};
export const getSession = () => {
  if(typeof(localStorage) !== 'undefined') {
    return {
      access: localStorage.getItem('access'),
      refresh: localStorage.getItem('refresh')
    };
  }
};
export const logout = () => {
  if(typeof(localStorage) !== 'undefined') {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
  }
}
export const getPseudo = () => {
  initializeUser();
  return user ? user.pseudo : '';
}
export const getLanguages = () => {
  initializeUser();
  return user ? user.languages: [];
}