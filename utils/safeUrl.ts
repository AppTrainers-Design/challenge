/**
 * Returns a URL only if its scheme is safe to put in an `:href`, else `''`.
 *
 * The backend serves outbound links (e.g. a preparatory-course `link`) as opaque
 * strings. Binding one straight to `:href` is an XSS sink: `javascript:` / `data:`
 * / `vbscript:` URIs execute on click - and `target="_blank"` does NOT stop them.
 * Our auth token lives in a JS-readable cookie (see useAuth), so one click could
 * mean account takeover. Pipe every server-supplied href through here.
 *
 * Only absolute http/https/mailto/tel and scheme-less (relative, protocol-relative,
 * fragment, query) URLs pass; anything else returns '' so the caller can hide the
 * link. Control chars are stripped first so a tab/newline cannot split a scheme
 * (browsers ignore them mid-scheme, so we must too). Auto-imported by Nuxt.
 */
export const safeUrl = (url?: string | null): string => {
  if (!url) return ''
  // Strip whitespace/control chars the browser ignores mid-scheme, then trim.
  const cleaned = url.replace(/\s+/g, '').trim()
  const scheme = cleaned.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase()
  // No scheme -> relative/protocol-relative/fragment: safe. Otherwise allowlist only.
  if (!scheme) return cleaned
  return ['http', 'https', 'mailto', 'tel'].includes(scheme) ? cleaned : ''
}
