<script setup lang="ts">
/**
 * Branded video player for lesson/lecture media.
 * Three modes, decided from the src + isUploaded:
 *  - native  — self-hosted uploaded file → custom-controls <video> with resume support
 *  - embed   — recognized YouTube/Vimeo link → sandboxed provider iframe (no resume)
 *  - link    — anything else → safe external "watch" link (never breaks)
 * Emits throttled `position` (seconds) while a native video plays so the page can
 * persist it; `getPosition()` is exposed for a final flush on route leave.
 */
interface Props {
  src: string
  /** True when `src` is a self-hosted uploaded file (native player + resume). */
  isUploaded: boolean
  /** Last saved position (seconds) — seeked to once, on first metadata load. */
  startAt?: number
  title?: string
}

const props = withDefaults(defineProps<Props>(), { startAt: 0, title: '' })

const emit = defineEmits<{
  position: [seconds: number]
  /** Watched far enough to count as done (≥95% or reached the end) — fires once. */
  completed: []
  /** The media failed to load (expired signature, 404, decode error). */
  error: []
}>()

// A lesson counts as complete once the student watches ~95% — waiting for the exact
// last frame strands anyone who stops a second early (and the certificate is gated on it).
const COMPLETE_AT = 0.95

const { t } = useI18n()

// ─── Mode resolution ───
// safeUrl() is applied HERE (the sink) so every caller is covered (frontend-security rule 1).
const cleanSrc = computed(() => safeUrl(props.src))

/** Extract a YouTube video id from watch/short/embed/youtu.be URL forms. */
const youtubeId = (url: string) => {
  const m = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,20})/)
  return m ? m[1] : null
}

/** Extract a Vimeo video id (numeric). */
const vimeoId = (url: string) => {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return m ? m[1] : null
}

// Embed URLs are BUILT from the extracted id (never the raw backend string), so the
// origin is fixed to the two providers whitelisted in the CSP frame-src.
const embedSrc = computed(() => {
  if (!cleanSrc.value || props.isUploaded) return null
  const yt = youtubeId(cleanSrc.value)
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt}?rel=0`
  const vm = vimeoId(cleanSrc.value)
  if (vm) return `https://player.vimeo.com/video/${vm}`
  return null
})

const mode = computed<'native' | 'embed' | 'link' | 'none'>(() => {
  if (!cleanSrc.value) return 'none'
  if (props.isUploaded) return 'native'
  return embedSrc.value ? 'embed' : 'link'
})

// ─── Native player state ───
const wrapEl = ref<HTMLElement | null>(null)
const videoEl = ref<HTMLVideoElement | null>(null)

const playing = ref(false)
const buffering = ref(false)
const mediaFailed = ref(false)
const current = ref(0)
const duration = ref(0)
const bufferedPct = ref(0)
const muted = ref(false)
const volume = ref(1)
const rate = ref(1)
const speedOpen = ref(false)
const isFullscreen = ref(false)

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

const playedPct = computed(() => (duration.value ? (current.value / duration.value) * 100 : 0))

