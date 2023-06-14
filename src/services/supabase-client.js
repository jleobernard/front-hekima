import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || ""
const anonKey = process.env.REACT_APP_SUPABASE_KEY || ""
export const supabase = createClient(supabaseUrl, anonKey);

// Define a function to handle authentication state changes
const handleAuthStateChange = (event, session) => {
    const isLoginScreen = window.location.pathname === '/login'
    console.log(event, session)
    if (session && isLoginScreen) {
        console.log('here')
        /*const q = new URLSearchParams(document.location.search);
        const redirect = q.get('redirect')
        if (redirect && !redirect.startsWith("/login") && !redirect.startsWith("/api/login")) {
            window.location.href = redirect
          } else {
            window.location.href = '/'
          }*/
    } else if(!session && !isLoginScreen) {
      window.location.href = '/login?redirect=' + encodeURIComponent(document.location.pathname+document.location.search);
    }
  };
  
  // Attach the event listener to handle authentication state changes
  supabase.auth.onAuthStateChange(handleAuthStateChange);