import { api } from './api'
import type { Evento, EventoInput } from '../types/evento'

export const eventosService = {
  listar: () => api.get<Evento[]>('/api/v1/eventos'),
  salvar: (evento: EventoInput) => api.post<Evento>('/api/v1/eventos', evento),
  excluir: (id: number) => api.delete<void>(`/api/v1/eventos/${id}`),
}
