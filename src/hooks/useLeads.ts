import { useEffect, useState } from 'react'
import { leadsService } from '../services/leads.service'
import type { Lead, LeadFormData } from '../types/lead'

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = async () => {
    const data = await leadsService.listar()
    setLeads(data)
  }

  const salvar = async (lead: LeadFormData) => {
    const saved = await leadsService.salvar(lead)
    setLeads((prev) => [saved, ...prev])
    return saved
  }

  const remover = async (id: number) => {
    await leadsService.excluir(id)
    setLeads((prev) => prev.filter((item) => item.id !== id))
  }

  useEffect(() => {
    carregar().finally(() => setLoading(false))
  }, [])

  return { leads, setLeads, loading, salvar, remover, recarregar: carregar }
}
