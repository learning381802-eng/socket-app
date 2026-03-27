import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
})

// Auth helpers
export const signInWithEmail = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signUpWithEmail = (email, password, displayName) =>
  supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  })

export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })

export const signOut = () => supabase.auth.signOut()

export const getSession = () => supabase.auth.getSession()

// Database helpers
export const getConversations = async (userId) => {
  const { data, error } = await supabase
    .from('memberships')
    .select(`
      conversation_id,
      role,
      conversations (
        id, type, name, created_at,
        messages (
          content, created_at, sender_id,
          users!sender_id (display_name, avatar_url)
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { referencedTable: 'conversations', ascending: false })
  return { data, error }
}

export const getMessages = async (conversationId, limit = 50, offset = 0) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      users!sender_id (id, display_name, avatar_url, status)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  return { data: data?.reverse(), error }
}

export const sendMessage = async (conversationId, senderId, content, attachments = []) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      attachments,
    })
    .select(`*, users!sender_id (id, display_name, avatar_url, status)`)
    .single()
  return { data, error }
}

export const createDM = async (userId, targetUserId) => {
  // Check if DM already exists
  const { data: existing } = await supabase.rpc('get_or_create_dm', {
    user1_id: userId,
    user2_id: targetUserId,
  })
  return existing
}

export const createSpace = async (name, creatorId) => {
  const { data: conv, error } = await supabase
    .from('conversations')
    .insert({ type: 'space', name })
    .select()
    .single()
  if (error) return { error }

  await supabase.from('memberships').insert({
    user_id: creatorId,
    conversation_id: conv.id,
    role: 'admin',
  })
  return { data: conv }
}

export const createChatInvite = async ({ invitedEmail, invitedBy, inviterName = '' }) => {
  const normalizedEmail = String(invitedEmail || '').trim().toLowerCase()
  if (!normalizedEmail) return { error: new Error('Invite email is required') }

  const { data, error } = await supabase
    .from('chat_invites')
    .insert({
      invited_email: normalizedEmail,
      invited_by: invitedBy,
      inviter_name: inviterName,
      status: 'pending',
    })
    .select('*')
    .single()
  return { data, error }
}

export const getIncomingChatInvites = async (email) => {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!normalizedEmail) return { data: [], error: null }

  const { data, error } = await supabase
    .from('chat_invites')
    .select('id, invited_email, invited_by, inviter_name, status, created_at')
    .eq('invited_email', normalizedEmail)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  return { data, error }
}

export const markChatInviteAccepted = async (inviteId, acceptedBy) => {
  const { data, error } = await supabase
    .from('chat_invites')
    .update({ status: 'accepted', accepted_by: acceptedBy, accepted_at: new Date().toISOString() })
    .eq('id', inviteId)
    .select('*')
    .single()
  return { data, error }
}

export const searchUsers = async (query) => {
  // Search by both display_name and email
  const { data, error } = await supabase
    .from('users')
    .select('id, display_name, avatar_url, email, status')
    .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(10)
  return { data, error }
}

export const searchMessages = async (query, userId) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      users!sender_id (display_name, avatar_url),
      conversations!inner (id, name, type,
        memberships!inner (user_id)
      )
    `)
    .textSearch('content', query)
    .eq('conversations.memberships.user_id', userId)
    .limit(20)
  return { data, error }
}

export const uploadFile = async (file, path) => {
  const { data, error } = await supabase.storage
    .from('attachments')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) return { error }
  const { data: url } = supabase.storage.from('attachments').getPublicUrl(path)
  return { url: url.publicUrl, path: data.path }
}

export const updateUserStatus = async (userId, status) => {
  await supabase.from('users').update({ status }).eq('id', userId)
}

export const subscribeToMessages = (conversationId, callback) => {
  return supabase
    .channel(`messages:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`,
    }, callback)
    .subscribe()
}

export const subscribeToPresence = (channelName, userId, onSync) => {
  const channel = supabase.channel(channelName)
  channel
    .on('presence', { event: 'sync' }, onSync)
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ user_id: userId, online_at: new Date().toISOString() })
      }
    })
  return channel
}