/** mm:ss (or h:mm:ss) — digits stay LTR via dir on the time element. */
const fmt = (s: number) => {
  const v = Math.max(0, Math.floor(s))
  const h = Math.floor(v / 3600)
  const m = Math.floor((v % 3600) / 60)
  const ss = String(v % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

// ─── Position reporting (throttled) ───
const EMIT_EVERY_MS = 10_000
let lastEmitAt = 0
let lastSent = -1

const emitPosition = (seconds: number, force = false) => {
  const rounded = Math.round(seconds)
  if (!force && rounded === lastSent) return
  lastSent = rounded
  lastEmitAt = Date.now()
  emit('position', rounded)
}

/** Exact live position for the page's final flush on route leave (null when N/A). */
const getPosition = () => {
  if (mode.value !== 'native' || !videoEl.value || !duration.value) return null
  return Math.round(videoEl.value.currentTime)
}

defineExpose({ getPosition })

// ─── Resume ───
const resumeToast = ref(false)
const resumeLabel = ref('')
let appliedStart = false
let toastTimer: ReturnType<typeof setTimeout> | null = null

const onLoadedMetadata = () => {
  const v = videoEl.value
  if (!v) return
  duration.value = v.duration || 0
  // Seek to the saved spot ONCE (a locale-switch refetch must not re-jump playback).
  if (!appliedStart) {
    appliedStart = true
    if (props.startAt > 0 && props.startAt < duration.value - 2) {
      v.currentTime = props.startAt
      current.value = props.startAt
      resumeLabel.value = fmt(props.startAt)
      resumeToast.value = true
      toastTimer = setTimeout(() => { resumeToast.value = false }, 6000)
    }
  }
}

const startOver = () => {
  const v = videoEl.value
  if (!v) return
  v.currentTime = 0
  current.value = 0
  emitPosition(0, true)
  resumeToast.value = false
}

// ─── Playback controls ───
const togglePlay = () => {
  const v = videoEl.value
  if (!v) return
  if (v.paused) {
    if (v.ended) v.currentTime = 0
    v.play()
  } else {
    v.pause()
  }
}

let completedFired = false
const markCompleted = () => {
  if (completedFired) return
  completedFired = true
  emit('completed')
}

const onTimeUpdate = () => {
  const v = videoEl.value
  if (!v) return
  current.value = v.currentTime
  if (playing.value && Date.now() - lastEmitAt >= EMIT_EVERY_MS) emitPosition(v.currentTime)
  if (duration.value && v.currentTime >= duration.value * COMPLETE_AT) markCompleted()
}

const onProgress = () => {
  const v = videoEl.value
  if (!v || !v.buffered.length || !duration.value) return
  bufferedPct.value = Math.min(100, (v.buffered.end(v.buffered.length - 1) / duration.value) * 100)
}

const onPlay = () => { playing.value = true; scheduleHide() }
const onPause = () => {
  playing.value = false
  showControls.value = true
  const v = videoEl.value
  // Don't overwrite the fresh 0 that onEnded just saved (pause fires alongside ended).
  if (v && !v.ended) emitPosition(v.currentTime)
}
const onEnded = () => {
  emitPosition(0, true)
  markCompleted()
}

const onError = () => {
  mediaFailed.value = true
  emit('error')
}

// The player instance is reused across in-page lesson navigation (param-only route
// change patches rather than remounts); reset per-video state so a new src starts clean.
watch(() => props.src, () => {
  appliedStart = false
  completedFired = false
  mediaFailed.value = false
  buffering.value = false
  playing.value = false
  current.value = 0
  duration.value = 0
  bufferedPct.value = 0
  resumeToast.value = false
})

const onSeek = (e: Event) => {
  const v = videoEl.value
  if (!v) return
  const value = Number((e.target as HTMLInputElement).value)
  v.currentTime = value
  current.value = value
}

const seekBy = (delta: number) => {
  const v = videoEl.value
  if (!v || !duration.value) return
  v.currentTime = Math.min(Math.max(0, v.currentTime + delta), duration.value)
}

// ─── Volume / speed / fullscreen ───
const toggleMute = () => {
  const v = videoEl.value
  if (!v) return
  muted.value = !muted.value
  v.muted = muted.value
}

const onVolume = (e: Event) => {
  const v = videoEl.value
  if (!v) return
  volume.value = Number((e.target as HTMLInputElement).value)
  v.volume = volume.value
  if (volume.value > 0 && muted.value) { muted.value = false; v.muted = false }
}

const setRate = (r: number) => {
  const v = videoEl.value
  if (!v) return
  rate.value = r
  v.playbackRate = r
  speedOpen.value = false
}

const toggleFullscreen = () => {
  if (document.fullscreenElement) document.exitFullscreen()
  else wrapEl.value?.requestFullscreen()
}

const onFullscreenChange = () => { isFullscreen.value = document.fullscreenElement === wrapEl.value }

// ─── Controls auto-hide ───
const showControls = ref(true)
let hideTimer: ReturnType<typeof setTimeout> | null = null

const scheduleHide = () => {
  if (hideTimer) clearTimeout(hideTimer)
  showControls.value = true
  if (!playing.value) return
  hideTimer = setTimeout(() => {
    // Keep controls up while a menu is open or focus sits inside them.
    if (speedOpen.value || wrapEl.value?.contains(document.activeElement)) return
    showControls.value = false
  }, 2600)
}

// ─── Keyboard ───
const onKeydown = (e: KeyboardEvent) => {
  const target = e.target as HTMLElement
  const onRange = target instanceof HTMLInputElement && target.type === 'range'
  switch (e.key) {
    case ' ':
      if (target.tagName === 'BUTTON' || onRange) return // let the control handle it
      e.preventDefault()
      togglePlay()
      break
    case 'k': case 'K':
      togglePlay()
      break
    case 'ArrowLeft':
      if (onRange) return
      e.preventDefault()
      seekBy(-10)
      break
    case 'ArrowRight':
      if (onRange) return
      e.preventDefault()
      seekBy(10)
      break
    case 'm': case 'M':
      toggleMute()
      break
    case 'f': case 'F':
      toggleFullscreen()
      break
    case 'Escape':
      speedOpen.value = false
      break
  }
  scheduleHide()
}

// ─── Wiring ───
const onDocClick = (e: MouseEvent) => {
  if (speedOpen.value && wrapEl.value && !wrapEl.value.contains(e.target as Node)) speedOpen.value = false
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange)
  document.addEventListener('click', onDocClick)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  document.removeEventListener('click', onDocClick)
  if (hideTimer) clearTimeout(hideTimer)
  if (toastTimer) clearTimeout(toastTimer)
})
</script>

