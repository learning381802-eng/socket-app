import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, isToday, isYesterday, isSameDay, isSameMinute } from 'date-fns'
import MessageBubble from './MessageBubble'
import Avatar from '../ui/Avatar'

export default function MessageList({ messages, loading, loadingMore, onLoadMore, hasMore, currentUserId }) {
  const bottomRef = useRef(null)
  const containerRef = useRef(null)
  const prevLengthRef = useRef(0)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > prevLengthRef.current) {
      const lastMsg = messages[messages.length - 1]
      // Only auto-scroll if it's the user's message or we're near bottom
      if (lastMsg?.sender_id === currentUserId || isNearBottom()) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }
    prevLengthRef.current = messages.length
  }, [messages.length])

  const isNearBottom = () => {
    const el = containerRef.current
    if (!el) return true
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100
  }

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    if (el.scrollTop < 100 && hasMore && !loadingMore) {
      onLoadMore()
    }
  }

  if (loading) return <MessagesSkeleton />

  // Group messages by date and consecutive sender
  const grouped = groupMessages(messages)

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto px-4 py-4"
      onScroll={handleScroll}
    >
      {loadingMore && (
        <div className="flex justify-center py-3">
          <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
        </div>
      )}

      {grouped.map((group, gi) => (
        <div key={gi}>
          {/* Date divider */}
          {group.showDate && (
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-xs font-medium px-3 py-1 rounded-full"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                {formatDate(group.date)}
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>
          )}

          {/* Message group */}
          <div className="mb-1">
            {group.messages.map((msg, mi) => (
              <MessageBubble
                key={msg.id || msg.tempId}
                message={msg}
                isOwn={msg.sender_id === currentUserId}
                showHeader={mi === 0}
                isLast={mi === group.messages.length - 1}
              />
            ))}
          </div>
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  )
}

function groupMessages(messages) {
  if (!messages?.length) return []
  const groups = []
  let currentGroup = null

  messages.forEach((msg, i) => {
    const prev = messages[i - 1]
    const msgDate = new Date(msg.created_at)
    const prevDate = prev ? new Date(prev.created_at) : null

    const newDate = !prevDate || !isSameDay(msgDate, prevDate)
    const newSender = !prev || prev.sender_id !== msg.sender_id
    const tooLate = prevDate && (msgDate - prevDate) > 5 * 60 * 1000

    if (!currentGroup || newSender || tooLate || newDate) {
      currentGroup = {
        date: msgDate,
        showDate: newDate,
        senderId: msg.sender_id,
        messages: [],
      }
      groups.push(currentGroup)
    }

    currentGroup.messages.push(msg)
  })

  return groups
}

function formatDate(date) {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMMM d, yyyy')
}

function MessagesSkeleton() {
  return (
    <div className="p-4 space-y-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className={`flex items-end gap-3 ${i % 3 === 1 ? 'flex-row-reverse' : ''}`}>
          <div className="w-8 h-8 rounded-full skeleton shrink-0" />
          <div className="space-y-2 max-w-xs">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-10 rounded-2xl" style={{ width: `${120 + (i * 30) % 100}px` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
