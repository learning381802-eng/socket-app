import { useStore } from '../../store'
import NewChatModal from '../chat/NewChatModal'

// Route modal string to component
export default function Modal() {
  const { modal } = useStore()
  // NewChatModal handles its own open state
  return null
}
