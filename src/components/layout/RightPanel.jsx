import { motion } from 'framer-motion'
import { X, Users, Paperclip, Pin, Crown, Shield } from 'lucide-react'
import { useStore } from '../../store'
import Avatar from '../ui/Avatar'

export default function RightPanel() {
  const { setRightPanelOpen, rightPanelTab, setRightPanelTab, activeConversation, members, onlineUsers, messages } = useStore()

  const tabs = [
    { id: 'members', label: 'Members', icon: <Users size={14} /> },
    { id: 'files', label: 'Files', icon: <Paperclip size={14} /> },
    { id: 'pinned', label: 'Pinned', icon: <Pin size={14} /> },
  ]

  // Get files from messages
  const files = messages
    .filter((m) => m.attachments?.length > 0)
    .flatMap((m) => m.attachments.map((a) => ({ ...a, sender: m.users, date: m.created_at })))

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 20, opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="w-72 shrink-0 flex flex-col h-full"
      style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          {activeConversation?.name || 'Details'}
        </h3>
        <button
          onClick={() => setRightPanelOpen(false)}
          className="p-1.5 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          style={{ color: 'var(--text-secondary)' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-3 pt-3 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setRightPanelTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all"
            style={{
              background: rightPanelTab === tab.id ? 'var(--accent-subtle)' : 'transparent',
              color: rightPanelTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {rightPanelTab === 'members' && (
          <MembersTab members={members} onlineUsers={onlineUsers} />
        )}
        {rightPanelTab === 'files' && (
          <FilesTab files={files} />
        )}
        {rightPanelTab === 'pinned' && (
          <PinnedTab />
        )}
      </div>
    </motion.div>
  )
}

function MembersTab({ members, onlineUsers }) {
  const online = members.filter((m) => onlineUsers[m.id])
  const offline = members.filter((m) => !onlineUsers[m.id])

  return (
    <div className="space-y-4">
      {online.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Online — {online.length}
          </p>
          <div className="space-y-1">
            {online.map((m) => <MemberRow key={m.id} member={m} online />)}
          </div>
        </div>
      )}
      {offline.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Offline — {offline.length}
          </p>
          <div className="space-y-1 opacity-60">
            {offline.map((m) => <MemberRow key={m.id} member={m} online={false} />)}
          </div>
        </div>
      )}
      {members.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
          No members found
        </p>
      )}
    </div>
  )
}

function MemberRow({ member, online }) {
  const roleIcon = member.role === 'admin'
    ? <Crown size={11} style={{ color: '#f59e0b' }} />
    : null

  return (
    <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
      <div className="relative">
        <Avatar name={member.display_name} size={32} src={member.avatar_url} />
        <span
          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
          style={{
            background: online ? '#22c55e' : '#6b7280',
            borderColor: 'var(--bg-secondary)',
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {member.display_name}
          </p>
          {roleIcon}
        </div>
        <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
          {online ? 'Active now' : 'Offline'}
        </p>
      </div>
    </div>
  )
}

function FilesTab({ files }) {
  if (!files.length) {
    return (
      <div className="text-center py-8">
        <Paperclip size={24} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No files shared yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {files.map((f, i) => (
        <a
          key={i}
          href={f.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5 no-underline"
          style={{ border: '1px solid var(--border)' }}
        >
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm"
            style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
            {f.type?.startsWith('image/') ? '🖼' : '📄'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {f.name}
            </p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {f.sender?.display_name}
            </p>
          </div>
        </a>
      ))}
    </div>
  )
}

function PinnedTab() {
  return (
    <div className="text-center py-8">
      <Pin size={24} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--text-muted)' }} />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No pinned messages</p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
        Pin important messages to find them later
      </p>
    </div>
  )
}
