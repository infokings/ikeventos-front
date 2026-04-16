import type { Lead } from '../types/lead'

export function exportCSV(leads: Array<Partial<Lead>>, filename?: string) {
  const h = ['Nome', 'Profissão', 'E-mail', 'WhatsApp', 'Empresa', 'Produto', 'Evento', 'Consultor', 'Data/Hora']
  const rows = leads.map((l) => [
    l.nome,
    l.profissao,
    l.email,
    l.whatsapp,
    l.empresa,
    l.produto,
    l.eventoNome || '—',
    l.consultorNome || '—',
    l.timestamp,
  ])
  const csv = [h, ...rows]
    .map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `leads_${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
