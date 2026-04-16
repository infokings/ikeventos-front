export interface Profissao {
    id: number
    nome: string
  }
  
  export type EventoInput = Omit<Profissao, 'id'>