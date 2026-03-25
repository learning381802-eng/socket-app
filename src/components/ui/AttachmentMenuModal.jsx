import { motion } from 'framer-motion'
import {
  X, Image, FileText, Calendar, Link, Smile, Mic,
  Upload, Cloud, Folder, Github, Trello, Zap
} from 'lucide-react'
import { useStore } from '../../store'

export default function AttachmentMenuModal() {
  const { setModal } = useStore()

  const attachmentOptions = [
    {
      id: 'upload',
      label: 'Upload from Computer',
      description: 'Images, documents, and more',
      icon: Upload,
      color: '#1a73e8',
      action: () => console.log('Upload from computer'),
    },
    {
      id: 'drive',
      label: 'Google Drive',
      description: 'Share files from your Drive',
      icon: Cloud,
      color: '#0f9d58',
      action: () => console.log('Google Drive'),
    },
    {
      id: 'folder',
      label: 'Recent Files',
      description: 'Files you recently shared',
      icon: Folder,
      color: '#f4b400',
      action: () => console.log('Recent files'),
    },
    {
      id: 'calendar',
      label: 'Calendar Invite',
      description: 'Schedule a meeting',
      icon: Calendar,
      color: '#4285f4',
      action: () => console.log('Calendar invite'),
    },
    {
      id: 'link',
      label: 'Share Link',
      description: 'Paste a URL to share',
      icon: Link,
      color: '#9aa0a6',
      action: () => console.log('Share link'),
    },
    {
      id: 'gif',
      label: 'GIFs & Stickers',
      description: 'Add some fun to your message',
      icon: Smile,
      color: '#ea4335',
      action: () => console.log('GIFs & Stickers'),
    },
  ]

  const integrationOptions = [
    { id: 'github', label: 'GitHub', icon: Github, color: '#333' },
    { id: 'trello', label: 'Trello', icon: Trello, color: '#0079bf' },
    { id: 'zapier', label: 'Zapier', icon: Zap, color: '#ff4f00' },
  ]

  return (
    <div className="attachment-menu-backdrop" onClick={() => setModal(null)}>
      <motion.div
        className="attachment-menu"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="attachment-menu-header">
          <h3 className="attachment-menu-title">Add to Message</h3>
          <button onClick={() => setModal(null)} className="attachment-menu-close">
            <X size={18} />
          </button>
        </div>

        {/* Main Options */}
        <div className="attachment-options">
          {attachmentOptions.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.id}
                onClick={() => {
                  option.action()
                  setModal(null)
                }}
                className="attachment-option"
              >
                <div
                  className="attachment-option-icon"
                  style={{ background: `${option.color}20`, color: option.color }}
                >
                  <Icon size={22} />
                </div>
                <div className="attachment-option-content">
                  <span className="attachment-option-label">{option.label}</span>
                  <span className="attachment-option-desc">{option.description}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Integrations */}
        <div className="attachment-integrations">
          <span className="attachment-integrations-title">Integrations</span>
          <div className="attachment-integrations-list">
            {integrationOptions.map((integration) => {
              const Icon = integration.icon
              return (
                <button
                  key={integration.id}
                  className="integration-btn"
                  style={{ color: integration.color }}
                >
                  <Icon size={20} />
                  <span>{integration.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Quick Upload */}
        <div className="attachment-quick-upload">
          <p className="attachment-quick-upload-text">
            Or drag and drop files here
          </p>
        </div>
      </motion.div>
    </div>
  )
}
