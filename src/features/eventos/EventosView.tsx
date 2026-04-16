import React from 'react'

type Evento = {
  id: number
  nome: string
  local?: string
  dataInicio: string
  dataFim?: string
  descricao?: string
  criadoEm?: string
}

type LeadLike = {
  eventoId?: number | null
  produto?: string
}

type Colors = {
  primary: string
  accent: string
  green: string
  red: string
  orange: string
  card: string
  text: string
  muted: string
}

type Props = {
  eventos: Evento[]
  leads: LeadLike[]
  eventoAtivo: Evento | null
  onSetAtivo: (evento: Evento | null) => void
  onAddEvento: (evento: Omit<Evento, 'id'>) => void
  onDeleteEvento: (id: number) => void
  colors: Colors
  palette: string[]
  fmtDate: (iso?: string) => string
  exportCSV: (leads: LeadLike[], filename?: string) => void
}

export default function EventosView({
  eventos,
  leads,
  eventoAtivo,
  onSetAtivo,
  onAddEvento,
  onDeleteEvento,
  colors,
  palette,
  fmtDate,
  exportCSV,
}: Props) {
  const [form, setForm] = React.useState({
    nome: '',
    local: '',
    dataInicio: '',
    dataFim: '',
    descricao: '',
  })
  const [showForm, setShowForm] = React.useState(false)
  const [err, setErr] = React.useState('')

  const handleAdd = () => {
    if (!form.nome.trim()) {
      setErr('Nome do evento é obrigatório')
      return
    }

    if (!form.dataInicio) {
      setErr('Data de início é obrigatória')
      return
    }

    onAddEvento({
      ...form,
      criadoEm: new Date().toLocaleString('pt-BR'),
    })

    setForm({
      nome: '',
      local: '',
      dataInicio: '',
      dataFim: '',
      descricao: '',
    })
    setShowForm(false)
    setErr('')
  }

  const inp = (field: keyof typeof form, ph: string, type = 'text') => (
    <input
      type={type}
      placeholder={ph}
      value={form[field]}
      onChange={(e) =>
        setForm((f) => ({
          ...f,
          [field]: e.target.value,
        }))
      }
      style={{
        width: '100%',
        padding: '10px 14px',
        borderRadius: 10,
        border: '1.5px solid #dde3ed',
        fontSize: 14,
        outline: 'none',
        color: colors.text,
        background: '#f9fbff',
        boxSizing: 'border-box',
      }}
    />
  )

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          background: eventoAtivo
            ? `linear-gradient(135deg,${colors.green}22,${colors.accent}22)`
            : 'rgba(255,255,255,0.08)',
          border: `2px solid ${eventoAtivo ? colors.green : `${colors.muted}44`}`,
          borderRadius: 16,
          padding: '16px 20px',
          marginTop: 20,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 28 }}>{eventoAtivo ? '🟢' : '⚪'}</span>

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: eventoAtivo ? colors.green : colors.muted,
            }}
          >
            EVENTO ATIVO
          </div>

          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: colors.primary,
              marginTop: 2,
            }}
          >
            {eventoAtivo ? eventoAtivo.nome : 'Nenhum evento selecionado'}
          </div>

          {eventoAtivo && (
            <div style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
              {eventoAtivo.local ? `📍 ${eventoAtivo.local} · ` : ''}
              {fmtDate(eventoAtivo.dataInicio)}
            </div>
          )}
        </div>

        {eventoAtivo && (
          <button
            onClick={() => onSetAtivo(null)}
            style={{
              padding: '6px 14px',
              borderRadius: 10,
              background: `${colors.red}15`,
              border: `1.5px solid ${colors.red}`,
              color: colors.red,
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Desativar
          </button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            padding: '9px 18px',
            borderRadius: 10,
            background: `linear-gradient(135deg,${colors.accent},${colors.primary})`,
            color: '#fff',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          {showForm ? '✕ Cancelar' : '+ Novo Evento'}
        </button>
      </div>

      {showForm && (
        <div
          style={{
            background: '#f8faff',
            border: `1.5px solid ${colors.accent}40`,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: colors.primary,
              marginBottom: 16,
            }}
          >
            📅 Novo Evento
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div style={{ gridColumn: '1/-1' }}>{inp('nome', 'Nome do evento *')}</div>
            {inp('local', 'Local / Cidade')}
            {inp('dataInicio', 'Data início *', 'date')}
            {inp('dataFim', 'Data fim', 'date')}
            <div style={{ gridColumn: '1/-1' }}>
              <textarea
                placeholder="Descrição (opcional)"
                value={form.descricao}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    descricao: e.target.value,
                  }))
                }
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1.5px solid #dde3ed',
                  fontSize: 14,
                  outline: 'none',
                  color: colors.text,
                  background: '#f9fbff',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  minHeight: 70,
                }}
              />
            </div>
          </div>

          {err && <div style={{ fontSize: 12, color: colors.red, marginBottom: 10 }}>{err}</div>}

          <button
            onClick={handleAdd}
            style={{
              padding: '10px 24px',
              borderRadius: 10,
              background: `linear-gradient(135deg,${colors.green},#059669)`,
              color: '#fff',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            ✅ Salvar Evento
          </button>
        </div>
      )}

      {eventos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: colors.muted }}>
          Nenhum evento cadastrado.
        </div>
      ) : (
        eventos.map((ev) => {
          const evLeads = leads.filter((l) => l.eventoId === ev.id)
          const isAtivo = !!eventoAtivo && eventoAtivo.id === ev.id
          const byProd: Record<string, number> = {}

          evLeads.forEach((l) => {
            const produto = l.produto || 'Sem produto'
            byProd[produto] = (byProd[produto] || 0) + 1
          })

          return (
            <div
              key={ev.id}
              style={{
                background: isAtivo ? `${colors.green}08` : '#fafbff',
                border: `2px solid ${isAtivo ? colors.green : '#eef0f5'}`,
                borderRadius: 16,
                padding: '18px 20px',
                marginBottom: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: colors.primary }}>
                      {ev.nome}
                    </div>
                    {isAtivo && (
                      <span
                        style={{
                          background: colors.green,
                          color: '#fff',
                          borderRadius: 20,
                          padding: '2px 10px',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        ATIVO
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: colors.muted,
                      marginTop: 4,
                      display: 'flex',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    {ev.local && <span>📍 {ev.local}</span>}
                    <span>
                      📅 {fmtDate(ev.dataInicio)}
                      {ev.dataFim ? ` → ${fmtDate(ev.dataFim)}` : ''}
                    </span>
                    <span>
                      👥 <strong style={{ color: colors.primary }}>{evLeads.length}</strong>{' '}
                      visitante{evLeads.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {evLeads.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                      {Object.entries(byProd).map(([p, n], i) => (
                        <span
                          key={p}
                          style={{
                            background: `${palette[i % palette.length]}18`,
                            color: palette[i % palette.length],
                            borderRadius: 20,
                            padding: '3px 10px',
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {p}: {n}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                  }}
                >
                  {!isAtivo ? (
                    <button
                      onClick={() => onSetAtivo(ev)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 10,
                        background: `${colors.green}15`,
                        border: `1.5px solid ${colors.green}`,
                        color: '#059669',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      ▶ Ativar
                    </button>
                  ) : (
                    <button
                      onClick={() => onSetAtivo(null)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 10,
                        background: `${colors.red}15`,
                        border: `1.5px solid ${colors.red}`,
                        color: colors.red,
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      ⏹ Desativar
                    </button>
                  )}

                  {evLeads.length > 0 && (
                    <button
                      onClick={() => exportCSV(evLeads, `leads_${ev.nome.replace(/\s/g, '_')}.csv`)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 10,
                        background: `${colors.accent}15`,
                        border: `1.5px solid ${colors.accent}`,
                        color: colors.primary,
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      ⬇ CSV
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteEvento(ev.id)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 10,
                      background: `${colors.red}10`,
                      border: `1.5px solid ${colors.red}30`,
                      color: colors.red,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}