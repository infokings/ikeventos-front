import { useMemo, useState } from 'react'
import { PROTECTED_VIEWS, VIEWS, type AppView, type SuccessView, type ViewName } from './app-view'

export function useAppView() {
  const [view, setView] = useState<AppView>(VIEWS.form)

  const currentView = useMemo<ViewName>(() => {
    return typeof view === 'object' ? view.type : view
  }, [view])

  const successLead = useMemo<Partial<SuccessView['lead']> | null>(() => {
    return typeof view === 'object' && view.type === VIEWS.success ? view.lead : null
  }, [view])

  const needsLock = useMemo(() => PROTECTED_VIEWS.includes(currentView), [currentView])

  const goTo = (nextView: ViewName) => setView(nextView)
  const goToSuccess = (lead: SuccessView['lead']) => setView({ type: VIEWS.success, lead })
  const resetToForm = () => setView(VIEWS.form)

  return { view, setView, currentView, successLead, needsLock, goTo, goToSuccess, resetToForm }
}