<template>
  <!-- NATIVE: self-hosted file, custom controls + resume -->
  <div
    v-if="mode === 'native'"
    ref="wrapEl"
    class="player"
    :class="{ 'player--idle': !showControls && playing }"
    tabindex="0"
    role="region"
    :aria-label="title || t('learn.content.watch')"
    @keydown="onKeydown"
    @mousemove="scheduleHide"
    @touchstart.passive="scheduleHide"
    @focusin="scheduleHide"
    @contextmenu.prevent
  >
    <!-- Download deterrents: no native download control, no PiP, and the wrapper
         blocks the context menu ("Save video as…"). Real protection is server-side —
         lesson videos are only served through short-lived signed URLs. -->
    <video
      ref="videoEl"
      class="player__video"
      :src="cleanSrc"
      preload="metadata"
      playsinline
      controlslist="nodownload noremoteplayback"
      disablepictureinpicture
      @click="togglePlay"
      @dblclick="toggleFullscreen"
      @loadedmetadata="onLoadedMetadata"
      @timeupdate="onTimeUpdate"
      @progress="onProgress"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @waiting="buffering = true"
      @playing="buffering = false"
      @canplay="buffering = false"
      @error="onError"
    ></video>

    <!-- Center play affordance (paused) -->
    <button
      v-if="!playing && !buffering && !mediaFailed"
      type="button"
      class="player__big-play"
      :aria-label="t('learn.player.play')"
      @click="togglePlay"
    >
      <AppIcon name="play" class="w-7 h-7 ms-0.5" />
    </button>

    <!-- Buffering ring -->
    <div v-if="buffering && !mediaFailed" class="player__spinner" aria-hidden="true"></div>

    <!-- Media failed: keep a way out -->
    <div v-if="mediaFailed" class="player__error">
      <p>{{ t('learn.content.error') }}</p>
      <a :href="cleanSrc" target="_blank" rel="noopener noreferrer">{{ t('learn.content.watch') }}</a>
    </div>

    <!-- Resume toast -->
    <Transition name="toast">
      <div v-if="resumeToast" class="player__toast" role="status">
        <span>{{ t('learn.content.resumedFrom', { time: resumeLabel }) }}</span>
        <button type="button" @click="startOver">{{ t('learn.content.startOver') }}</button>
      </div>
    </Transition>

    <!-- Control deck — hidden once the media has failed (the error overlay owns the UI) -->
    <div v-if="!mediaFailed" class="player__deck" :class="{ 'player__deck--hidden': !showControls && playing }">
      <input
        class="scrubber"
        dir="ltr"
        type="range"
        min="0"
        :max="duration || 0"
        step="0.1"
        :value="current"
        :disabled="!duration"
        :aria-label="t('learn.player.seek')"
        :aria-valuetext="`${fmt(current)} / ${fmt(duration)}`"
        :style="{ '--p': playedPct + '%', '--b': Math.max(bufferedPct, playedPct) + '%' }"
        @input="onSeek"
      />

      <div class="player__row">
        <button type="button" class="ctrl-btn" :aria-label="playing ? t('learn.player.pause') : t('learn.player.play')" @click="togglePlay">
          <AppIcon :name="playing ? 'pause' : 'play'" class="w-5 h-5" />
        </button>

        <span class="player__time" dir="ltr">{{ fmt(current) }} / {{ fmt(duration) }}</span>

        <span class="player__spacer"></span>

        <div class="speed">
          <button
            type="button"
            class="ctrl-btn ctrl-btn--speed"
            :aria-label="t('learn.player.speed')"
            :aria-expanded="speedOpen"
            @click="speedOpen = !speedOpen"
          >{{ rate }}&times;</button>
          <div v-if="speedOpen" class="speed__menu" role="menu">
            <button
              v-for="s in SPEEDS"
              :key="s"
              type="button"
              role="menuitem"
              class="speed__item"
              :class="{ 'speed__item--on': s === rate }"
              @click="setRate(s)"
            >{{ s }}&times;</button>
          </div>
        </div>

        <button type="button" class="ctrl-btn" :aria-label="muted || volume === 0 ? t('learn.player.unmute') : t('learn.player.mute')" @click="toggleMute">
          <AppIcon :name="muted || volume === 0 ? 'volume-x' : 'volume-high'" class="w-5 h-5" />
        </button>
        <input
          class="vol"
          dir="ltr"
          type="range"
          min="0"
          max="1"
          step="0.05"
          :value="muted ? 0 : volume"
          :aria-label="t('learn.player.volume')"
          @input="onVolume"
        />

        <button type="button" class="ctrl-btn" :aria-label="isFullscreen ? t('learn.player.exitFullscreen') : t('learn.player.fullscreen')" @click="toggleFullscreen">
          <AppIcon :name="isFullscreen ? 'minimize' : 'maximize'" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>

  <!-- EMBED: recognized provider, kept inside the page -->
  <div v-else-if="mode === 'embed'" class="player player--embed">
    <iframe
      class="player__frame"
      :src="embedSrc!"
      :title="title || t('learn.content.watch')"
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"
      loading="lazy"
    ></iframe>
  </div>

  <!-- LINK: unknown external source — safe fallback, unchanged behavior -->
  <a v-else-if="mode === 'link'" :href="cleanSrc" target="_blank" rel="noopener noreferrer" class="player-link">
    <AppIcon name="play" class="w-5 h-5" />
    {{ t('learn.content.watch') }}
  </a>
