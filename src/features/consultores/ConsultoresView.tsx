import React from 'react'

type LeadLike = {
  consultorId?: number | null
  produto?: string
}

type Consultor = {
  id: number
  nome: string
  email?: string
  whatsapp?: string
  cargo?: string
  ativo: boolean
  criadoEm?: string
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
  consultores: Consultor[]
  leads: LeadLike[]
  onAdd: (consultor: Omit<Consultor, 'id'>) => void
  onDelete: (id: number) => void
  onToggle: (id: number) => void
  colors: Colors
  palette: string[]
}

export default function ConsultoresView({
  consultores,
  leads,
  onAdd,
  onDelete,
  onToggle,
  colors,
  palette,
}: Props) {
  const [form, setForm] = React.useState({
    nome: '',
    email: '',
    whatsapp: '',
    cargo: '',
  })
  const [showForm, setShowForm] = React.useState(false)
  const [err, setErr] = React.useState('')

  const handleAdd = () => {
    if (!form.nome.trim()) {
      setErr('Nome é obrigatório')
      return
    }

    onAdd({
      ...form,
      ativo: true,
      criadoEm: new Date().toLocaleString('pt-BR'),
    })

    setForm({ nome: '', email: '', whatsapp: '', cargo: '' })
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
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 20,
          marginBottom: 12,
        }}
      >
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
          {showForm ? '✕ Cancelar' : '+ Novo Consultor'}
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
            👤 Cadastrar Consultor
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div style={{ gridColumn: '1/-1' }}>{inp('nome', 'Nome completo *')}</div>
            {inp('cargo', 'Cargo / Função')}
            {inp('email', 'E-mail', 'email')}
            <div style={{ gridColumn: '1/-1' }}>{inp('whatsapp', 'WhatsApp')}</div>
          </div>

          {err && (
            <div style={{ fontSize: 12, color: colors.red, marginBottom: 10 }}>{err}</div>
          )}

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
            ✅ Salvar
          </button>
        </div>
      )}

      {consultores.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: colors.muted }}>
          Nenhum consultor cadastrado.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))',
            gap: 14,
            marginTop: 8,
          }}
        >
          {consultores.map((c, idx) => {
            const cLeads = leads.filter((l) => l.consultorId === c.id)
            const byProd: Record<string, number> = {}
            cLeads.forEach((l) => {
              const produto = l.produto || 'Sem produto'
              byProd[produto] = (byProd[produto] || 0) + 1
            })

            const cor = palette[idx % palette.length]

            return (
              <div
                key={c.id}
                style={{
                  background: c.ativo ? '#fafbff' : '#f5f5f5',
                  border: `2px solid ${c.ativo ? `${cor}55` : '#e0e0e0'}`,
                  borderRadius: 16,
                  padding: '18px 20px',
                  opacity: c.ativo ? 1 : 0.7,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: `${cor}22`,
                        border: `2px solid ${cor}44`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        fontWeight: 800,
                        color: cor,
                        flexShrink: 0,
                      }}
                    >
                      {c.nome.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: colors.primary }}>
                        {c.nome}
                      </div>
                      {c.cargo && (
                        <div style={{ fontSize: 12, color: colors.muted, marginTop: 1 }}>
                          {c.cargo}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => onToggle(c.id)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 8,
                        background: c.ativo ? `${colors.green}18` : `${colors.orange}18`,
                        border: `1.5px solid ${c.ativo ? colors.green : colors.orange}`,
                        color: c.ativo ? '#059669' : colors.orange,
                        fontWeight: 700,
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      {c.ativo ? '✓ Ativo' : 'Inativo'}
                    </button>

                    <button
                      onClick={() => onDelete(c.id)}
                      style={{
                        padding: '5px 8px',
                        borderRadius: 8,
                        background: `${colors.red}12`,
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

                <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                  {c.email && <span style={{ fontSize: 12, color: colors.accent }}>✉️ {c.email}</span>}
                  {c.whatsapp && (
                    <span style={{ fontSize: 12, color: colors.muted }}>📱 {c.whatsapp}</span>
                  )}
                </div>

                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #eef0f5' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 12, color: colors.muted, fontWeight: 600 }}>
                      Leads captados
                    </span>
                    <span style={{ fontSize: 20, fontWeight: 900, color: cor }}>
                      {cLeads.length}
                    </span>
                  </div>

                  {cLeads.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {Object.entries(byProd).map(([p, n], i) => (
                        <span
                          key={p}
                          style={{
                            background: `${palette[i % palette.length]}18`,
                            color: palette[i % palette.length],
                            borderRadius: 20,
                            padding: '2px 8px',
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          {p}: {n}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}