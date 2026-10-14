<script setup lang="ts">
import type { ChallengeRanking } from '~/types/challenge'
defineProps<{ rankings: ChallengeRanking[] }>()
const { state } = useChallenge()
const { lt, number } = useChallengeFormat()
const { t } = useI18n()
const teamName = (id: string) => lt(state.value?.teams.find(team => team.id === id)?.name)
const schoolName = (id: string) => lt(state.value?.schools.find(school => school.id === state.value?.teams.find(team => team.id === id)?.schoolId)?.name)
</script>
<template>
  <ol class="challenge-podium" :aria-label="t('challenge.results.podium')">
    <li v-for="(row, index) in rankings.slice(0, 3)" :key="row.teamId" :class="'podium-place-' + (index + 1)">
      <span class="podium-rank"><AppIcon v-if="index === 0" name="trophy" class="h-7 w-7" /><span>{{ t('challenge.results.place', { rank: number(row.rank) }) }}</span></span>
      <h3>{{ teamName(row.teamId) }}</h3><p>{{ schoolName(row.teamId) }}</p>
      <strong><bdi dir="ltr">{{ number(row.score, { maximumFractionDigits: 2 }) }}<span> / {{ number(100) }}</span></bdi></strong>
    </li>
  </ol>
</template>
<style scoped>
.challenge-podium { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; align-items: end; max-inline-size: 56rem; margin: 2.5rem auto 0; list-style: none; padding: 0; }
.challenge-podium > li { display: flex; flex-direction: column; align-items: center; gap: .65rem; padding: 2rem 1.2rem; border-radius: 1rem; text-align: center; background: #f2f0fe; color: #010028; animation: podium-rise .4s cubic-bezier(.22,1,.36,1); }
.challenge-podium > .podium-place-1 { order: 2; min-block-size: 17rem; padding-block-start: 2.5rem; background: #6b4aee; color: white; }
.podium-place-2 { order: 1; min-block-size: 14rem; }
.podium-place-3 { order: 3; min-block-size: 12rem; }
.podium-rank { display: flex; flex-direction: column; align-items: center; gap: .65rem; font-size: .8125rem; font-weight: 700; }
.podium-place-1 .podium-rank svg { color: #5fcc7b; }
.challenge-podium h3 { font-size: 1.25rem; line-height: 1.5; font-weight: 800; overflow-wrap: anywhere; }
.challenge-podium p { font-size: .75rem; line-height: 1.7; }
.challenge-podium strong { margin-block-start: auto; font-size: 1.8rem; font-variant-numeric: tabular-nums; }
.challenge-podium strong span { font-size: .875rem; font-weight: 500; }
@keyframes podium-rise { from { transform: translateY(12px); } to { transform: translateY(0); } }
@media (max-width: 639px) { .challenge-podium { grid-template-columns: 1fr; } .challenge-podium > li { order: initial; min-block-size: auto; padding: 1.5rem; } .challenge-podium > .podium-place-1 { order: initial; } }
@media (prefers-reduced-motion: reduce) { .challenge-podium > li { animation: none; } }
</style>
