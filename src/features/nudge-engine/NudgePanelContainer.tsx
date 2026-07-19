import { useNudgeStore } from './store'
import { NudgePanelView } from './NudgePanelView'

export function NudgePanelContainer() {
  const pending = useNudgeStore(s => s.pending)
  const history = useNudgeStore(s => s.history)
  const dismiss = useNudgeStore(s => s.dismiss)

  return (
    <NudgePanelView
      pending={pending}
      history={history}
      onDismiss={dismiss}
      onAcknowledge={() => {}}
    />
  )
}
