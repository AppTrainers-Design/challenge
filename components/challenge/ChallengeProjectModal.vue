<script setup lang="ts">
import type { GameSubmission, Team } from '~/types/challenge'
const props = withDefaults(defineProps<{ modelValue: boolean; submission: GameSubmission | null; team: Team | null; blind?: boolean }>(), { blind: false })
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const { t } = useI18n()
const { lt, date } = useChallengeFormat()
const { state } = useChallenge()
const tab = ref('overview')
const imageFailed = ref(false)
const content = computed(() => props.submission?.content)
const school = computed(() => props.blind ? null : state.value?.schools.find(item => item.id === props.team?.schoolId))
const title = computed(() => lt(content.value?.title) || t('challenge.project.title'))
const tabs = computed(() => ['overview', 'files', 'media'].map(id => ({ id, label: t('challenge.project.tabs.' + id) })))
const files = computed(() => content.value ? [
  { label: t('challenge.project.play'), url: safeUrl(content.value.buildUrl), icon: 'gamepad' },
  { label: t('challenge.project.package'), url: safeUrl(content.value.packageUrl), icon: 'download' },
  { label: t('challenge.project.repository'), url: safeUrl(content.value.repositoryUrl), icon: 'code' },
  { label: t('challenge.project.gdd'), url: safeUrl(content.value.gddUrl), icon: 'document-text' },
  { label: t('challenge.project.presentation'), url: safeUrl(content.value.presentationUrl), icon: 'film' },
].filter(item => item.url) : [])
watch(() => props.submission?.id, () => { tab.value = 'overview'; imageFailed.value = false })
</script>
<template>
  <ChallengeModal :model-value="modelValue" :title="title" wide @update:model-value="emit('update:modelValue', $event)">
    <template v-if="content">
      <p v-if="!blind && team" class="mb-5 text-sm text-text">{{ lt(team.name) }}<template v-if="school"> · {{ lt(school.name) }}</template></p>
      <p v-if="blind" class="mb-5 text-sm text-brand-deep">{{ t('challenge.project.blind') }}</p>
      <ChallengeTabs v-model="tab" :items="tabs">
        <div v-if="tab === 'overview'" class="space-y-5">
          <div v-if="safeUrl(content.coverUrl) && !imageFailed" class="overflow-hidden rounded-xl bg-[#f2f0fe]"><img :src="safeUrl(content.coverUrl)" :alt="title" class="max-h-80 w-full object-contain" @error="imageFailed = true" /></div>
          <p class="max-w-[75ch] whitespace-pre-wrap leading-relaxed text-text">{{ lt(content.description) }}</p>
          <div class="flex flex-wrap gap-2"><ChallengeStatusPill tone="brand">{{ t('challenge.genres.' + content.genre) }}</ChallengeStatusPill><ChallengeStatusPill>{{ t('challenge.platforms.' + content.platform) }}</ChallengeStatusPill><ChallengeStatusPill v-if="submission">{{ t('challenge.status.' + submission.status) }}</ChallengeStatusPill></div>
          <p v-if="submission" class="text-xs text-text">{{ t('challenge.project.updated', { date: date(submission.updatedAt) }) }}</p>
        </div>
        <div v-else-if="tab === 'files'" class="grid gap-3 sm:grid-cols-2">
          <a v-for="file in files" :key="file.label" :href="file.url" target="_blank" rel="noopener noreferrer" class="flex min-h-14 items-center gap-3 rounded-xl border border-brand/15 p-4 text-sm font-semibold text-brand-deep"><AppIcon :name="file.icon" class="h-5 w-5" />{{ file.label }}<AppIcon name="external-link" class="ms-auto h-4 w-4" /></a>
          <p v-if="!files.length" class="text-sm">{{ t('challenge.project.noFiles') }}</p>
        </div>
        <div v-else class="space-y-5">
          <VideoPlayer v-if="safeUrl(content.trailerUrl)" :src="safeUrl(content.trailerUrl)" :is-uploaded="false" :title="title" />
          <div v-if="content.screenshotUrls.some(url => safeUrl(url))" class="grid gap-3 sm:grid-cols-2"><img v-for="(url, index) in content.screenshotUrls.filter(url => safeUrl(url))" :key="url" :src="safeUrl(url)" :alt="t('challenge.project.screenshot', { number: index + 1 })" class="w-full rounded-xl border border-brand/10 object-contain" loading="lazy" /></div>
          <p v-if="!safeUrl(content.trailerUrl) && !content.screenshotUrls.some(url => safeUrl(url))" class="text-sm">{{ t('challenge.project.noMedia') }}</p>
        </div>
      </ChallengeTabs>
    </template>
    <p v-else>{{ t('challenge.project.noFiles') }}</p>
  </ChallengeModal>
</template>
