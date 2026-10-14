<script setup lang="ts">
// Auto-generated icon set. Each entry is the inner SVG markup for a 24x24 viewBox.
// Stroke icons use `stroke="currentColor"`; fill icons use `fill="currentColor"`.
// Size & color come from the consumer via class/width/height (attribute fallthrough),
// e.g. <AppIcon name="calendar" class="w-4 h-4 text-brand" />
interface IconDef {
  mode: 'stroke' | 'fill'
  sw?: string
  body: string
}

const icons: Record<string, IconDef> = {
  'graduation-cap': { mode: 'stroke', sw: '1.8', body: '<path d="m2 10 10-5 10 5-10 5zM6 12v5c4 3 8 3 12 0v-5M22 10v7"/>' },
  'key': { mode: 'stroke', sw: '1.8', body: '<circle cx="7" cy="7" r="4"/><path d="m10 10 11 11M17 17l3-3M14 14l3-3"/>' },
  'help-circle': { mode: 'stroke', sw: '1.8', body: '<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4M12 17h.01"/>' },
  'plus': { mode: 'stroke', sw: '2', body: '<path d="M12 5v14M5 12h14"/>' },
  'pencil': { mode: 'stroke', sw: '2', body: '<path d="m16 3 5 5L8 21H3v-5zM14 5l5 5"/>' },
  'trash': { mode: 'stroke', sw: '2', body: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>' },
  'refresh': { mode: 'stroke', sw: '2', body: '<path d="M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 14 6M4 12a8 8 0 0 0 14 6"/>' },
  'check': { mode: 'stroke', sw: '2', body: '<path d="m5 12 4 4L19 6"/>' },
  'copy': { mode: 'stroke', sw: '2', body: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>' },
  'external-link': { mode: 'stroke', sw: '2', body: '<path d="M14 3h7v7M21 3 10 14M10 3H3v18h18v-7"/>' },
  'shield-check': { mode: 'stroke', sw: '2', body: '<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6zM8 12l3 3 5-6"/>' },
  'scale': { mode: 'stroke', sw: '2', body: '<path d="M12 3v18M5 21h14M4 6h16M4 6l-3 8h6zM20 6l-3 8h6z"/>' },
  'alert-triangle': { mode: 'stroke', sw: '2', body: '<path d="M12 3 1 21h22zM12 9v5M12 17h.01"/>' },
  'x-circle': { mode: 'stroke', sw: '2', body: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>' },
  'info': { mode: 'stroke', sw: '2', body: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>' },
  'unlock': { mode: 'stroke', sw: '2', body: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0M12 14v3"/>' },
  'history': { mode: 'stroke', sw: '2', body: '<path d="M3 3v6h6M3 9a9 9 0 1 1 0 6M12 7v5l3 2"/>' },
  'sliders': { mode: 'stroke', sw: '2', body: '<path d="M4 3v6M4 13v8M12 3v10M12 17v4M20 3v2M20 9v12M1 9h6M9 17h6M17 5h6"/>' },
  'flask': { mode: 'stroke', sw: '2', body: '<path d="M8 3h8M9 3v7L3 21h18l-6-11V3M7 15h10"/>' },
  'chart-bar': { mode: 'stroke', sw: '2', body: '<path d="M3 3v18h18M7 17v-5M12 17V7M17 17V3"/>' },
  'archive': { mode: 'stroke', sw: '2', body: '<rect x="2" y="3" width="20" height="4" rx="1"/><path d="M4 7v14h16V7M9 11h6"/>' },
  'photo': { mode: 'stroke', sw: '2', body: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1"/><path d="m3 17 6-6 4 4 4-4 4 4"/>' },
  'film': { mode: 'stroke', sw: '2', body: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4"/>' },
  'code': { mode: 'stroke', sw: '2', body: '<path d="m8 6-6 6 6 6M16 6l6 6-6 6M14 3l-4 18"/>' },
  'facebook': { mode: 'stroke', sw: '2', body: "<path d=\"M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z\"/>" },
  'twitter': { mode: 'stroke', sw: '2', body: "<path d=\"M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z\"/>" },
  'instagram': { mode: 'stroke', sw: '2', body: "<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"5\" ry=\"5\"/><path d=\"M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z\"/><line x1=\"17.5\" y1=\"6.5\" x2=\"17.51\" y2=\"6.5\"/>" },
  'youtube': { mode: 'stroke', sw: '2', body: "<path d=\"M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z\"/><polygon points=\"9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02\"/>" },
  'linkedin': { mode: 'stroke', sw: '2', body: "<path d=\"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z\"/><rect x=\"2\" y=\"9\" width=\"4\" height=\"12\"/><circle cx=\"4\" cy=\"4\" r=\"2\"/>" },
  'globe': { mode: 'stroke', sw: '2', body: "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\"/><path d=\"M2 12h20\"/>" },
  'caret-down': { mode: 'stroke', sw: '2.5', body: "<path d=\"m6 9 6 6 6-6\"/>" },
  'menu': { mode: 'stroke', sw: '2', body: "<line x1=\"3\" y1=\"6\" x2=\"21\" y2=\"6\"/> <line x1=\"3\" y1=\"12\" x2=\"21\" y2=\"12\"/> <line x1=\"3\" y1=\"18\" x2=\"21\" y2=\"18\"/>" },
  'sidebar': { mode: 'stroke', sw: '2', body: "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><line x1=\"9\" y1=\"3\" x2=\"9\" y2=\"21\"/>" },
  'chevrons-up-down': { mode: 'stroke', sw: '2', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"m7 15 5 5 5-5\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"m7 9 5-5 5 5\"/>" },
  'arrow-right': { mode: 'stroke', sw: '2.5', body: "<line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"></line><polyline points=\"12 5 19 12 12 19\"></polyline>" },
  'arrow-left': { mode: 'stroke', sw: '2', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18\" />" },
  'eye': { mode: 'stroke', sw: '1.8', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z\" /><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M15 12a3 3 0 11-6 0 3 3 0 016 0z\" />" },
  'eye-off': { mode: 'stroke', sw: '1.8', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.774 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88\" />" },
  'target': { mode: 'stroke', sw: '1.8', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M21 12a9 9 0 11-18 0 9 9 0 0118 0z\" /><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z\" /><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z\" />" },
  'users': { mode: 'stroke', sw: '1.8', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z\" />" },
  'search': { mode: 'stroke', sw: '2', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z\" />" },
  'funnel': { mode: 'stroke', sw: '2', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z\" />" },
  'chevron-down': { mode: 'stroke', sw: '2.5', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M19.5 8.25l-7.5 7.5-7.5-7.5\" />" },
  'calendar': { mode: 'stroke', sw: '1.5', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5\" />" },
  'location': { mode: 'stroke', sw: '1.5', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M15 10.5a3 3 0 11-6 0 3 3 0 016 0z\" /><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z\" />" },
  'paper-plane': { mode: 'stroke', sw: '2', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5\" />" },
  'envelope': { mode: 'stroke', sw: '1.8', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75\" />" },
  'phone': { mode: 'stroke', sw: '1.8', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z\" />" },
  'book-open': { mode: 'stroke', sw: '1.8', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25\" />" },
  'academic-cap': { mode: 'stroke', sw: '1.8', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5\" />" },
  'check-circle': { mode: 'fill', body: "<path fill-rule=\"evenodd\" d=\"M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z\" clip-rule=\"evenodd\" />" },
  'qr-code': { mode: 'stroke', sw: '2', body: "<rect width=\"5\" height=\"5\" x=\"3\" y=\"3\" rx=\"1\"/><rect width=\"5\" height=\"5\" x=\"16\" y=\"3\" rx=\"1\"/><rect width=\"5\" height=\"5\" x=\"3\" y=\"16\" rx=\"1\"/><path d=\"M21 16h-3a2 2 0 0 0-2 2v3\"/><path d=\"M21 21v.01\"/><path d=\"M12 7v3a2 2 0 0 1-2 2H7\"/><path d=\"M3 12h.01\"/><path d=\"M12 3h.01\"/><path d=\"M12 16v.01\"/><path d=\"M16 12h1\"/><path d=\"M21 12v.01\"/><path d=\"M12 21v-1\"/>" },
  'play': { mode: 'fill', body: "<path fill-rule=\"evenodd\" d=\"M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z\" clip-rule=\"evenodd\" />" },
  'pause': { mode: 'fill', body: "<rect x=\"6\" y=\"4\" width=\"4.5\" height=\"16\" rx=\"1.5\"/><rect x=\"13.5\" y=\"4\" width=\"4.5\" height=\"16\" rx=\"1.5\"/>" },
  'volume-high': { mode: 'stroke', sw: '2', body: "<path d=\"M11 5 6 9H2v6h4l5 4V5z\"/><path d=\"M15.54 8.46a5 5 0 0 1 0 7.07\"/><path d=\"M19.07 4.93a10 10 0 0 1 0 14.14\"/>" },
  'volume-x': { mode: 'stroke', sw: '2', body: "<path d=\"M11 5 6 9H2v6h4l5 4V5z\"/><line x1=\"22\" y1=\"9\" x2=\"16\" y2=\"15\"/><line x1=\"16\" y1=\"9\" x2=\"22\" y2=\"15\"/>" },
  'maximize': { mode: 'stroke', sw: '2', body: "<path d=\"M8 3H5a2 2 0 0 0-2 2v3\"/><path d=\"M21 8V5a2 2 0 0 0-2-2h-3\"/><path d=\"M3 16v3a2 2 0 0 0 2 2h3\"/><path d=\"M16 21h3a2 2 0 0 0 2-2v-3\"/>" },
  'minimize': { mode: 'stroke', sw: '2', body: "<path d=\"M8 3v3a2 2 0 0 1-2 2H3\"/><path d=\"M21 8h-3a2 2 0 0 1-2-2V3\"/><path d=\"M3 16h3a2 2 0 0 1 2 2v3\"/><path d=\"M16 21v-3a2 2 0 0 1 2-2h3\"/>" },
  'star': { mode: 'stroke', sw: '1.8', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z\" />" },
  'clock': { mode: 'stroke', sw: '1.5', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z\" />" },
  'lock': { mode: 'stroke', sw: '1.8', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 0h10.5a2.25 2.25 0 012.25 2.25v6.75a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25v-6.75a2.25 2.25 0 012.25-2.25z\" />" },
  'gamepad': { mode: 'stroke', sw: '2.5', body: "<rect x=\"2\" y=\"6\" width=\"20\" height=\"12\" rx=\"2\" ry=\"2\"></rect><path d=\"M6 12h4\"></path><path d=\"M8 10v4\"></path><path d=\"M15 13h.01\"></path><path d=\"M18 11h.01\"></path>" },
  'trophy': { mode: 'stroke', sw: '2.5', body: "<path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"></path><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"></path><path d=\"M4 22h16\"></path><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\"></path><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\"></path><path d=\"M18 2H6v7a6 6 0 0 0 12 0V2Z\"></path>" },
  'bookmark': { mode: 'stroke', sw: '2', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z\" />" },
  'star-solid': { mode: 'fill', body: "<path fill-rule=\"evenodd\" d=\"M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96-1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z\" clip-rule=\"evenodd\" />" },
  'login': { mode: 'stroke', sw: '2.5', body: "<path d=\"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4\"/> <polyline points=\"10 17 15 12 10 7\"/> <line x1=\"15\" y1=\"12\" x2=\"3\" y2=\"12\"/>" },
  'tag': { mode: 'stroke', sw: '1.5', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z\" /><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M6 6h.008v.008H6V6z\" />" },
  'link': { mode: 'stroke', sw: '2', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244\" />" },
  'share': { mode: 'stroke', sw: '1.5', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z\" />" },
  'user-plus': { mode: 'stroke', sw: '2.5', body: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/> <circle cx=\"9\" cy=\"7\" r=\"4\"/> <line x1=\"19\" y1=\"8\" x2=\"19\" y2=\"14\"/> <line x1=\"22\" y1=\"11\" x2=\"16\" y2=\"11\"/>" },
  'user': { mode: 'stroke', sw: '2', body: "<path d=\"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2\"/> <circle cx=\"12\" cy=\"7\" r=\"4\"/>" },
  'logout': { mode: 'stroke', sw: '2', body: "<path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"/> <polyline points=\"16 17 21 12 16 7\"/> <line x1=\"21\" y1=\"12\" x2=\"9\" y2=\"12\"/>" },
  'grid': { mode: 'stroke', sw: '2', body: "<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"/> <rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"/> <rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1.5\"/> <rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1.5\"/>" },
  'close': { mode: 'stroke', sw: '2', body: "<line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/> <line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/>" },
  'award': { mode: 'stroke', sw: '2', body: "<circle cx=\"12\" cy=\"8\" r=\"7\"/> <polyline points=\"8.21 13.89 7 23 12 20 17 23 15.79 13.88\"/>" },
  'download': { mode: 'stroke', sw: '1.8', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3\" />" },
  'upload': { mode: 'stroke', sw: '1.8', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5\" />" },
  'document-text': { mode: 'stroke', sw: '1.8', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z\" />" },
  'clipboard': { mode: 'stroke', sw: '1.8', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z\" />" },
  'paperclip': { mode: 'stroke', sw: '1.8', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13\" />" },
  'settings': { mode: 'stroke', sw: '1.8', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z\" /><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M15 12a3 3 0 11-6 0 3 3 0 016 0z\" />" },
  'bell': { mode: 'stroke', sw: '1.8', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0\" />" },
  'monitor': { mode: 'stroke', sw: '1.8', body: "<rect x=\"2\" y=\"3\" width=\"20\" height=\"14\" rx=\"2\"/><line x1=\"8\" y1=\"21\" x2=\"16\" y2=\"21\"/><line x1=\"12\" y1=\"17\" x2=\"12\" y2=\"21\"/>" },
  'building': { mode: 'stroke', sw: '1.8', body: "<rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"2\"/><path d=\"M9 22v-4h6v4\"/><path d=\"M8 6h.01\"/><path d=\"M12 6h.01\"/><path d=\"M16 6h.01\"/><path d=\"M8 10h.01\"/><path d=\"M12 10h.01\"/><path d=\"M16 10h.01\"/><path d=\"M8 14h.01\"/><path d=\"M12 14h.01\"/><path d=\"M16 14h.01\"/>" },
  'shuffle': { mode: 'stroke', sw: '1.8', body: "<path d=\"M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22\"/><path d=\"m18 2 4 4-4 4\"/><path d=\"M2 6h1.9c1.5 0 2.9.9 3.6 2.2\"/><path d=\"M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8\"/><path d=\"m18 14 4 4-4 4\"/>" },
  'bell-off': { mode: 'stroke', sw: '1.8', body: "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M13.73 21a2 2 0 0 1-3.46 0M18.63 13A17.89 17.89 0 0 1 18 8M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14M18 8a6 6 0 0 0-9.33-5M3 3l18 18\" />" },
}

interface Props {
  name: string
}

const props = defineProps<Props>()

const icon = computed(() => icons[props.name])

if (import.meta.dev && !icons[props.name]) {
  console.warn(`[AppIcon] unknown icon name: "${props.name}"`)
}
</script>

<template>
  <svg
    v-if="icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    :fill="icon.mode === 'fill' ? 'currentColor' : 'none'"
    :stroke="icon.mode === 'stroke' ? 'currentColor' : undefined"
    :stroke-width="icon.sw"
    stroke-linecap="round"
    stroke-linejoin="round"
    v-html="icon.body"
  />
</template>
