import { api } from './api'
import type { Produto, ProdutoInput } from '../types/produto'

export const produtoService = {
  listar: () => api.get<Produto[]>('/api/v1/produtos'),
  salvar: (produto: ProdutoInput) => api.post<Produto>('/api/v1/produtos', produto),
  excluir: (id: number) => api.delete<void>(`/api/v1/produtos/${id}`),
}