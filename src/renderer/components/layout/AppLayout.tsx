import { useUIStore } from '../../stores/uiStore'
import { SplitPane } from './SplitPane'
import { Sidebar } from './Sidebar'
import { MainPanel } from './MainPanel'

export function AppLayout() {
  const { sidebarWidth, setSidebarWidth } = useUIStore()

  return (
    <div className="h-full">
      <SplitPane
        left={<Sidebar />}
        right={<MainPanel />}
        defaultLeftWidth={sidebarWidth}
        minLeftWidth={200}
        maxLeftWidth={400}
        onWidthChange={setSidebarWidth}
      />
    </div>
  )
}
