<script setup lang="ts">
import type { SubmissionVersion } from '~/types/challenge'
import { safeUrl } from '~/utils/safeUrl'

const props = defineProps<{ modelValue: boolean; versions: SubmissionVersion[] }>()
const emit = defineEmits<{ 'update:modelValue': [open: boolean] }>()
const { t } = useI18n()
const { date, number } = useChallengeFormat()
const open = computed({ get: () => props.modelValue, set: value => emit('update:modelValue', value) })
const firstId = ref('')
const secondId = ref('')
watch([() => props.modelValue, () => props.versions.map(version => version.id).join('|')], () => {
  if (!props.versions.some(version => version.id === firstId.value)) firstId.value = props.versions[0]?.id || ''
  if (!props.versions.some(version => version.id === secondId.value) || firstId.value === secondId.value) {
    secondId.value = props.versions.filter(version => version.id !== firstId.value).at(-1)?.id || ''
  }
}, { immediate: true })
const first = computed(() => props.versions.find(version => version.id === firstId.value))
const second = computed(() => props.versions.find(version => version.id === secondId.value))

interface CompareRow { id: string; label: string; first: string; second: string; kind: 'text' | 'url' | 'list'; changed: boolean }
const linkFields = ['buildUrl', 'packageUrl', 'repositoryUrl', 'gddUrl', 'presentationUrl', 'coverUrl', 'trailerUrl'] as const
const rows = computed<CompareRow[]>(() => {
  if (!first.value || !second.value) return []
  const a = first.value.content
  const b = second.value.content
  const output: CompareRow[] = []
  const add = (id: string, label: string, firstValue: string, secondValue: string, kind: CompareRow['kind'] = 'text') => {
    output.push({ id, label, first: firstValue, second: secondValue, kind, changed: firstValue !== secondValue })
  }
  for (const key of ['title', 'description'] as const) {
    for (const language of ['en', 'ar'] as const) {
      add(`${key}-${language}`, t(`challenge.student.submission.fields.${key}${language === 'ar' ? 'Ar' : 'En'}`), a[key][language], b[key][language])
    }
  }
  for (const key of ['genre', 'platform'] as const) {
    const namespace = key === 'genre' ? 'genres' : 'platforms'
    add(key, t(`challenge.student.submission.fields.${key}`), t(`challenge.${namespace}.${a[key]}`), t(`challenge.${namespace}.${b[key]}`))
  }
  for (const key of linkFields) add(key, t(`challenge.student.submission.fields.${key}`), a[key], b[key], 'url')
  add('screenshotUrls', t('challenge.student.submission.fields.screenshotUrls'), a.screenshotUrls.join('\n'), b.screenshotUrls.join('\n'), 'list')
  return output
})
const changes = computed(() => rows.value.filter(row => row.changed).length)
const externalUrl = (url: string) => {
  const clean = safeUrl(url)
  return /^https?:\/\//i.test(clean) ? clean : ''
}
const links = (value: string) => value.split('\n').map(url => ({ value: url, href: externalUrl(url) })).filter(link => link.value)
const textDirection = (row: CompareRow) => row.id.endsWith('-ar') ? 'rtl' : row.id.endsWith('-en') || row.kind !== 'text' ? 'ltr' : undefined
</script>

