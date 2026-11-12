/** True with ?draft=1 in the URL: show license years still being entered (see registry.ts). */
export const draftMode = typeof location !== 'undefined' && new URLSearchParams(location.search).has('draft');
