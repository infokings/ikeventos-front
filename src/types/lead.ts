export interface Lead {
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

export type LeadFormData = Omit<Lead, 'id'>
