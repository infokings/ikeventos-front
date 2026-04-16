import React from 'react'

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type LeadLike = {
  id: number
  nome: string
  profissao?: string
  email: string
  whatsapp: string
  empresa?: string
  produto: string
  eventoId?: number | null
  eventoNome?: string | null
  consultorId?: number | null
  consultorNome?: string | null
  timestamp?: string
}

type Evento = {
  id: number
  nome: string
}

type Consultor = {
  id: number
  nome: string
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
  leads: LeadLike[]
  produtos: string[]
  eventos: Evento[]
  consultores: Consultor[]
  colors: Colors
  palette: string[]
  exportCSV: (leads: LeadLike[], filename?: string) => void
}

export default function RelatoriosView({
  leads,
  produtos,
  eventos,
  consultores,
  colors,
  palette,
  exportCSV,
}: Props) {
  const [filters, setFilters] = React.useState({
    nome: '',
    email: '',
    whatsapp: '',
    empresa: '',
    profissao: '',
    eventoId: '',
    consultorId: '',
  })

  const [reportTab, setReportTab] = React.useState('tabela')

  const filtered = React.useMemo(
    () =>
      leads.filter((l) => {
        const n = filters.nome.toLowerCase()
        const e = filters.email.toLowerCase()
        const w = filters.whatsapp.replace(/\D/g, '')
        const emp = filters.empresa.toLowerCase()
        const prof = filters.profissao.toLowerCase()

        return (
          (!n || (l.nome || '').toLowerCase().includes(n)) &&
          (!e || (l.email || '').toLowerCase().includes(e)) &&
          (!w || (l.whatsapp || '').replace(/\D/g, '').includes(w)) &&
          (!emp || (l.empresa || '').toLowerCase().includes(emp)) &&
          (!prof || (l.profissao || '').toLowerCase().includes(prof)) &&
          (!filters.eventoId || String(l.eventoId) === filters.eventoId) &&
          (!filters.consultorId || String(l.consultorId) === filters.consultorId)
        )
      }),
    [leads, filters],
  )

  const byProduto = React.useMemo(
    () =>
      produtos
        .map((p, i) => ({
          name: p,
          value: filtered.filter((l) => l.produto === p).length,
          color: palette[i % palette.length],
        }))
        .filter((x) => x.value > 0),
    [filtered, produtos, palette],
  )

  const byEvento = React.useMemo(() => {
    const map: Record<string, number> = {}
    filtered.forEach((l) => {
      const k = l.eventoNome || 'Sem evento'
      map[k] = (map[k] || 0) + 1
    })
    return Object.entries(map)
      .map(([name, value], i) => ({ name, value, color: palette[i % palette.length] }))
      .sort((a, b) => b.value - a.value)
  }, [filtered, palette])

  const byConsultor = React.useMemo(() => {
    const map: Record<string, number> = {}
    filtered.forEach((l) => {
      const k = l.consultorNome || 'Não informado'
      map[k] = (map[k] || 0) + 1
    })
    return Object.entries(map)
      .map(([name, value], i) => ({ name, value, color: palette[i % palette.length] }))
      .sort((a, b) => b.value - a.value)
  }, [filtered, palette])

  const byProfissao = React.useMemo(() => {
    const map: Record<string, number> = {}
    filtered.forEach((l) => {
      const k = l.profissao || 'Não informado'
      map[k] = (map[k] || 0) + 1
    })
    return Object.entries(map)
      .map(([name, value], i) => ({ name, value, color: palette[i % palette.length] }))
      .sort((a, b) => b.value - a.value)
  }, [filtered, palette])

  const byEmpresa = React.useMemo(() => {
    const map: Record<string, number> = {}
    filtered.forEach((l) => {
      const k = l.empresa || 'Não informado'
      map[k] = (map[k] || 0) + 1
    })
    return Object.entries(map)
      .map(([name, value], i) => ({ name, value, color: palette[i % palette.length] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }, [filtered, palette])

  const hasFilter = Object.values(filters).some((v) => v.trim())

  const inp = (key: keyof typeof filters, ph: string) => (
    <input
      value={filters[key]}
      onChange={(e) =>
        setFilters((f) => ({
          ...f,
          [key]: e.target.value,
        }))
      }
      placeholder={ph}
      style={{
        padding: '9px 12px',
        borderRadius: 10,
        border: '1.5px solid #dde3ed',
        fontSize: 13,
        outline: 'none',
        color: colors.text,
        background: '#f9fbff',
        width: '100%',
        boxSizing: 'border-box',
      }}
    />
  )

  const tabs = [
    { key: 'tabela', label: '📋 Tabela' },
    { key: 'consultor', label: '👤 Consultor' },
    { key: 'evento', label: '📅 Evento' },
    { key: 'produto', label: '📦 Produto' },
    { key: 'profissao', label: '💼 Profissão' },
    { key: 'empresa', label: '🏢 Empresa' },
  ]

  const StatCards = ({
    data,
  }: {
    data: { name: string; value: number; color: string }[]
  }) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))',
        gap: 12,
        marginBottom: 24,
      }}
    >
      {data.map((d) => (
        <div
          key={d.name}
          style={{
            background: `${d.color}15`,
            border: `1.5px solid ${d.color}40`,
            borderRadius: 14,
            padding: 14,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 900, color: d.color }}>{d.value}</div>
          <div
            style={{
              fontSize: 11,
              color: colors.muted,
              fontWeight: 600,
              marginTop: 4,
              wordBreak: 'break-word',
            }}
          >
            {d.name}
          </div>
          <div style={{ fontSize: 11, color: d.color, fontWeight: 700, marginTop: 2 }}>
            {filtered.length > 0 ? Math.round((d.value / filtered.length) * 100) : 0}%
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          background: colors.card,
          borderRadius: 20,
          padding: 24,
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          marginTop: 24,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 800, color: colors.primary }}>🔍 Filtros</div>
          {hasFilter && (
            <button
              onClick={() =>
                setFilters({
                  nome: '',
                  email: '',
                  whatsapp: '',
                  empresa: '',
                  profissao: '',
                  eventoId: '',
                  consultorId: '',
                })
              }
              style={{
                background: `${colors.red}15`,
                border: `1px solid ${colors.red}40`,
                color: colors.red,
                borderRadius: 8,
                padding: '4px 12px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ✕ Limpar
            </button>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))',
            gap: 10,
          }}
        >
          {inp('nome', '🔎 Nome')}
          {inp('email', '✉️ E-mail')}
          {inp('whatsapp', '📱 WhatsApp')}
          {inp('empresa', '🏢 Empresa')}
          {inp('profissao', '💼 Profissão')}

          <select
            value={filters.eventoId}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                eventoId: e.target.value,
              }))
            }
            style={{
              padding: '9px 12px',
              borderRadius: 10,
              border: '1.5px solid #dde3ed',
              fontSize: 13,
              outline: 'none',
              color: colors.text,
              background: '#f9fbff',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <option value="">📅 Todos os eventos</option>
            {eventos.map((ev) => (
              <option key={ev.id} value={String(ev.id)}>
                {ev.nome}
              </option>
            ))}
          </select>

          <select
            value={filters.consultorId}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                consultorId: e.target.value,
              }))
            }
            style={{
              padding: '9px 12px',
              borderRadius: 10,
              border: '1.5px solid #dde3ed',
              fontSize: 13,
              outline: 'none',
              color: colors.text,
              background: '#f9fbff',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <option value="">👤 Todos os consultores</option>
            {consultores.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 12, fontSize: 13, color: colors.muted, fontWeight: 600 }}>
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          {hasFilter ? ` de ${leads.length} total` : ''}
        </div>
      </div>

      <div
        style={{
          background: colors.card,
          borderRadius: 20,
          padding: 24,
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 4,
            marginBottom: 20,
            flexWrap: 'wrap',
            borderBottom: '2px solid #eef0f5',
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setReportTab(t.key)}
              style={{
                padding: '8px 12px',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                border: 'none',
                background: 'none',
                color: reportTab === t.key ? colors.primary : colors.muted,
                borderBottom:
                  reportTab === t.key ? `3px solid ${colors.primary}` : '3px solid transparent',
                marginBottom: -2,
              }}
            >
              {t.label}
            </button>
          ))}

          <button
            onClick={() => exportCSV(filtered, `leads_${Date.now()}.csv`)}
            style={{
              marginLeft: 'auto',
              padding: '7px 12px',
              borderRadius: 10,
              background: `${colors.green}20`,
              border: `1.5px solid ${colors.green}`,
              color: '#059669',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            ⬇ CSV ({filtered.length})
          </button>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: colors.muted }}>
            Nenhum resultado encontrado.
          </div>
        )}

        {reportTab === 'tabela' && filtered.length > 0 && (
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #eef0f5' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {[
                    'Nome',
                    'Profissão',
                    'E-mail',
                    'WhatsApp',
                    'Empresa',
                    'Produto',
                    'Evento',
                    'Consultor',
                    'Data',
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        background: `${colors.primary}10`,
                        color: colors.primary,
                        fontWeight: 700,
                        padding: '10px 12px',
                        textAlign: 'left',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id}>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f0f2f7', fontWeight: 700 }}>
                      {l.nome}
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f0f2f7', color: colors.muted }}>
                      {l.profissao || '—'}
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f0f2f7' }}>{l.email}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f0f2f7' }}>{l.whatsapp}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f0f2f7' }}>{l.empresa || '—'}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f0f2f7' }}>
                      <span
                        style={{
                          background: `${palette[0]}18`,
                          color: palette[0],
                          borderRadius: 6,
                          padding: '2px 8px',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {l.produto}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        borderBottom: '1px solid #f0f2f7',
                        fontSize: 12,
                        color: colors.muted,
                      }}
                    >
                      {l.eventoNome || '—'}
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        borderBottom: '1px solid #f0f2f7',
                        fontSize: 12,
                        color: colors.muted,
                      }}
                    >
                      {l.consultorNome || '—'}
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        borderBottom: '1px solid #f0f2f7',
                        fontSize: 11,
                        color: colors.muted,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {l.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportTab === 'consultor' &&
          (byConsultor.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: colors.muted }}>
              Nenhum dado disponível.
            </div>
          ) : (
            <div>
              <StatCards data={byConsultor} />
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byConsultor} margin={{ top: 0, right: 10, left: -10, bottom: 40 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Leads" radius={[8, 8, 0, 0]}>
                    {byConsultor.map((c, i) => (
                      <Cell key={i} fill={c.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ))}

        {reportTab === 'evento' &&
          (byEvento.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: colors.muted }}>
              Nenhum dado disponível.
            </div>
          ) : (
            <div>
              <StatCards data={byEvento} />
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byEvento} margin={{ top: 0, right: 10, left: -10, bottom: 40 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Visitantes" radius={[8, 8, 0, 0]}>
                    {byEvento.map((p, i) => (
                      <Cell key={i} fill={p.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ))}

        {reportTab === 'produto' && filtered.length > 0 && (
          <div>
            <StatCards data={byProduto} />
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byProduto} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="Leads" radius={[8, 8, 0, 0]}>
                  {byProduto.map((p, i) => (
                    <Cell key={i} fill={p.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {reportTab === 'profissao' && filtered.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 24,
              alignItems: 'center',
            }}
          >
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={byProfissao}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label={({ percent }) => `${Math.round((percent ?? 0) * 100)}%`}
                  labelLine={false}
                >
                  {byProfissao.map((p, i) => (
                    <Cell key={i} fill={p.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} leads`, n]} />
              </PieChart>
            </ResponsiveContainer>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {byProfissao.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      background: p.color,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ fontSize: 13, flex: 1 }}>{p.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reportTab === 'empresa' &&
          (byEmpresa.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: colors.muted }}>
              Nenhuma empresa registrada.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(200, byEmpresa.length * 44)}>
              <BarChart data={byEmpresa} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                <Tooltip />
                <Bar dataKey="value" name="Leads" radius={[0, 8, 8, 0]}>
                  {byEmpresa.map((_, i) => (
                    <Cell key={i} fill={palette[i % palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ))}
      </div>
    </div>
  )
}