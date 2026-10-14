<script setup lang="ts">
import type { SubmissionContent } from '~/types/challenge'
import { safeUrl } from '~/utils/safeUrl'

const props = withDefaults(defineProps<{
  modelValue: SubmissionContent
  disabled?: boolean
}>(), { disabled: false })
const emit = defineEmits<{ 'update:modelValue': [content: SubmissionContent] }>()
const { t } = useI18n()
const { number } = useChallengeFormat()

const tab = ref('overview')
const tabs = computed(() => ['overview', 'files', 'documents', 'media'].map(id => ({
  id,
  label: t(`challenge.student.submission.tabs.${id}`),
})))
type LinkField = 'buildUrl' | 'packageUrl' | 'repositoryUrl' | 'gddUrl' | 'presentationUrl' | 'coverUrl' | 'trailerUrl'
const fileFields: LinkField[] = ['buildUrl', 'packageUrl', 'repositoryUrl']
const documentFields: LinkField[] = ['gddUrl', 'presentationUrl']
const mediaFields: LinkField[] = ['coverUrl', 'trailerUrl']
const genres = ['puzzle', 'adventure', 'platformer', 'educational'] as const
const platforms = ['web', 'windows', 'android'] as const

function valueOf(event: Event) {
  return (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value
}
function update<K extends keyof SubmissionContent>(key: K, value: SubmissionContent[K]) {
  if (!props.disabled) emit('update:modelValue', { ...props.modelValue, [key]: value })
}
function updateLocalized(key: 'title' | 'description', language: 'en' | 'ar', event: Event) {
  update(key, { ...props.modelValue[key], [language]: valueOf(event) })
}
function externalUrl(value: string) {
  const clean = safeUrl(value)
  return /^https?:\/\//i.test(clean) ? clean : ''
}
function invalidUrl(value: string) {
  return Boolean(value.trim()) && !externalUrl(value)
}
function updateScreenshots(event: Event) {
  update('screenshotUrls', valueOf(event).split('\n').map(url => url.trim()).filter(Boolean))
}
const coverPreview = computed(() => externalUrl(props.modelValue.coverUrl))
const trailerPreview = computed(() => externalUrl(props.modelValue.trailerUrl))
const screenshots = computed(() => props.modelValue.screenshotUrls.map((url, index) => ({
  url: externalUrl(url),
  index,
})).filter(item => item.url))
const invalidScreenshots = computed(() => props.modelValue.screenshotUrls.some(invalidUrl))
const coverFailed = ref(false)
const failedScreenshots = ref<Record<string, boolean>>({})
watch(coverPreview, () => { coverFailed.value = false })
watch(() => props.modelValue.screenshotUrls.join('|'), () => { failedScreenshots.value = {} })
</script>

<template>
  <div class="submission-form">
    <ChallengeTabs v-model="tab" :items="tabs" :label="t('challenge.student.submission.title')">

    <section
      v-show="tab === 'overview'"
      class="submission-tabpanel"
    >
      <p class="submission-help">{{ t('challenge.student.submission.overviewHint') }}</p>
      <fieldset :disabled="disabled" class="submission-fields">
        <legend class="sr-only">{{ t('challenge.student.submission.tabs.overview') }}</legend>
        <div class="submission-language-grid">
          <div class="submission-language">
            <div>
              <label for="submission-title-en" class="challenge-label">{{ t('challenge.student.submission.fields.titleEn') }}</label>
              <input id="submission-title-en" :value="modelValue.title.en" class="challenge-field" dir="ltr" maxlength="120" autocomplete="off" @input="updateLocalized('title', 'en', $event)" />
            </div>
            <div>
              <label for="submission-description-en" class="challenge-label">{{ t('challenge.student.submission.fields.descriptionEn') }}</label>
              <textarea id="submission-description-en" :value="modelValue.description.en" class="challenge-field" dir="ltr" rows="6" maxlength="3000" @input="updateLocalized('description', 'en', $event)" />
            </div>
          </div>
          <div class="submission-language">
            <div>
              <label for="submission-title-ar" class="challenge-label">{{ t('challenge.student.submission.fields.titleAr') }}</label>
              <input id="submission-title-ar" :value="modelValue.title.ar" class="challenge-field" dir="rtl" maxlength="120" autocomplete="off" @input="updateLocalized('title', 'ar', $event)" />
            </div>
            <div>
              <label for="submission-description-ar" class="challenge-label">{{ t('challenge.student.submission.fields.descriptionAr') }}</label>
              <textarea id="submission-description-ar" :value="modelValue.description.ar" class="challenge-field" dir="rtl" rows="6" maxlength="3000" @input="updateLocalized('description', 'ar', $event)" />
            </div>
          </div>
        </div>
        <div class="submission-classification">
          <div>
            <label for="submission-genre" class="challenge-label">{{ t('challenge.student.submission.fields.genre') }}</label>
            <select id="submission-genre" :value="modelValue.genre" class="challenge-field" @change="update('genre', valueOf($event) as SubmissionContent['genre'])">
              <option v-for="genre in genres" :key="genre" :value="genre">{{ t(`challenge.genres.${genre}`) }}</option>
            </select>
          </div>
          <div>
            <label for="submission-platform" class="challenge-label">{{ t('challenge.student.submission.fields.platform') }}</label>
            <select id="submission-platform" :value="modelValue.platform" class="challenge-field" @change="update('platform', valueOf($event) as SubmissionContent['platform'])">
              <option v-for="platform in platforms" :key="platform" :value="platform">{{ t(`challenge.platforms.${platform}`) }}</option>
            </select>
          </div>
        </div>
      </fieldset>
    </section>

    <section v-show="tab === 'files'" class="submission-tabpanel">
      <p class="submission-help">{{ t('challenge.student.submission.filesHint') }}</p>
      <fieldset :disabled="disabled" class="submission-fields">
        <legend class="sr-only">{{ t('challenge.student.submission.tabs.files') }}</legend>
        <div v-for="field in fileFields" :key="field" class="submission-link-field">
          <label :for="`submission-${field}`" class="challenge-label">{{ t(`challenge.student.submission.fields.${field}`) }}</label>
          <input :id="`submission-${field}`" :value="modelValue[field]" class="challenge-field" type="url" dir="ltr" inputmode="url" placeholder="https://" :aria-invalid="invalidUrl(modelValue[field]) || undefined" :aria-describedby="`submission-${field}-hint`" @input="update(field, valueOf($event))" />
          <div :id="`submission-${field}-hint`" class="submission-link-hint">
            <p :class="{ 'submission-invalid': invalidUrl(modelValue[field]) }">{{ invalidUrl(modelValue[field]) ? t('challenge.student.submission.invalidUrl') : t(`challenge.student.submission.hints.${field}`) }}</p>
            <a v-if="externalUrl(modelValue[field])" :href="externalUrl(modelValue[field])" target="_blank" rel="noopener noreferrer" class="submission-preview-link">
              {{ t('challenge.student.submission.openLink') }}
              <AppIcon name="external-link" class="w-4 h-4" />
            </a>
          </div>
        </div>
      </fieldset>
    </section>

    <section v-show="tab === 'documents'" class="submission-tabpanel">
      <p class="submission-help">{{ t('challenge.student.submission.documentsHint') }}</p>
      <fieldset :disabled="disabled" class="submission-fields">
        <legend class="sr-only">{{ t('challenge.student.submission.tabs.documents') }}</legend>
        <div v-for="field in documentFields" :key="field" class="submission-link-field">
          <label :for="`submission-${field}`" class="challenge-label">{{ t(`challenge.student.submission.fields.${field}`) }}</label>
          <input :id="`submission-${field}`" :value="modelValue[field]" class="challenge-field" type="url" dir="ltr" inputmode="url" placeholder="https://" :aria-invalid="invalidUrl(modelValue[field]) || undefined" :aria-describedby="`submission-${field}-hint`" @input="update(field, valueOf($event))" />
          <div :id="`submission-${field}-hint`" class="submission-link-hint">
            <p :class="{ 'submission-invalid': invalidUrl(modelValue[field]) }">{{ invalidUrl(modelValue[field]) ? t('challenge.student.submission.invalidUrl') : t(`challenge.student.submission.hints.${field}`) }}</p>
            <a v-if="externalUrl(modelValue[field])" :href="externalUrl(modelValue[field])" target="_blank" rel="noopener noreferrer" class="submission-preview-link">
              {{ t('challenge.student.submission.openLink') }}
              <AppIcon name="external-link" class="w-4 h-4" />
            </a>
          </div>
        </div>
      </fieldset>
    </section>

    <section v-show="tab === 'media'" class="submission-tabpanel">
      <p class="submission-help">{{ t('challenge.student.submission.mediaHint') }}</p>
      <fieldset :disabled="disabled" class="submission-fields">
        <legend class="sr-only">{{ t('challenge.student.submission.tabs.media') }}</legend>
        <div v-for="field in mediaFields" :key="field" class="submission-link-field">
          <label :for="`submission-${field}`" class="challenge-label">{{ t(`challenge.student.submission.fields.${field}`) }}</label>
          <input :id="`submission-${field}`" :value="modelValue[field]" class="challenge-field" type="url" dir="ltr" inputmode="url" placeholder="https://" :aria-invalid="invalidUrl(modelValue[field]) || undefined" :aria-describedby="`submission-${field}-hint`" @input="update(field, valueOf($event))" />
          <p :id="`submission-${field}-hint`" class="submission-help" :class="{ 'submission-invalid': invalidUrl(modelValue[field]) }">{{ invalidUrl(modelValue[field]) ? t('challenge.student.submission.invalidUrl') : t(`challenge.student.submission.hints.${field}`) }}</p>
        </div>
        <div>
          <label for="submission-screenshots" class="challenge-label">{{ t('challenge.student.submission.fields.screenshotUrls') }}</label>
          <textarea id="submission-screenshots" :value="modelValue.screenshotUrls.join('\n')" class="challenge-field" dir="ltr" rows="4" placeholder="https://" :aria-invalid="invalidScreenshots || undefined" aria-describedby="submission-screenshots-hint" @change="updateScreenshots" />
          <p id="submission-screenshots-hint" class="submission-help" :class="{ 'submission-invalid': invalidScreenshots }">{{ invalidScreenshots ? t('challenge.student.submission.invalidUrl') : t('challenge.student.submission.hints.screenshotUrls') }}</p>
        </div>
      </fieldset>

      <div v-if="coverPreview || trailerPreview || screenshots.length" class="submission-media-preview">
        <h3>{{ t('challenge.student.submission.mediaPreview') }}</h3>
        <div class="submission-preview-grid">
          <figure v-if="coverPreview" class="submission-cover">
            <img v-if="!coverFailed" :src="coverPreview" :alt="t('challenge.student.submission.coverAlt')" loading="lazy" referrerpolicy="no-referrer" @error="coverFailed = true" />
            <p v-else class="submission-image-failure">{{ t('challenge.student.submission.imageFailed') }}</p>
            <figcaption>{{ t('challenge.student.submission.fields.coverUrl') }}</figcaption>
          </figure>
          <div v-if="trailerPreview" class="submission-trailer">
            <VideoPlayer :src="trailerPreview" :is-uploaded="false" :title="t('challenge.student.submission.fields.trailerUrl')" />
          </div>
        </div>
        <div v-if="screenshots.length" class="submission-screenshots">
          <a v-for="item in screenshots" :key="`${item.index}-${item.url}`" :href="item.url" target="_blank" rel="noopener noreferrer">
            <img v-if="!failedScreenshots[item.url]" :src="item.url" :alt="t('challenge.student.submission.screenshotAlt', { number: number(item.index + 1) })" loading="lazy" referrerpolicy="no-referrer" @error="failedScreenshots[item.url] = true" />
            <span v-else class="submission-image-failure">{{ t('challenge.student.submission.imageFailed') }}</span>
          </a>
        </div>
      </div>
      <p v-else class="submission-empty-preview">{{ t('challenge.student.submission.noMedia') }}</p>
    </section>
    </ChallengeTabs>
  </div>
</template>

<style scoped>
.submission-tabpanel { min-width: 0; }
.submission-help { color: #010028b3; font-size: .8125rem; line-height: 1.75; margin-block: .5rem 0; max-width: 72ch; }
.submission-tabpanel > .submission-help { margin-block: 0 1.5rem; }
.submission-fields { border: 0; margin: 0; min-width: 0; padding: 0; display: grid; gap: 1.5rem; }
.submission-fields:disabled .challenge-field { cursor: not-allowed; opacity: .75; }
.submission-language-grid, .submission-classification { display: grid; gap: 1.5rem; }
.submission-language { display: grid; gap: 1.25rem; min-width: 0; }
.submission-classification { padding-block-start: 1.5rem; border-block-start: 1px solid #01002814; }
.submission-link-hint { display: flex; gap: .75rem; flex-wrap: wrap; justify-content: space-between; align-items: baseline; margin-block-start: .5rem; }
.submission-link-hint p { color: #010028b3; font-size: .8125rem; line-height: 1.75; }
.submission-preview-link { display: inline-flex; align-items: center; gap: .375rem; color: #5B3FD9; font-size: .8125rem; font-weight: 600; text-underline-offset: 3px; }
.submission-preview-link:hover { text-decoration: underline; }
.submission-preview-link:focus-visible, .submission-screenshots a:focus-visible { outline: 2px solid #8062FD; outline-offset: 4px; border-radius: .25rem; }
.submission-invalid, .submission-link-hint p.submission-invalid { color: #991b1b; }
.submission-media-preview { margin-block-start: 2rem; padding-block-start: 1.5rem; border-block-start: 1px solid #01002814; }
.submission-media-preview h3 { font-size: 1rem; font-weight: 600; color: #010028; margin-block-end: 1rem; }
.submission-preview-grid { display: grid; gap: 1.25rem; align-items: start; }
.submission-cover { min-width: 0; }
.submission-cover img, .submission-image-failure { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: .75rem; background: #f2f0fe; }
.submission-cover figcaption { margin-block-start: .5rem; color: #010028b3; font-size: .8125rem; }
.submission-image-failure { display: grid; place-items: center; padding: 1rem; color: #010028b3; text-align: center; font-size: .8125rem; }
.submission-screenshots { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; margin-block-start: 1.25rem; }
.submission-screenshots a { display: block; min-width: 0; }
.submission-screenshots img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: .5rem; background: #f2f0fe; }
.submission-empty-preview { padding-block: 1.5rem 0; color: #010028b3; font-size: .8125rem; }
@media (min-width: 768px) {
  .submission-language-grid, .submission-classification, .submission-preview-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .submission-screenshots { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
</style>
