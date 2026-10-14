export const useChallengeToast = () => {
  const toasts = useState<{ id: number; key: string; tone: 'success' | 'danger' | 'warning'; params?: Record<string, string | number> }[]>('challenge-toasts', () => [])
  const dismiss = (id: number) => { toasts.value = toasts.value.filter(item => item.id !== id) }
  const push = (key: string, tone: 'success' | 'danger' | 'warning' = 'success', params?: Record<string, string | number>) => {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, key, tone, params })
    if (import.meta.client) window.setTimeout(() => dismiss(id), 6500)
  }
  const result = (action: { ok: boolean; errorKey?: string }, successKey = 'challenge.toasts.saved') => {
    push(action.ok ? successKey : action.errorKey || 'challenge.toasts.failed', action.ok ? 'success' : 'danger')
    return action.ok
  }
  return { toasts, push, dismiss, result }
}
