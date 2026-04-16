export interface Produto {
    id: number
    nome: string
  }
  
  export type ProdutoInput = Omit<Produto, 'id'>