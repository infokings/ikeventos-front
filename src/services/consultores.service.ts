import { api } from './api'
import type { Consultor, ConsultorInput } from '../types/consultor'

export const consultoresService = {
  listar: () => api.get<Consultor[]>('/api/v1/consultores'),
  salvar: (consultor: ConsultorInput) => api.post<Consultor>('/api/v1/consultores', consultor),
  atualizar: (id: number, consultor: Partial<Consultor>) => api.put<Consultor>(`/api/v1/consultores/${id}`, consultor),
  excluir: (id: number) => api.delete<void>(`/api/v1/consultores/${id}`),
}
