import { useEffect, useState } from 'react'
import CrudSection from '../components/shared/CrudSection'
import ConsultoresView from '../features/consultores/ConsultoresView'
import EventosView from '../features/eventos/EventosView'
import RelatoriosView from '../features/relatorios/RelatoriosView'
import { useAppView } from './useAppView'
import { VIEWS } from './app-view'
import { cadastrosService } from '../services/cadastros.service'
import { consultoresService } from '../services/consultores.service'
import { eventosService } from '../services/eventos.service'
import { leadsService } from '../services/leads.service'
import { COLORS as C, PALETTE, PASSWORD } from '../utils/constants'
import { exportCSV } from '../utils/exportCSV'
import { fmtDate, formatPhone } from '../utils/format'
import type { Lead, LeadFormData } from '../types/lead'
import type { Evento, EventoInput } from '../types/evento'
import type { Consultor, ConsultorInput } from '../types/consultor'
import type { CadastroItem } from '../types/cadastro-item'
import { authService } from '../services/auth.service'

function buildWA(lead: Partial<Lead>) {
  return encodeURIComponent(
    `Olá, ${lead.nome}! 😊\n\nFoi um prazer ter você no stand da *InfoKings*${lead.eventoNome ? ` no *${lead.eventoNome}*` : ''}!\n\nFicamos felizes com seu interesse no *${lead.produto}* e entraremos em contato em breve.\n\nQualquer dúvida, é só chamar! 🚀\n\n*InfoKings — Soluções em Controle de Ponto e Acesso*\n📞 (21) 2221-4155`,
  )
}

function buildEmail(lead: Partial<Lead>) {
  const sub = encodeURIComponent(`Obrigado pela sua visita, ${lead.nome}! | InfoKings`)
  const body = encodeURIComponent(
    `Olá, ${lead.nome}!\n\nFoi um prazer receber você no stand da InfoKings${lead.eventoNome ? ` no ${lead.eventoNome}` : ''}!\n\nAgradecemos seu interesse no ${lead.produto}. Em breve, um consultor entrará em contato.\n\n📞 (21) 2221-4155\n🌐 www.infokings.com.br\n\nEquipe InfoKings`,
  )
  return `mailto:${lead.email}?subject=${sub}&body=${body}`
}

