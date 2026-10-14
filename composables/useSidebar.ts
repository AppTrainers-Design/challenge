// Shared collapse state for the dashboard desktop sidebar.
// SSR-safe via useState so the header toggle and the sidebar stay in sync.
export const useSidebar = () => {
  const collapsed = useState<boolean>('dashboard-sidebar-collapsed', () => false)

  const toggle = () => { collapsed.value = !collapsed.value }

  return { collapsed, toggle }
}
