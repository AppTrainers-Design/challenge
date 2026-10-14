<script setup lang="ts">
const props = withDefaults(defineProps<{ buildUrl?: string; genre?: string }>(), { buildUrl: '', genre: '' })
const { t } = useI18n()
const { number } = useChallengeFormat()
const root = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const mode = ref<'idle' | 'running' | 'paused' | 'finished'>('idle')
const score = ref(0)
const seconds = ref(30)
const fullscreenError = ref(false)
const build = computed(() => safeUrl(props.buildUrl))
const instructionsId = useId()
const width = 800
const height = 450
let frame = 0
let lastTime = 0
let elapsed = 0
let spawnTime = 0
let playerX = width / 2
let dragged = false
let items: { x: number; y: number; speed: number; radius: number }[] = []
const keys = new Set<string>()
const palette = computed(() => props.genre === 'puzzle' ? '#9a82fe' : props.genre === 'adventure' ? '#8062fd' : '#b2a0ff')
function draw() {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#010028'
  ctx.fillRect(0, 0, width, height)
  ctx.strokeStyle = '#8062fd40'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, height - 42)
  ctx.lineTo(width, height - 42)
  ctx.stroke()
  ctx.fillStyle = palette.value
  for (const item of items) {
    ctx.beginPath()
    ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#5fcc7b'
  ctx.beginPath()
  ctx.roundRect(playerX - 42, height - 64, 84, 20, 8)
  ctx.fill()
}
function tick(timestamp: number) {
  if (mode.value !== 'running') return
  const delta = lastTime ? Math.min((timestamp - lastTime) / 1000, .08) : 0
  lastTime = timestamp
  elapsed += delta
  seconds.value = Math.max(0, Math.ceil(30 - elapsed))
  if (keys.has('ArrowLeft') || keys.has('a')) playerX -= delta * 430
  if (keys.has('ArrowRight') || keys.has('d')) playerX += delta * 430
  playerX = Math.max(42, Math.min(width - 42, playerX))
  spawnTime += delta
  if (spawnTime > .6) { spawnTime = 0; items.push({ x: 24 + Math.random() * (width - 48), y: -16, speed: 145 + Math.random() * 65, radius: 12 }) }
  items = items.filter(item => {
    item.y += item.speed * delta
    if (item.y >= height - 76 && item.y <= height - 38 && Math.abs(item.x - playerX) < 48) { score.value++; return false }
    return item.y < height + 16
  })
  draw()
  if (seconds.value <= 0) { mode.value = 'finished'; keys.clear(); return }
  frame = requestAnimationFrame(tick)
}
function start() {
  if (mode.value === 'idle' || mode.value === 'finished') {
    score.value = 0; seconds.value = 30; elapsed = 0; spawnTime = 0; playerX = width / 2; items = []
  }
  cancelAnimationFrame(frame)
  lastTime = 0
  mode.value = 'running'
  frame = requestAnimationFrame(tick)
  canvas.value?.focus()
}
function pause() {
  if (mode.value !== 'running') return
  mode.value = 'paused'
  cancelAnimationFrame(frame)
  keys.clear()
  dragged = false
}
function keydown(event: KeyboardEvent) {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
  if (!['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(key)) return
  event.preventDefault()
  if (mode.value === 'running') keys.add(key)
}
function keyup(event: KeyboardEvent) { keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key) }
function movePointer(event: PointerEvent) {
  if (!dragged || mode.value !== 'running' || !canvas.value) return
  const bounds = canvas.value.getBoundingClientRect()
  playerX = Math.max(42, Math.min(width - 42, (event.clientX - bounds.left) / bounds.width * width))
  draw()
}
function pointerdown(event: PointerEvent) {
  if (mode.value !== 'running') return
  dragged = true
  canvas.value?.setPointerCapture(event.pointerId)
  canvas.value?.focus()
  movePointer(event)
}
function visibility() { if (document.hidden) pause() }
async function fullscreen() {
  fullscreenError.value = false
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else if (root.value?.requestFullscreen) await root.value.requestFullscreen()
    else fullscreenError.value = true
  } catch { fullscreenError.value = true }
}
onMounted(() => {
  draw()
  window.addEventListener('blur', pause)
  window.addEventListener('keyup', keyup)
  document.addEventListener('visibilitychange', visibility)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('blur', pause)
  window.removeEventListener('keyup', keyup)
  document.removeEventListener('visibilitychange', visibility)
})
</script>

