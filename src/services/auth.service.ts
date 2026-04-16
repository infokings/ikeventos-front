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

    localStorage.setItem('token', response.token)
    localStorage.setItem('tipo', response.tipo)
    localStorage.setItem('login', response.login)
    localStorage.setItem('role', response.role)

    return response
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('tipo')
    localStorage.removeItem('login')
    localStorage.removeItem('role')
  },
}