import type { LocalizedText } from '~/types/challenge'

export const useChallengeFormat = () => {
  const { locale } = useI18n()
  const lt = (value?: LocalizedText | null) => value?.[locale.value === 'ar' ? 'ar' : 'en'] || value?.en || value?.ar || ''
  const number = (value: number, options?: Intl.NumberFormatOptions) => new Intl.NumberFormat(locale.value === 'ar' ? 'ar' : 'en', options).format(value)
  const date = (value?: string | number | Date | null, options?: Intl.DateTimeFormatOptions) => {
    if (!value) return '—'
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? '—' : new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar' : 'en', options || { dateStyle: 'medium' }).format(parsed)
  }
  return { lt, number, date }
}
