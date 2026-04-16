export interface Evento {
  id: number
  nome: string
  local?: string
  dataInicio: string
  dataFim?: string
  descricao?: string
  criadoEm?: string
}

export type EventoInput = Omit<Evento, 'id'>