</template>

<style scoped>
/* ─── Stage ─── */
.player {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 1rem;
  overflow: hidden;
  background: #0b0a1a; /* near-black with a whisper of the brand purple */
  outline: none;
}

.player:focus-visible {
  outline: 2px solid #8062FD;
  outline-offset: 2px;
}

.player--idle {
  cursor: none;
}

.player__video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.player:fullscreen {
  aspect-ratio: auto;
  height: 100%;
  border-radius: 0;
}

/* ─── Center play ─── */
.player__big-play {
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 9999px;
  color: #fff;
  background: linear-gradient(135deg, #8062FD, #6B4AEE);
  box-shadow: 0 10px 28px rgba(128, 98, 253, 0.35);
  transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 2;
}

.player__big-play:hover {
  transform: scale(1.06);
}

.player__big-play:focus-visible {
  outline: 2px solid #8062FD;
  outline-offset: 3px;
}

/* ─── Buffering / error ─── */
.player__spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
  border: 3px solid rgba(255, 255, 255, 0.25);
  border-top-color: #8062FD;
  animation: player-spin 0.8s linear infinite;
  z-index: 2;
}

@keyframes player-spin {
  to { rotate: 360deg; }
}

.player__error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.875rem;
  font-weight: 600;
  z-index: 2;
}

.player__error a {
  color: #8062FD;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.player__error a:focus-visible {
  outline: 2px solid #8062FD;
  outline-offset: 2px;
}

/* ─── Resume toast ─── */
.player__toast {
  position: absolute;
  bottom: 4.75rem;
  inset-inline-start: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  max-width: calc(100% - 2rem);
  padding: 0.5rem 0.875rem;
  border-radius: 0.75rem;
  background: rgba(8, 6, 26, 0.92);
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.8125rem;
  font-weight: 600;
  z-index: 3;
}

.player__toast button {
  color: #8062FD;
  font-weight: 700;
  white-space: nowrap;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.player__toast button:focus-visible {
  outline: 2px solid #8062FD;
  outline-offset: 2px;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s cubic-bezier(0.22, 1, 0.36, 1), translate 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  translate: 0 0.5rem;
}

/* ─── Control deck ─── */
.player__deck {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  padding: 1.75rem 0.875rem 0.625rem;
  background: linear-gradient(to top, rgba(5, 4, 20, 0.86), rgba(5, 4, 20, 0.4) 55%, transparent);
  transition: opacity 0.2s ease;
  z-index: 2;
}

.player__deck--hidden {
  opacity: 0;
  pointer-events: none;
}

.player__row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.25rem;
}

.player__time {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  font-variant-numeric: tabular-nums;
  padding-inline: 0.25rem;
}

.player__spacer {
  flex: 1;
}

.ctrl-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.625rem;
  color: #fff;
  transition: background-color 0.15s;
}

.ctrl-btn:hover {
  background: rgba(255, 255, 255, 0.14);
}

.ctrl-btn:focus-visible {
  outline: 2px solid #8062FD;
  outline-offset: 2px;
}

