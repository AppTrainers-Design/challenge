<template>
  <div class="challenge-shell"><slot /></div>
</template>
<style>
.challenge-shell .challenge-page { max-inline-size: 1280px; margin-inline: auto; padding: 2rem; }
.challenge-shell .challenge-heading { color: #010028; font-size: 1.875rem; line-height: 1.3; font-weight: 800; text-wrap: balance; }
.challenge-shell .challenge-subtitle { margin-block-start: .65rem; max-inline-size: 70ch; line-height: 1.7; color: #010028cc; }
.challenge-shell .challenge-panel { border: 1px solid #eeecf9; border-radius: 1rem; background: white; padding: 1.5rem; }
.challenge-shell .challenge-button, .challenge-shell .challenge-button-secondary { display: inline-flex; align-items: center; justify-content: center; gap: .5rem; min-block-size: 44px; padding: .65rem 1.1rem; border-radius: .75rem; font-weight: 600; font-size: .875rem; line-height: 1.5; transition: background-color .15s ease-out; }
.challenge-shell .challenge-button { background: #6B4AEE; color: white; }
.challenge-shell .challenge-button:hover { background: #5B3FD9; }
.challenge-shell .challenge-button-secondary { background: white; color: #5B3FD9; border: 1px solid #d8d1fa; }
.challenge-shell .challenge-button-secondary:hover { background: #f2f0fe; }
.challenge-shell button:disabled { cursor: not-allowed; opacity: .55; }
.challenge-shell .challenge-field { inline-size: 100%; min-block-size: 44px; border: 1px solid #d1d5db; border-radius: .75rem; background: white; padding: .7rem .9rem; color: #010028; caret-color: #6B4AEE; }
.challenge-shell .challenge-field::placeholder { color: #656171; }
.challenge-shell .challenge-field:disabled { background: #f8f7fc; }
.challenge-shell .challenge-label { display: block; margin-block-end: .5rem; font-size: .875rem; font-weight: 600; color: #010028; }
.challenge-shell .challenge-icon-button { display: inline-flex; align-items: center; justify-content: center; min-inline-size: 40px; min-block-size: 40px; border-radius: .6rem; color: #5B3FD9; }
.challenge-shell .challenge-icon-button:hover { background: #f2f0fe; }
.challenge-shell :is(button, a, input, select, textarea, [tabindex]):focus-visible { outline: 2px solid #6B4AEE; outline-offset: 3px; }
.challenge-shell ::selection { background: #8062fd30; color: #010028; }
.challenge-shell :is(a, button) { text-underline-offset: 3px; }
.challenge-shell :is(table, [role=timer]) { font-variant-numeric: tabular-nums; }
.challenge-shell * { scrollbar-color: #9a82fe #f2f0fe; scrollbar-width: thin; }
@media (max-width: 639px) { .challenge-shell .challenge-page { padding: 1.25rem; } .challenge-shell .challenge-heading { font-size: 1.5rem; } .challenge-shell .challenge-panel { padding: 1.1rem; } }
@media (prefers-reduced-motion: reduce) { .challenge-shell *, .challenge-shell *::before, .challenge-shell *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; } }
</style>
