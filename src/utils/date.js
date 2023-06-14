export function supabaseNow() {
    return ((new Date()).toISOString()).toLocaleString(navigator.language)
}