<template>
  <section ref="root" class="game-player" :aria-label="t('challenge.judge.game.title')">
    <div class="game-scorebar">
      <span>{{ t('challenge.judge.game.score') }} <strong>{{ number(score) }}</strong></span>
      <span role="timer">{{ t('challenge.judge.game.time', { seconds: number(seconds) }) }}</span>
      <button type="button" class="challenge-icon-button" :aria-label="t('challenge.judge.game.fullscreen')" @click="fullscreen"><AppIcon name="maximize" class="h-5 w-5" /></button>
    </div>
    <div class="game-stage">
      <canvas ref="canvas" :width="width" :height="height" tabindex="0" :aria-label="t('challenge.judge.game.canvasLabel')" :aria-describedby="instructionsId" @keydown="keydown" @blur="pause" @pointerdown="pointerdown" @pointermove="movePointer" @pointerup="dragged = false" @pointercancel="dragged = false" />
      <div v-if="mode !== 'running'" class="game-overlay">
        <p class="font-bold text-lg">{{ t(`challenge.judge.game.${mode}`) }}</p>
        <p v-if="mode === 'finished'" class="mt-2">{{ t('challenge.judge.game.finalScore', { score: number(score) }) }}</p>
        <button type="button" class="challenge-button mt-4" @click="start"><AppIcon name="play" class="h-4 w-4" />{{ t(mode === 'paused' ? 'challenge.judge.game.resume' : mode === 'finished' ? 'challenge.judge.game.restart' : 'challenge.judge.game.start') }}</button>
      </div>
    </div>
    <div class="game-bottom">
      <p :id="instructionsId" class="game-instructions">{{ t('challenge.judge.game.instructions') }}</p>
      <button v-if="mode === 'running'" type="button" class="challenge-button-secondary" @click="pause"><AppIcon name="pause" class="h-4 w-4" />{{ t('challenge.judge.game.pause') }}</button>
    </div>
    <p v-if="fullscreenError" role="status" class="game-instructions">{{ t('challenge.judge.game.fullscreenUnavailable') }}</p>
    <p class="game-demo-notice">{{ t('challenge.judge.game.demoNotice') }}</p>
    <a v-if="build" :href="build" target="_blank" rel="noopener noreferrer" class="challenge-button-secondary game-build-link"><AppIcon name="external-link" class="h-4 w-4" />{{ t('challenge.judge.game.openBuild') }}</a>
  </section>
</template>

<style scoped>
.game-player { min-inline-size: 0; background: white; }
.game-scorebar { display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding-block-end: .5rem; color: #010028; font-size: .875rem; font-variant-numeric: tabular-nums; }
.game-scorebar strong { margin-inline-start: .5rem; color: #5b3fd9; font-size: 1.3rem; }
.game-stage { position: relative; overflow: hidden; border-radius: .8rem; background: #010028; }
canvas { display: block; inline-size: 100%; aspect-ratio: 16 / 9; touch-action: none; }
canvas:focus-visible { outline-offset: -4px !important; }
.game-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1rem; background: #010028cc; color: white; text-align: center; }
.game-bottom { display: flex; align-items: start; justify-content: space-between; gap: .75rem; margin-block-start: 1rem; }
.game-instructions, .game-demo-notice { color: #010028b3; font-size: .8rem; line-height: 1.7; }
.game-bottom button { flex-shrink: 0; }
.game-demo-notice { margin-block-start: .75rem; }
.game-build-link { margin-block-start: 1rem; }
.game-player:fullscreen { display: flex; flex-direction: column; justify-content: center; padding: 1.5rem; overflow: auto; }
.game-player:fullscreen .game-stage { max-block-size: 70vh; }
.game-player:fullscreen canvas { block-size: 100%; max-block-size: 70vh; object-fit: contain; }
@media (max-width: 479px) { .game-bottom { flex-wrap: wrap; } .game-scorebar { gap: .4rem; font-size: .75rem; } }
</style>
