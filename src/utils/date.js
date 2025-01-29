export function supabaseNow() {
    return ((new Date()).toISOString()).toLocaleString(navigator.language)
}

export function dateToSupabaseFormat(date) {
    return (date.toISOString()).toLocaleString(navigator.language)
}