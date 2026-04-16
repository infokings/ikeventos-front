export interface Empresa {
    id: number
    nome: string
  }
  
  export type EventoInput = Omit<Empresa, 'id'>