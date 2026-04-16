export interface Consultor {
  id: number
  nome: string
  email?: string
  whatsapp?: string
  cargo?: string
  ativo: boolean
  criadoEm?: string
}

export type ConsultorInput = Omit<Consultor, 'id'>
