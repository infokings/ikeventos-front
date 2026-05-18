import { api } from './api'

type LoginRequest = {
  login: string
  senha: string
}

type LoginResponse = {
  token: string
  tipo: string
  login: string
  role: string
}

export const authService = {
  login: async (payload: LoginRequest) => {
    const response = await api.post<LoginResponse>('/api/v1/auth/login', payload)

    sessionStorage.setItem('token', response.token)
    sessionStorage.setItem('tipo', response.tipo)
    sessionStorage.setItem('login', response.login)
    sessionStorage.setItem('role', response.role)

    return response
  },

  logout: () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('tipo')
    sessionStorage.removeItem('login')
    sessionStorage.removeItem('role')
  },
}