<template>
  <ChallengeModal v-model="open" :title="t('challenge.student.submission.compareTitle')" wide>
    <template v-if="versions.length >= 2">
      <p class="compare-intro">{{ t('challenge.student.submission.compareHint') }}</p>
      <div class="compare-selectors">
        <div>
          <label for="compare-first-version" class="challenge-label">{{ t('challenge.student.submission.firstVersion') }}</label>
          <select id="compare-first-version" v-model="firstId" class="challenge-field">
            <option v-for="version in versions" :key="version.id" :value="version.id" :disabled="version.id === secondId">{{ t('challenge.student.submission.versionLabel', { version: version.label }) }}</option>
          </select>
          <p v-if="first" class="compare-date">{{ date(first.savedAt, { dateStyle: 'medium', timeStyle: 'short' }) }}</p>
        </div>
        <div>
          <label for="compare-second-version" class="challenge-label">{{ t('challenge.student.submission.secondVersion') }}</label>
          <select id="compare-second-version" v-model="secondId" class="challenge-field">
            <option v-for="version in versions" :key="version.id" :value="version.id" :disabled="version.id === firstId">{{ t('challenge.student.submission.versionLabel', { version: version.label }) }}</option>
          </select>
          <p v-if="second" class="compare-date">{{ date(second.savedAt, { dateStyle: 'medium', timeStyle: 'short' }) }}</p>
        </div>
      </div>
      <div v-if="first && second" class="compare-summary">
        <ChallengeStatusPill :tone="changes ? 'warning' : 'neutral'">{{ t('challenge.student.submission.changedFields', { count: number(changes) }) }}</ChallengeStatusPill>
        <span>{{ t('challenge.student.submission.readOnly') }}</span>
      </div>
      <div v-if="first && second" class="compare-table-wrap">
        <table class="compare-table">
          <caption class="sr-only">{{ t('challenge.student.submission.compareCaption', { first: first.label, second: second.label }) }}</caption>
          <thead>
            <tr>
              <th scope="col">{{ t('challenge.student.submission.field') }}</th>
              <th scope="col">{{ t('challenge.student.submission.versionLabel', { version: first.label }) }}</th>
              <th scope="col">{{ t('challenge.student.submission.versionLabel', { version: second.label }) }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id" :class="{ 'compare-changed': row.changed }">
              <th scope="row">
                {{ row.label }}
                <span v-if="row.changed" class="compare-change-label">{{ t('challenge.student.submission.changed') }}</span>
              </th>
              <td v-for="side in ['first', 'second'] as const" :key="side" :dir="textDirection(row)">
                <template v-if="row.kind === 'url' && externalUrl(row[side])">
                  <a :href="externalUrl(row[side])" target="_blank" rel="noopener noreferrer">{{ row[side] }}<AppIcon name="external-link" class="w-3.5 h-3.5 inline-block ms-1" /></a>
                </template>
                <ul v-else-if="row.kind === 'list' && row[side]" class="compare-links">
                  <li v-for="(link, index) in links(row[side])" :key="index">
                    <a v-if="link.href" :href="link.href" target="_blank" rel="noopener noreferrer">{{ link.value }}</a>
                    <span v-else>{{ link.value }}</span>
                  </li>
                </ul>
                <span v-else>{{ row[side] || t('challenge.student.submission.emptyField') }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <ChallengeEmptyState v-else :title="t('challenge.student.submission.compareNeedsVersions')" :description="t('challenge.student.submission.compareNeedsVersionsHint')" icon="history" />
  </ChallengeModal>
</template>

<style scoped>
.compare-intro { color: #010028b3; font-size: .875rem; line-height: 1.75; max-width: 70ch; }
.compare-selectors { display: grid; gap: 1rem; margin-block: 1.5rem; }
.compare-date { margin-block-start: .5rem; color: #010028b3; font-size: .75rem; }
.compare-summary { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; margin-block-end: 1rem; }
.compare-summary > span { color: #010028b3; font-size: .75rem; }
.compare-table-wrap { overflow-x: auto; overscroll-behavior-inline: contain; max-width: 100%; }
.compare-table { width: 100%; min-width: 520px; border-collapse: collapse; table-layout: fixed; font-size: .8125rem; line-height: 1.75; }
.compare-table th, .compare-table td { text-align: start; vertical-align: top; padding: .875rem; border-block-end: 1px solid #01002814; overflow-wrap: anywhere; }
.compare-table thead { background: #f2f0fe; color: #010028; }
.compare-table thead th:first-child { width: 26%; }
.compare-table tbody th { font-weight: 600; color: #010028; }
.compare-table td { color: #010028cc; white-space: pre-wrap; }
.compare-changed { background: #8062FD09; }
.compare-change-label { display: block; margin-block-start: .25rem; color: #5B3FD9; font-size: .6875rem; font-weight: 500; }
.compare-table a { color: #5B3FD9; text-decoration: underline; text-underline-offset: 3px; }
.compare-table a:focus-visible { outline: 2px solid #8062FD; outline-offset: 3px; border-radius: .25rem; }
.compare-links { display: grid; gap: .625rem; }
@media (min-width: 640px) { .compare-selectors { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
