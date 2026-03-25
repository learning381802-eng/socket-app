import { useStore } from '../../store'
import NewChatModal from '../chat/NewChatModal'
import SettingsModal from './SettingsModal'
import BrowseSpacesModal from './BrowseSpacesModal'
import AppsPanel from './AppsPanel'
import AttachmentMenuModal from './AttachmentMenuModal'

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

  if (modal === 'browse-spaces') {
    return <BrowseSpacesModal />
  }

  if (modal === 'apps') {
    return <AppsPanel />
  }

  if (modal === 'attachment-menu') {
    return <AttachmentMenuModal />
  }

  return null
}
