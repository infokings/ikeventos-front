import type { Lead } from '../types/lead'

export const VIEWS = {
  form: 'form',
  admin: 'admin',
  cadastros: 'cadastros',
  relatorios: 'relatorios',
  eventos: 'eventos',
  consultores: 'consultores',
  success: 'success',
} as const

export type ViewName = (typeof VIEWS)[keyof typeof VIEWS]

export type SuccessView = {
  type: typeof VIEWS.success
  lead: Partial<Lead>
}

export type AppView = ViewName | SuccessView

export const PROTECTED_VIEWS: ViewName[] = [
  VIEWS.admin,
  VIEWS.cadastros,
  VIEWS.relatorios,
  VIEWS.eventos,
  VIEWS.consultores,
]