export default function App() {
  const { currentView, successLead, needsLock, goTo, goToSuccess, resetToForm } = useAppView()

  const [leads, setLeads] = useState<Lead[]>([])
  const [empresas, setEmpresas] = useState<CadastroItem[]>([])
  const [produtos, setProdutos] = useState<CadastroItem[]>([])
  const [profissoes, setProfissoes] = useState<CadastroItem[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [eventoAtivo, setEventoAtivo] = useState<Evento | null>(null)
  const [consultores, setConsultores] = useState<Consultor[]>([])
  const [empresaManual, setEmpresaManual] = useState(false)

  const [form, setForm] = useState<LeadFormData>({
    nome: '',
    profissao: '',
    email: '',
    whatsapp: '',
    empresa: '',
    produto: '',
    eventoId: null,
    eventoNome: null,
    consultorId: null,
    consultorNome: null,
    timestamp: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loginForm, setLoginForm] = useState({
    login: '',
    senha: '',
  })
  const [adminUnlocked, setAdminUnlocked] = useState(false)
  const [passError, setPassError] = useState(false)
  const [cadastrosTab, setCadastrosTab] =
    useState<'empresas' | 'produtos' | 'profissoes'>('empresas')
  const [filterProd, setFilterProd] = useState('Todos')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [rLeads, rEmpresas, rProdutos, rProfissoes, rEventos, rConsultores] =
          await Promise.all([
            leadsService.listar(),
            cadastrosService.listarEmpresas(),
            cadastrosService.listarProdutos(),
            cadastrosService.listarProfissoes(),
            eventosService.listar(),
            consultoresService.listar(),
          ])

        setLeads(rLeads)
        setEmpresas(rEmpresas)
        setProdutos(rProdutos)
        setProfissoes(rProfissoes)
        setEventos(rEventos)
        setConsultores(rConsultores)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const handleAddEmpresa = async (nome: string) => {
    try {
      const nova = await cadastrosService.salvarEmpresa({ nome })
      setEmpresas((prev) => [...prev, nova])
    } catch (error) {
      console.error('Erro ao salvar empresa:', error)
    }
  }

  const handleDeleteEmpresa = async (id: number) => {
    try {
      await cadastrosService.excluirEmpresa(id)
      setEmpresas((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      console.error('Erro ao excluir empresa:', error)
    }
  }

  const handleAddProduto = async (nome: string) => {
    try {
      const novo = await cadastrosService.salvarProduto({ nome })
      setProdutos((prev) => [...prev, novo])
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
    }
  }

  const handleDeleteProduto = async (id: number) => {
    try {
      await cadastrosService.excluirProduto(id)
      setProdutos((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
    }
  }

  const handleAddProfissao = async (nome: string) => {
    try {
      const nova = await cadastrosService.salvarProfissao({ nome })
      setProfissoes((prev) => [...prev, nova])
    } catch (error) {
      console.error('Erro ao salvar profissão:', error)
    }
  }

  const handleDeleteProfissao = async (id: number) => {
    try {
      await cadastrosService.excluirProfissao(id)
      setProfissoes((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      console.error('Erro ao excluir profissão:', error)
    }
  }

  const handleSetAtivo = (ev: Evento | null) => setEventoAtivo(ev)

  const handleAddEvento = async (ev: EventoInput) => {
    try {
      const saved = await eventosService.salvar(ev)
      setEventos((prev) => [saved, ...prev])
    } catch {
      setEventos((prev) => [{ ...ev, id: Date.now() }, ...prev])
    }
  }

  const handleDeleteEvento = async (id: number) => {
    try {
      await eventosService.excluir(id)
    } catch (error) {
      console.error(error)
    }
    setEventos((prev) => prev.filter((item) => item.id !== id))
    if (eventoAtivo?.id === id) setEventoAtivo(null)
  }

  const handleAddConsultor = async (consultor: ConsultorInput) => {
    try {
      const saved = await consultoresService.salvar(consultor)
      setConsultores((prev) => [saved, ...prev])
    } catch {
      setConsultores((prev) => [{ ...consultor, id: Date.now() }, ...prev])
    }
  }

  const handleDeleteConsultor = async (id: number) => {
    try {
      await consultoresService.excluir(id)
    } catch (error) {
      console.error(error)
    }
    setConsultores((prev) => prev.filter((item) => item.id !== id))
  }

  const handleToggleConsultor = async (id: number) => {
    const target = consultores.find((item) => item.id === id)
    if (!target) return

    const updated = { ...target, ativo: !target.ativo }
    try {
      await consultoresService.atualizar(id, updated)
    } catch (error) {
      console.error(error)
    }
    setConsultores((prev) => prev.map((item) => (item.id === id ? updated : item)))
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (!form.nome.trim()) nextErrors.nome = 'Nome obrigatório'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = 'E-mail inválido'
    if (!form.whatsapp.trim() || form.whatsapp.replace(/\D/g, '').length < 10) {
      nextErrors.whatsapp = 'WhatsApp inválido'
    }
    if (!form.produto) nextErrors.produto = 'Selecione um produto'
    if (eventos.length > 0 && !form.eventoId) nextErrors.evento = 'Selecione o evento'
    if (consultores.some((item) => item.ativo) && !form.consultorId) {
      nextErrors.consultor = 'Selecione o consultor'
    }
    return nextErrors
  }

  const handleSubmit = async () => {
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSaving(true)
    const payload: LeadFormData = {
      ...form,
      timestamp: new Date().toLocaleString('pt-BR'),
    }

    try {
      const saved = await leadsService.salvar(payload)
      setLeads((prev) => [saved, ...prev])
      goToSuccess(saved)
    } catch {
      const fallback: Lead = { ...payload, id: Date.now() }
      setLeads((prev) => [fallback, ...prev])
      goToSuccess(fallback)
    } finally {
      const { eventoId, eventoNome, consultorId, consultorNome } = payload
      setForm({
        nome: '',
        profissao: '',
        email: '',
        whatsapp: '',
        empresa: '',
        produto: '',
        eventoId,
        eventoNome,
        consultorId,
        consultorNome,
        timestamp: '',
      })
      setErrors({})
      setEmpresaManual(false)
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await leadsService.excluir(id)
    } catch (error) {
      console.error(error)
    }
    setLeads((prev) => prev.filter((item) => item.id !== id))
  }

  const tryAdmin = async () => {
    try {
      const response = await authService.login(loginForm)
      localStorage.setItem('token', response.token)
      setAdminUnlocked(true)
      setPassError(false)
    } catch (error) {
      console.error(error)
      setPassError(true)
    }
  }

  const filtLeads =
    filterProd === 'Todos'
      ? leads
      : leads.filter((lead) => lead.produto === filterProd)

  const countByProd = produtos.reduce<Record<string, number>>((acc, produto) => {
    acc[produto.nome] = leads.filter((lead) => lead.produto === produto.nome).length
    return acc
  }, {})

  const consultoresAtivos = consultores.filter((item) => item.ativo)

  const S = {
    wrap: {
      minHeight: '100vh',
      background: `linear-gradient(135deg,${C.primary} 0%,#0d2347 100%)`,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      paddingBottom: 40,
    },
    header: {
      width: '100%',
      background: 'rgba(255,255,255,0.06)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxSizing: 'border-box' as const,
      flexWrap: 'wrap' as const,
      gap: 8,
    },
    hBtn: (active: boolean) => ({
      background: active ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      color: '#fff',
      padding: '6px 10px',
      borderRadius: 8,
      cursor: 'pointer',
      fontSize: 11,
      fontWeight: 600,
      whiteSpace: 'nowrap' as const,
    }),
    card: {
      background: C.card,
      borderRadius: 20,
      padding: '28px 20px',
      width: '100%',
      maxWidth: 480,
      boxSizing: 'border-box' as const,
      boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
      marginTop: 24,
    },
    bigCard: {
      background: C.card,
      borderRadius: 20,
      padding: '24px 20px',
      width: '100%',
      maxWidth: 960,
      boxSizing: 'border-box' as const,
      boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
      marginTop: 24,
    },
    label: {
      display: 'block',
      fontSize: 13,
      fontWeight: 700,
      color: C.primary,
      marginBottom: 6,
    },
    inp: (err?: string) => ({
      width: '100%',
      padding: '12px 14px',
      borderRadius: 10,
      border: `1.5px solid ${err ? C.red : '#dde3ed'}`,
      fontSize: 15,
      outline: 'none',
      boxSizing: 'border-box' as const,
      color: C.text,
      background: '#f9fbff',
    }),
    sel: (err?: string) => ({
      width: '100%',
      padding: '12px 14px',
      borderRadius: 10,
      border: `1.5px solid ${err ? C.red : '#dde3ed'}`,
      fontSize: 15,
      outline: 'none',
      boxSizing: 'border-box' as const,
      color: C.text,
      background: '#f9fbff',
    }),
    errT: { fontSize: 12, color: C.red, marginTop: 4 },
    fw: { marginBottom: 18 },
    btn: (bg: string, dis?: boolean) => ({
      width: '100%',
      padding: 14,
      borderRadius: 12,
      background: dis ? '#ccc' : bg,
      color: '#fff',
      fontWeight: 800,
      fontSize: 16,
      border: 'none',
      cursor: dis ? 'not-allowed' : 'pointer',
      marginTop: 8,
    }),
    prodGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))',
      gap: 10,
      marginBottom: 4,
    },
    prodBtn: (selected: boolean) => ({
      padding: '10px 8px',
      borderRadius: 10,
      border: `2px solid ${selected ? C.primary : '#dde3ed'}`,
      background: selected ? `${C.primary}12` : '#f9fbff',
      color: selected ? C.primary : C.muted,
      fontWeight: 700,
      fontSize: 13,
      cursor: 'pointer',
      textAlign: 'center' as const,
    }),
    subTab: (selected: boolean) => ({
      padding: '7px 14px',
      borderRadius: 20,
      border: `1.5px solid ${selected ? C.accent : '#dde3ed'}`,
      background: selected ? `${C.accent}18` : '#f9fbff',
      color: selected ? C.primary : C.muted,
      fontWeight: 700,
      fontSize: 12,
      cursor: 'pointer',
    }),
    th: {
      background: `${C.primary}10`,
      color: C.primary,
      fontWeight: 700,
      padding: '10px 12px',
      textAlign: 'left' as const,
      whiteSpace: 'nowrap' as const,
    },
    td: {
      padding: '10px 12px',
      borderBottom: '1px solid #f0f2f7',
      color: C.text,
      verticalAlign: 'top' as const,
    },
  }

  const HeaderBtns = () => (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
      {adminUnlocked ? (
        <>
          <button style={S.hBtn(currentView === VIEWS.form)} onClick={() => goTo(VIEWS.form)}>
            📝 Form
          </button>
          <button style={S.hBtn(currentView === VIEWS.admin)} onClick={() => goTo(VIEWS.admin)}>
            📋 Leads
          </button>
          <button style={S.hBtn(currentView === VIEWS.eventos)} onClick={() => goTo(VIEWS.eventos)}>
            📅 Eventos
          </button>
          <button
            style={S.hBtn(currentView === VIEWS.consultores)}
            onClick={() => goTo(VIEWS.consultores)}
          >
            👤 Consultores
          </button>
          <button
            style={S.hBtn(currentView === VIEWS.relatorios)}
            onClick={() => goTo(VIEWS.relatorios)}
          >
            📊 Relatórios
          </button>
          <button
            style={S.hBtn(currentView === VIEWS.cadastros)}
            onClick={() => goTo(VIEWS.cadastros)}
          >
            ⚙️ Cadastros
          </button>
          <button
            style={{ ...S.hBtn(false), color: '#f87171' }}
            onClick={() => {
              setAdminUnlocked(false)
              setLoginForm({
                login: '',
                senha: '',
              })
              goTo(VIEWS.form)
            }}
          >
            Sair
          </button>
        </>
      ) : (
        <button style={S.hBtn(false)} onClick={() => goTo(VIEWS.admin)}>
          ⚙ Admin
        </button>
      )}
    </div>
  )

  if (loading) {
    return (
      <div style={{ ...S.wrap, justifyContent: 'center' }}>
        <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginTop: 80 }}>
          Carregando...
        </div>
      </div>
    )
  }

  if (currentView === VIEWS.success) {
    const lead = successLead ?? {}
    const wNum = String(lead.whatsapp || '').replace(/\D/g, '')

    return (
      <div style={S.wrap}>
        <div style={S.header}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>
            Info<span style={{ color: C.accent }}>Kings</span>
          </span>
          <HeaderBtns />
        </div>

        <div style={S.card}>
          <div style={{ fontSize: 52, textAlign: 'center', marginBottom: 12 }}>🎉</div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: C.green,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            Cadastro realizado!
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: 16,
            }}
          >
            {lead.eventoNome && (
              <span
                style={{
                  background: `${C.accent}20`,
                  color: C.primary,
                  borderRadius: 20,
                  padding: '4px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                📅 {lead.eventoNome}
              </span>
            )}
            {lead.consultorNome && (
              <span
                style={{
                  background: `${C.green}20`,
                  color: '#059669',
                  borderRadius: 20,
                  padding: '4px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                👤 {lead.consultorNome}
              </span>
            )}
          </div>

          <div
            style={{
              fontSize: 14,
              color: C.muted,
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            Envie a mensagem de agradecimento para <strong>{lead.nome}</strong>:
          </div>

          <a
            href={`https://wa.me/55${wNum}?text=${buildWA(lead)}`}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: '#25d36615',
                border: '2px solid #25d366',
                borderRadius: 14,
                padding: '14px 16px',
                marginBottom: 10,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 28 }}>💬</span>
              <div>
                <div style={{ fontWeight: 800, color: '#128C7E', fontSize: 14 }}>
                  Enviar pelo WhatsApp
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                  {lead.whatsapp}
                </div>
              </div>
              <span style={{ marginLeft: 'auto' }}>→</span>
            </div>
          </a>

          <a href={buildEmail(lead)} style={{ textDecoration: 'none' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: `${C.accent}15`,
                border: `2px solid ${C.accent}`,
                borderRadius: 14,
                padding: '14px 16px',
                marginBottom: 22,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 28 }}>📧</span>
              <div>
                <div style={{ fontWeight: 800, color: C.primary, fontSize: 14 }}>
                  Enviar por E-mail
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{lead.email}</div>
              </div>
              <span style={{ marginLeft: 'auto' }}>→</span>
            </div>
          </a>

          <button
            style={S.btn(`linear-gradient(135deg,${C.accent},${C.primary})`)}
            onClick={resetToForm}
          >
            ＋ Novo cadastro
          </button>
        </div>
      </div>
    )
  }

  if (needsLock && !adminUnlocked) {
    return (
      <div style={S.wrap}>
        <div style={S.header}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>
            Info<span style={{ color: C.accent }}>Kings</span>
          </span>
          <button style={S.hBtn(false)} onClick={() => goTo(VIEWS.form)}>
            ← Voltar
          </button>
        </div>

        <div style={{ ...S.card, maxWidth: 360, textAlign: 'center' }}>
  <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
  <div style={{ fontSize: 18, fontWeight: 800, color: C.primary, marginBottom: 20 }}>
    Área Restrita
  </div>

  <div style={{ ...S.fw, marginBottom: 12 }}>
    <input
      style={S.inp()}
      type="text"
      placeholder="Login"
      value={loginForm.login}
      onChange={(e) => {
        setLoginForm((prev) => ({ ...prev, login: e.target.value }))
        setPassError(false)
      }}
    />
  </div>

  <div style={{ ...S.fw, marginBottom: 0 }}>
    <input
      style={S.inp(passError ? '1' : undefined)}
      type="password"
      placeholder="Senha de acesso"
      value={loginForm.senha}
      onChange={(e) => {
        setLoginForm((prev) => ({ ...prev, senha: e.target.value }))
        setPassError(false)
      }}
      onKeyDown={(e) => e.key === 'Enter' && tryAdmin()}
    />
  </div>

  {passError && <div style={S.errT}>Login ou senha inválidos</div>}

  <button
    style={S.btn(`linear-gradient(135deg,${C.primary},#0d2347)`)}
    onClick={tryAdmin}
  >
    Entrar
  </button>
</div>
      </div>
    )
  }

  if (currentView === VIEWS.admin && adminUnlocked) {
    return (
      <div style={S.wrap}>
        <div style={S.header}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>
            Info<span style={{ color: C.accent }}>Kings</span>
          </span>
          <HeaderBtns />
        </div>

        <div style={S.bigCard}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(produtos.length + 1, 5)},1fr)`,
              gap: 10,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                background: `${C.accent}15`,
                border: `1.5px solid ${C.accent}40`,
                borderRadius: 14,
                padding: 14,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 900, color: C.primary }}>
                {leads.length}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: C.muted,
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
                Total
              </div>
            </div>

            {produtos.map((p, i) => (
              <div
                key={p.id}
                style={{
                  background: `${PALETTE[i % PALETTE.length]}15`,
                  border: `1.5px solid ${PALETTE[i % PALETTE.length]}40`,
                  borderRadius: 14,
                  padding: 14,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 900,
                    color: PALETTE[i % PALETTE.length],
                  }}
                >
                  {countByProd[p.nome] || 0}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: C.muted,
                    fontWeight: 600,
                    marginTop: 2,
                  }}
                >
                  {p.nome}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {['Todos', ...produtos.map((p) => p.nome)].map((p) => (
              <button
                key={p}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: `1.5px solid ${filterProd === p ? C.primary : '#dde3ed'}`,
                  background: filterProd === p ? C.primary : '#fff',
                  color: filterProd === p ? '#fff' : C.muted,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
                onClick={() => setFilterProd(p)}
              >
                {p}
              </button>
            ))}

            <button
              style={{
                marginLeft: 'auto',
                padding: '6px 14px',
                borderRadius: 20,
                background: `${C.green}20`,
                border: `1.5px solid ${C.green}`,
                color: '#059669',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
              onClick={() => exportCSV(leads, 'todos_leads.csv')}
            >
              ⬇ CSV
            </button>
          </div>

          {filtLeads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>
              Nenhum lead cadastrado.
            </div>
          ) : (
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
                      <th key={h} style={S.th}>
                        {h}
                      </th>
                    ))}
                    <th style={S.th}></th>
                  </tr>
                </thead>

                <tbody>
                  {filtLeads.map((l) => (
                    <tr key={l.id}>
                      <td style={{ ...S.td, fontWeight: 700 }}>{l.nome}</td>
                      <td style={{ ...S.td, color: C.muted }}>{l.profissao || '—'}</td>
                      <td style={S.td}>{l.email}</td>
                      <td style={S.td}>{l.whatsapp}</td>
                      <td style={S.td}>{l.empresa || '—'}</td>
                      <td style={S.td}>
                        <span
                          style={{
                            background: `${PALETTE[0]}18`,
                            color: PALETTE[0],
                            borderRadius: 6,
                            padding: '2px 8px',
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {l.produto}
                        </span>
                      </td>
                      <td style={{ ...S.td, fontSize: 12, color: C.muted }}>
                        {l.eventoNome || '—'}
                      </td>
                      <td style={{ ...S.td, fontSize: 12, color: C.muted }}>
                        {l.consultorNome || '—'}
                      </td>
                      <td
                        style={{
                          ...S.td,
                          fontSize: 11,
                          color: C.muted,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {l.timestamp}
                      </td>
                      <td style={S.td}>
                        <button
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: C.red,
                            fontSize: 16,
                          }}
                          onClick={() => handleDelete(l.id)}
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (currentView === VIEWS.consultores && adminUnlocked) {
    return (
      <div style={S.wrap}>
        <div style={S.header}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>
            Info<span style={{ color: C.accent }}>Kings</span>
          </span>
          <HeaderBtns />
        </div>

        <div style={{ width: '100%', maxWidth: 900, boxSizing: 'border-box', padding: '0 12px' }}>
          <ConsultoresView
            consultores={consultores}
            leads={leads}
            onAdd={handleAddConsultor}
            onDelete={handleDeleteConsultor}
            onToggle={handleToggleConsultor}
            colors={C}
            palette={PALETTE}
          />
        </div>
      </div>
    )
  }

  if (currentView === VIEWS.eventos && adminUnlocked) {
    return (
      <div style={S.wrap}>
        <div style={S.header}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>
            Info<span style={{ color: C.accent }}>Kings</span>
          </span>
          <HeaderBtns />
        </div>

        <div style={{ width: '100%', maxWidth: 860, boxSizing: 'border-box', padding: '0 12px' }}>
          <EventosView
            eventos={eventos}
            leads={leads}
            eventoAtivo={eventoAtivo}
            onSetAtivo={handleSetAtivo}
            onAddEvento={handleAddEvento}
            onDeleteEvento={handleDeleteEvento}
            colors={C}
            palette={PALETTE}
            fmtDate={fmtDate}
            exportCSV={exportCSV}
          />
        </div>
      </div>
    )
  }

  if (currentView === VIEWS.relatorios && adminUnlocked) {
    return (
      <div style={S.wrap}>
        <div style={S.header}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>
            Info<span style={{ color: C.accent }}>Kings</span>
          </span>
          <HeaderBtns />
        </div>

        <div style={{ width: '100%', maxWidth: 960, boxSizing: 'border-box', padding: '0 12px' }}>
          <RelatoriosView
            leads={leads}
            produtos={produtos.map((p) => p.nome)}
            eventos={eventos}
            consultores={consultores}
            colors={C}
            palette={PALETTE}
            exportCSV={exportCSV}
          />
        </div>
      </div>
    )
  }

  if (currentView === VIEWS.cadastros && adminUnlocked) {
    return (
      <div style={S.wrap}>
        <div style={S.header}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>
            Info<span style={{ color: C.accent }}>Kings</span>
          </span>
          <HeaderBtns />
        </div>

        <div style={S.bigCard}>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.primary, marginBottom: 20 }}>
            ⚙️ Gerenciar Cadastros
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {[
              { k: 'empresas', l: '🏢 Empresas' },
              { k: 'produtos', l: '📦 Produtos' },
              { k: 'profissoes', l: '💼 Profissões' },
            ].map((t) => (
              <button
                key={t.k}
                style={S.subTab(cadastrosTab === t.k)}
                onClick={() => setCadastrosTab(t.k as 'empresas' | 'produtos' | 'profissoes')}
              >
                {t.l}
              </button>
            ))}
          </div>

          {cadastrosTab === 'empresas' && (
            <CrudSection
              title="Empresas / Condomínios"
              icon="🏢"
              items={empresas}
              onAdd={handleAddEmpresa}
              onDelete={handleDeleteEmpresa}
              placeholder="Nome da empresa ou condomínio..."
              colors={C}
            />
          )}

          {cadastrosTab === 'produtos' && (
            <CrudSection
              title="Produtos de Interesse"
              icon="📦"
              items={produtos}
              onAdd={handleAddProduto}
              onDelete={handleDeleteProduto}
              placeholder="Nome do produto..."
              colors={C}
            />
          )}

          {cadastrosTab === 'profissoes' && (
            <CrudSection
              title="Profissões / Cargos"
              icon="💼"
              items={profissoes}
              onAdd={handleAddProfissao}
              onDelete={handleDeleteProfissao}
              placeholder="Ex: Síndico, Gestor de RH..."
              colors={C}
            />
          )}

          <div
            style={{
              marginTop: 8,
              padding: '14px 16px',
              background: `${C.accent}10`,
              borderRadius: 12,
              fontSize: 13,
              color: C.muted,
            }}
          >
            💡 Alterações refletem automaticamente no formulário.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>
          Info<span style={{ color: C.accent }}>Kings</span>
        </span>
        <HeaderBtns />
      </div>

      {eventoAtivo && (
        <div style={{ width: '100%', maxWidth: 480, boxSizing: 'border-box', padding: '12px 12px 0' }}>
          <div
            style={{
              background: `${C.green}18`,
              border: `1.5px solid ${C.green}`,
              borderRadius: 12,
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span>📅</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.green }}>EVENTO ATIVO</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.primary }}>
                {eventoAtivo.nome}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={S.card}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.primary, marginBottom: 4 }}>
          Bem-vindo ao nosso stand! 👋
        </div>
        <div style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>
          Deixe seus dados e entraremos em contato com a melhor solução para você.
        </div>

        <div style={S.fw}>
          <label style={S.label}>Nome completo *</label>
          <input
            style={S.inp(errors.nome)}
            placeholder="Seu nome"
            value={form.nome}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, nome: e.target.value }))
              setErrors((prev) => ({ ...prev, nome: '' }))
            }}
          />
          {errors.nome && <div style={S.errT}>{errors.nome}</div>}
        </div>

        <div style={S.fw}>
          <label style={S.label}>Profissão / Cargo</label>
          {profissoes.length > 0 ? (
            <select
              style={S.sel()}
              value={form.profissao || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, profissao: e.target.value }))}
            >
              <option value="">Selecione...</option>
              {profissoes.map((p) => (
                <option key={p.id} value={p.nome}>
                  {p.nome}
                </option>
              ))}
              <option value="Outro">Outro</option>
            </select>
          ) : (
            <input
              style={S.inp()}
              placeholder="Ex: Síndico, Gestor de RH..."
              value={form.profissao || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, profissao: e.target.value }))}
            />
          )}
        </div>

        <div style={S.fw}>
          <label style={S.label}>E-mail *</label>
          <input
            style={S.inp(errors.email)}
            placeholder="seuemail@empresa.com"
            type="email"
            value={form.email}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, email: e.target.value }))
              setErrors((prev) => ({ ...prev, email: '' }))
            }}
          />
          {errors.email && <div style={S.errT}>{errors.email}</div>}
        </div>

        <div style={S.fw}>
          <label style={S.label}>WhatsApp *</label>
          <input
            style={S.inp(errors.whatsapp)}
            placeholder="(21) 99999-9999"
            value={form.whatsapp}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, whatsapp: formatPhone(e.target.value) }))
              setErrors((prev) => ({ ...prev, whatsapp: '' }))
            }}
          />
          {errors.whatsapp && <div style={S.errT}>{errors.whatsapp}</div>}
        </div>

        <div style={S.fw}>
          <label style={S.label}>Empresa / Condomínio</label>

          {empresas.length > 0 && !empresaManual ? (
            <>
              <select
                style={S.sel()}
                value={form.empresa || ''}
                onChange={(e) => {
                  const value = e.target.value

                  if (value === '__OUTRO__') {
                    setEmpresaManual(true)
                    setForm((prev) => ({ ...prev, empresa: '' }))
                    return
                  }

                  setForm((prev) => ({ ...prev, empresa: value }))
                }}
              >
                <option value="">Selecione ou deixe em branco</option>
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.nome}>
                    {empresa.nome}
                  </option>
                ))}
                <option value="__OUTRO__">Outro / Não listado</option>
              </select>
            </>
          ) : (
            <>
              <input
                style={S.inp()}
                placeholder="Digite o nome da empresa ou condomínio"
                value={form.empresa || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, empresa: e.target.value }))}
              />

              {empresas.length > 0 && (
                <button
                  type="button"
                  style={{
                    marginTop: 8,
                    background: 'none',
                    border: 'none',
                    color: C.primary,
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: 13,
                  }}
                  onClick={() => {
                    setEmpresaManual(false)
                    setForm((prev) => ({ ...prev, empresa: '' }))
                  }}
                >
                  ← Voltar para lista de empresas
                </button>
              )}
            </>
          )}
        </div>

        <div style={S.fw}>
          <label style={S.label}>Produto de interesse *</label>
          <div style={S.prodGrid}>
            {produtos.map((p) => (
              <button
                key={p.id}
                type="button"
                style={S.prodBtn(form.produto === p.nome)}
                onClick={() => {
                  setForm((prev) => ({ ...prev, produto: p.nome }))
                  setErrors((prev) => ({ ...prev, produto: '' }))
                }}
              >
                {p.nome}
              </button>
            ))}
          </div>
          {errors.produto && <div style={{ ...S.errT, marginTop: 6 }}>{errors.produto}</div>}
        </div>

        {eventos.length > 0 && (
          <div style={S.fw}>
            <label style={S.label}>Evento *</label>
            <select
              style={S.sel(errors.evento)}
              value={form.eventoId || ''}
              onChange={(e) => {
                const ev = eventos.find((item) => String(item.id) === e.target.value) || null
                setForm((prev) => ({
                  ...prev,
                  eventoId: ev?.id ?? null,
                  eventoNome: ev?.nome ?? null,
                }))
                setErrors((prev) => ({ ...prev, evento: '' }))
              }}
            >
              <option value="">Selecione o evento...</option>
              {eventos.map((ev) => (
                <option key={ev.id} value={String(ev.id)}>
                  {ev.nome}
                  {ev.local ? ` — ${ev.local}` : ''}
                  {ev.dataInicio ? ` (${fmtDate(ev.dataInicio)})` : ''}
                </option>
              ))}
            </select>
            {errors.evento && <div style={S.errT}>{errors.evento}</div>}
          </div>
        )}

        {consultoresAtivos.length > 0 && (
          <div style={S.fw}>
            <label style={S.label}>Consultor responsável *</label>
            <select
              style={S.sel(errors.consultor)}
              value={form.consultorId || ''}
              onChange={(e) => {
                const consultor =
                  consultoresAtivos.find((item) => String(item.id) === e.target.value) || null
                setForm((prev) => ({
                  ...prev,
                  consultorId: consultor?.id ?? null,
                  consultorNome: consultor?.nome ?? null,
                }))
                setErrors((prev) => ({ ...prev, consultor: '' }))
              }}
            >
              <option value="">Selecione o consultor...</option>
              {consultoresAtivos.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.nome}
                  {c.cargo ? ` — ${c.cargo}` : ''}
                </option>
              ))}
            </select>
            {errors.consultor && <div style={S.errT}>{errors.consultor}</div>}
          </div>
        )}

        <button
          style={S.btn(`linear-gradient(135deg,${C.accent} 0%,${C.primary} 100%)`, saving)}
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? 'Salvando...' : '✅ Confirmar cadastro'}
        </button>
      </div>
    </div>
  )
}