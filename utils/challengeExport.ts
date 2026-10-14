export interface ChallengeReportSection { heading: string; headers: string[]; rows: (string | number | null | undefined)[][] }

const escapeHtml = (value: string | number | null | undefined) => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!))
const csvValue = (value: string | number | null | undefined) => {
  let text = String(value ?? '')
  // Spreadsheet engines can ignore whitespace before a formula prefix.
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

export function downloadChallengeCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false
  let url: string | null = null
  try {
    const content = '\ufeff' + [headers, ...rows].map(row => row.map(csvValue).join(',')).join('\r\n')
    url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = filename.replace(/[\\/\u0000-\u001f]/g, '_')
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url!), 1000)
    return true
  } catch { if (url) URL.revokeObjectURL(url); return false }
}

function printDocument(title: string, body: string): boolean {
  if (typeof window === 'undefined') return false
  const popup = window.open('', '_blank', 'width=1100,height=800')
  if (!popup) return false
  try {
    popup.opener = null
    popup.document.open()
    popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;color:#010028;margin:32px;line-height:1.6}h1{font-size:26px}h2{font-size:18px;margin-top:32px}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #d8d1fa;padding:8px;text-align:start;overflow-wrap:anywhere}th{background:#f2f0fe}.certificate{max-width:900px;margin:40px auto;border:4px solid #8062fd;padding:48px;text-align:center}.certificate h1{font-size:34px}.student{font-size:28px;font-weight:bold;color:#5b3fd9}.muted{color:#59566d}.certificate dl{display:grid;grid-template-columns:1fr 1fr;gap:16px}.certificate dd{margin:0;font-weight:bold}@media print{body{margin:16mm}thead{display:table-header-group}tr{break-inside:avoid}.certificate{margin:0;padding:30px}}</style></head><body>${body}</body></html>`)
    popup.document.body.dir = 'auto'
    popup.document.close()
    // No executable content is inserted into the print document.
    window.setTimeout(() => { if (!popup.closed) { popup.focus(); popup.print() } }, 150)
    return true
  } catch { popup.close(); return false }
}

export function printChallengeReport(title: string, sections: ChallengeReportSection[]): boolean {
  return printDocument(title, `<h1>${escapeHtml(title)}</h1>${sections.map(section => `<section><h2>${escapeHtml(section.heading)}</h2><table><thead><tr>${section.headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${section.rows.map(row => `<tr>${row.map(value => `<td>${escapeHtml(value)}</td>`).join('')}</tr>`).join('')}</tbody></table></section>`).join('')}`)
}

export function printChallengeCertificate(input: { competition: string; student: string; team: string; school: string; rank: string; score: string; date: string; title: string }): boolean {
  return printDocument(input.title, `<article class="certificate"><p class="muted">${escapeHtml(input.competition)}</p><h1>${escapeHtml(input.title)}</h1><p class="student" dir="auto">${escapeHtml(input.student)}</p><p dir="auto">${escapeHtml(input.school)} · ${escapeHtml(input.team)}</p><dl><div><dt>Rank / المركز</dt><dd>${escapeHtml(input.rank)}</dd></div><div><dt>Score / الدرجة</dt><dd>${escapeHtml(input.score)}</dd></div></dl><p class="muted">${escapeHtml(input.date)}</p></article>`)
}