.ctrl-btn--speed {
  width: auto;
  padding-inline: 0.625rem;
  font-size: 0.8125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* ─── Scrubber ─── */
.scrubber {
  -webkit-appearance: none;
  appearance: none;
  display: block;
  width: 100%;
  height: 1.125rem;
  background: transparent;
  cursor: pointer;
}

.scrubber:disabled {
  cursor: default;
}

.scrubber:focus-visible {
  outline: 2px solid #8062FD;
  outline-offset: 2px;
  border-radius: 0.5rem;
}

.scrubber::-webkit-slider-runnable-track {
  height: 0.25rem;
  border-radius: 9999px;
  /* played (brand) → buffered (bright) → rest (dim) */
  background: linear-gradient(
    to right,
    #8062FD 0 var(--p, 0%),
    rgba(255, 255, 255, 0.42) var(--p, 0%) var(--b, 0%),
    rgba(255, 255, 255, 0.2) var(--b, 0%) 100%
  );
}

.scrubber::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 0.875rem;
  height: 0.875rem;
  margin-top: -0.3125rem;
  border-radius: 9999px;
  background: #fff;
  border: 2px solid #8062FD;
  opacity: 0;
  transition: opacity 0.15s;
}

.player:hover .scrubber::-webkit-slider-thumb,
.scrubber:focus-visible::-webkit-slider-thumb {
  opacity: 1;
}

.scrubber::-moz-range-track {
  height: 0.25rem;
  border-radius: 9999px;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0.42) 0 var(--b, 0%),
    rgba(255, 255, 255, 0.2) var(--b, 0%) 100%
  );
}

.scrubber::-moz-range-progress {
  height: 0.25rem;
  border-radius: 9999px;
  background: #8062FD;
}

.scrubber::-moz-range-thumb {
  width: 0.875rem;
  height: 0.875rem;
  border-radius: 9999px;
  background: #fff;
  border: 2px solid #8062FD;
  opacity: 0;
  transition: opacity 0.15s;
}

.player:hover .scrubber::-moz-range-thumb,
.scrubber:focus-visible::-moz-range-thumb {
  opacity: 1;
}

/* ─── Volume ─── */
.vol {
  -webkit-appearance: none;
  appearance: none;
  width: 4.5rem;
  height: 1rem;
  background: transparent;
  cursor: pointer;
}

.vol:focus-visible {
  outline: 2px solid #8062FD;
  outline-offset: 2px;
  border-radius: 0.5rem;
}

.vol::-webkit-slider-runnable-track {
  height: 0.1875rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.35);
}

.vol::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 0.75rem;
  height: 0.75rem;
  margin-top: -0.28rem;
  border-radius: 9999px;
  background: #fff;
}

.vol::-moz-range-track {
  height: 0.1875rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.35);
}

.vol::-moz-range-progress {
  height: 0.1875rem;
  border-radius: 9999px;
  background: #fff;
}

.vol::-moz-range-thumb {
  width: 0.75rem;
  height: 0.75rem;
  border: none;
  border-radius: 9999px;
  background: #fff;
}

@media (max-width: 480px) {
  .vol {
    display: none;
  }
}

/* ─── Speed menu ─── */
.speed {
  position: relative;
}

.speed__menu {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  inset-inline-end: 0;
  display: flex;
  flex-direction: column;
  min-width: 5rem;
  padding: 0.375rem;
  border-radius: 0.75rem;
  background: rgba(8, 6, 26, 0.95);
  z-index: 4;
}

.speed__item {
  padding: 0.4375rem 0.875rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  text-align: start;
  font-variant-numeric: tabular-nums;
  transition: background-color 0.15s;
}

.speed__item:hover {
  background: rgba(255, 255, 255, 0.12);
}

.speed__item:focus-visible {
  outline: 2px solid #8062FD;
  outline-offset: -2px;
}

.speed__item--on {
  color: #8062FD;
  font-weight: 700;
}

/* ─── Embed ─── */
.player--embed {
  aspect-ratio: 16 / 9;
}

.player__frame {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}

/* ─── External fallback link (matches the page's .media-link) ─── */
.player-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #5B3FD9;
  background: rgba(128, 98, 253, 0.1);
  max-width: 100%;
}

.player-link:hover {
  background: rgba(128, 98, 253, 0.18);
}

.player-link:focus-visible {
  outline: 2px solid #8062FD;
  outline-offset: 2px;
}

/* ─── Reduced motion ─── */
@media (prefers-reduced-motion: reduce) {
  .player__big-play,
  .player__deck,
  .scrubber::-webkit-slider-thumb,
  .scrubber::-moz-range-thumb,
  .toast-enter-active,
  .toast-leave-active {
    transition: none;
  }
  .player__big-play:hover {
    transform: none;
  }
  .toast-enter-from,
  .toast-leave-to {
    translate: none;
  }
  .player__spinner {
    animation-duration: 2.5s;
  }
}
</style>
