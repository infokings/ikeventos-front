import { api } from './api'
import type { CadastroItem } from '../types/cadastro-item'

type CadastroPayload = {
  nome: string
}

export const cadastrosService = {
  listarEmpresas: () => api.get<CadastroItem[]>('/api/v1/empresas'),

  salvarEmpresa: (payload: CadastroPayload) =>
    api.post<CadastroItem>('/api/v1/empresas', payload),

  excluirEmpresa: (id: number) =>
    api.delete<void>(`/api/v1/empresas/${id}`),

  listarProdutos: () => api.get<CadastroItem[]>('/api/v1/produtos'),

  salvarProduto: (payload: CadastroPayload) =>
    api.post<CadastroItem>('/api/v1/produtos', payload),

  excluirProduto: (id: number) =>
    api.delete<void>(`/api/v1/produtos/${id}`),

  listarProfissoes: () => api.get<CadastroItem[]>('/api/v1/profissoes'),

  salvarProfissao: (payload: CadastroPayload) =>
    api.post<CadastroItem>('/api/v1/profissoes', payload),

  excluirProfissao: (id: number) =>
    api.delete<void>(`/api/v1/profissoes/${id}`),
}
