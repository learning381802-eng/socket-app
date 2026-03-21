-- ============================================================
-- SOCKET – Supabase Database Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for full-text search

-- ============================================================
-- TABLES
-- ============================================================

-- Users table (mirrors auth.users with extra profile data)
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url  TEXT,
  status      TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away', 'busy')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations (DM, group, space)
CREATE TABLE IF NOT EXISTS public.conversations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        TEXT NOT NULL CHECK (type IN ('dm', 'group', 'space')),
  name        TEXT,
  description TEXT,
  avatar_url  TEXT,
  created_by  UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Memberships (users ↔ conversations)
CREATE TABLE IF NOT EXISTS public.memberships (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role            TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  last_read_at    TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, conversation_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL DEFAULT '',
  attachments     JSONB DEFAULT '[]'::jsonb,
  reactions       JSONB DEFAULT '{}'::jsonb,
  reply_to        UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  edited_at       TIMESTAMPTZ,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Message search index
CREATE INDEX IF NOT EXISTS messages_content_search ON public.messages
  USING GIN (to_tsvector('english', content));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_conv ON public.memberships(conversation_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger: create profile after auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: get or create a DM conversation between two users
CREATE OR REPLACE FUNCTION public.get_or_create_dm(user1_id UUID, user2_id UUID)
RETURNS public.conversations LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  existing_conv public.conversations;
  new_conv      public.conversations;
  other_user    public.users;
BEGIN
  -- Check for existing DM
  SELECT c.* INTO existing_conv
  FROM public.conversations c
  JOIN public.memberships m1 ON m1.conversation_id = c.id AND m1.user_id = user1_id
  JOIN public.memberships m2 ON m2.conversation_id = c.id AND m2.user_id = user2_id
  WHERE c.type = 'dm'
  LIMIT 1;

  IF FOUND THEN
    RETURN existing_conv;
  END IF;

  -- Get other user's name for DM name
  SELECT * INTO other_user FROM public.users WHERE id = user2_id;

  -- Create new DM
  INSERT INTO public.conversations (type, name, created_by)
  VALUES ('dm', other_user.display_name, user1_id)
  RETURNING * INTO new_conv;

  -- Add both members
  INSERT INTO public.memberships (user_id, conversation_id, role) VALUES
    (user1_id, new_conv.id, 'admin'),
    (user2_id, new_conv.id, 'member');

  RETURN new_conv;
END;
$$;

-- Function: update conversation updated_at when message sent
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.conversations SET updated_at = NOW() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_message_insert
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_on_message();

-- Update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users: anyone can read profiles, only owner can update
CREATE POLICY "Users are viewable by authenticated users"
  ON public.users FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Conversations: only members can see their conversations
CREATE POLICY "Users can view conversations they are members of"
  ON public.conversations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE conversation_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create conversations"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update conversations"
  ON public.conversations FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE conversation_id = id AND user_id = auth.uid() AND role = 'admin'
    )
  );

-- Memberships: members can see other members in their conversations
CREATE POLICY "Members can view memberships in their conversations"
  ON public.memberships FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.memberships m2
      WHERE m2.conversation_id = conversation_id AND m2.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create memberships"
  ON public.memberships FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can leave conversations"
  ON public.memberships FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Messages: only members of a conversation can see/send messages
CREATE POLICY "Members can view messages in their conversations"
  ON public.messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members can send messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Senders can edit their own messages"
  ON public.messages FOR UPDATE TO authenticated
  USING (sender_id = auth.uid());

CREATE POLICY "Senders can delete their own messages"
  ON public.messages FOR DELETE TO authenticated
  USING (sender_id = auth.uid());

-- ============================================================
-- REALTIME
-- ============================================================

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.memberships;

-- ============================================================
-- STORAGE
-- ============================================================

-- Create attachments bucket (run in Supabase dashboard > Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', true);

-- Storage RLS
-- CREATE POLICY "Authenticated users can upload attachments"
--   ON storage.objects FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'attachments');
--
-- CREATE POLICY "Attachments are publicly readable"
--   ON storage.objects FOR SELECT USING (bucket_id = 'attachments');

-- ============================================================
-- SEED DATA (optional - for testing)
-- ============================================================

-- After creating your first account, you can run:
-- INSERT INTO public.conversations (type, name) VALUES ('space', 'general');
-- Then add yourself as admin member.
