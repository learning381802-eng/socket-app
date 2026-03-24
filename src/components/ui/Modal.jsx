import { useStore } from '../../store'
import NewChatModal from '../chat/NewChatModal'
import SettingsModal from './SettingsModal'

// Route modal string to component
export default function Modal() {
  const { modal } = useStore()
  
  // Render the appropriate modal based on state
  if (modal === 'new-chat' || modal === 'new-space' || modal === 'new-group') {
    return <NewChatModal />
  }
  
  if (modal === 'settings') {
    return <SettingsModal />
  }
  
  return null
}
