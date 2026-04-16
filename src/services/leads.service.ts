import { api } from './api'
import type { Lead, LeadFormData } from '../types/lead'

export const leadsService = {
  listar: () => api.get<Lead[]>('/api/v1/leads'),
  salvar: (lead: LeadFormData) => api.post<Lead>('/api/v1/leads', lead),
  excluir: (id: number) => api.delete<void>(`/api/v1/leads/${id}`),
}
