-- Enums
CREATE TYPE public.crm_conversation_status AS ENUM ('open','pending','closed');
CREATE TYPE public.crm_message_direction AS ENUM ('in','out');
CREATE TYPE public.crm_message_status AS ENUM ('queued','sent','delivered','read','failed');
CREATE TYPE public.crm_broadcast_status AS ENUM ('draft','scheduled','sending','completed','failed','cancelled');
CREATE TYPE public.crm_automation_trigger AS ENUM ('keyword','first_message','inactivity','tag_added','stage_changed');

CREATE TABLE public.crm_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text NOT NULL DEFAULT '#389c84',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_tags TO authenticated;
GRANT ALL ON public.crm_tags TO service_role;
ALTER TABLE public.crm_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage crm_tags" ON public.crm_tags FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.crm_pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  color text NOT NULL DEFAULT '#94a3b8',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_pipeline_stages TO authenticated;
GRANT ALL ON public.crm_pipeline_stages TO service_role;
ALTER TABLE public.crm_pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage crm_pipeline_stages" ON public.crm_pipeline_stages FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.crm_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wa_id text NOT NULL UNIQUE,
  name text,
  email text,
  profile_name text,
  tags text[] NOT NULL DEFAULT '{}',
  stage_id uuid REFERENCES public.crm_pipeline_stages(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  last_message_at timestamptz,
  last_inbound_at timestamptz,
  unread_count integer NOT NULL DEFAULT 0,
  is_blocked boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX crm_contacts_last_message_at_idx ON public.crm_contacts (last_message_at DESC NULLS LAST);
CREATE INDEX crm_contacts_owner_idx ON public.crm_contacts (owner_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_contacts TO authenticated;
GRANT ALL ON public.crm_contacts TO service_role;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage crm_contacts" ON public.crm_contacts FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER crm_contacts_updated BEFORE UPDATE ON public.crm_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.crm_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  status public.crm_conversation_status NOT NULL DEFAULT 'open',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  last_message_at timestamptz,
  window_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX crm_conversations_contact_idx ON public.crm_conversations (contact_id);
CREATE INDEX crm_conversations_last_message_idx ON public.crm_conversations (last_message_at DESC NULLS LAST);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_conversations TO authenticated;
GRANT ALL ON public.crm_conversations TO service_role;
ALTER TABLE public.crm_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage crm_conversations" ON public.crm_conversations FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER crm_conversations_updated BEFORE UPDATE ON public.crm_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.crm_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.crm_conversations(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  wa_message_id text UNIQUE,
  direction public.crm_message_direction NOT NULL,
  type text NOT NULL DEFAULT 'text',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.crm_message_status NOT NULL DEFAULT 'queued',
  error text,
  sent_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  template_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX crm_messages_conversation_idx ON public.crm_messages (conversation_id, created_at);
CREATE INDEX crm_messages_contact_idx ON public.crm_messages (contact_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_messages TO authenticated;
GRANT ALL ON public.crm_messages TO service_role;
ALTER TABLE public.crm_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage crm_messages" ON public.crm_messages FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.crm_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX crm_notes_contact_idx ON public.crm_notes (contact_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_notes TO authenticated;
GRANT ALL ON public.crm_notes TO service_role;
ALTER TABLE public.crm_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage crm_notes" ON public.crm_notes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.crm_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wa_template_id text UNIQUE,
  name text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  category text,
  status text NOT NULL DEFAULT 'pending',
  body text,
  components jsonb NOT NULL DEFAULT '[]'::jsonb,
  variables text[] NOT NULL DEFAULT '{}',
  synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name, language)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_templates TO authenticated;
GRANT ALL ON public.crm_templates TO service_role;
ALTER TABLE public.crm_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage crm_templates" ON public.crm_templates FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER crm_templates_updated BEFORE UPDATE ON public.crm_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.crm_broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  template_id uuid REFERENCES public.crm_templates(id) ON DELETE SET NULL,
  template_variables jsonb NOT NULL DEFAULT '{}'::jsonb,
  audience_filter jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.crm_broadcast_status NOT NULL DEFAULT 'draft',
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  total_count integer NOT NULL DEFAULT 0,
  sent_count integer NOT NULL DEFAULT 0,
  delivered_count integer NOT NULL DEFAULT 0,
  read_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_broadcasts TO authenticated;
GRANT ALL ON public.crm_broadcasts TO service_role;
ALTER TABLE public.crm_broadcasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage crm_broadcasts" ON public.crm_broadcasts FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER crm_broadcasts_updated BEFORE UPDATE ON public.crm_broadcasts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.crm_broadcast_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id uuid NOT NULL REFERENCES public.crm_broadcasts(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  wa_message_id text,
  status public.crm_message_status NOT NULL DEFAULT 'queued',
  error text,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  UNIQUE (broadcast_id, contact_id)
);
CREATE INDEX crm_broadcast_recipients_bid_idx ON public.crm_broadcast_recipients (broadcast_id);
CREATE INDEX crm_broadcast_recipients_wamid_idx ON public.crm_broadcast_recipients (wa_message_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_broadcast_recipients TO authenticated;
GRANT ALL ON public.crm_broadcast_recipients TO service_role;
ALTER TABLE public.crm_broadcast_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage crm_broadcast_recipients" ON public.crm_broadcast_recipients FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.crm_automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  trigger public.crm_automation_trigger NOT NULL,
  conditions jsonb NOT NULL DEFAULT '{}'::jsonb,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_automations TO authenticated;
GRANT ALL ON public.crm_automations TO service_role;
ALTER TABLE public.crm_automations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage crm_automations" ON public.crm_automations FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER crm_automations_updated BEFORE UPDATE ON public.crm_automations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.crm_automation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id uuid NOT NULL REFERENCES public.crm_automations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  message_id uuid REFERENCES public.crm_messages(id) ON DELETE SET NULL,
  result text NOT NULL DEFAULT 'ok',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  executed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX crm_automation_logs_automation_idx ON public.crm_automation_logs (automation_id, executed_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_automation_logs TO authenticated;
GRANT ALL ON public.crm_automation_logs TO service_role;
ALTER TABLE public.crm_automation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view crm_automation_logs" ON public.crm_automation_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_contacts;
ALTER TABLE public.crm_messages REPLICA IDENTITY FULL;
ALTER TABLE public.crm_conversations REPLICA IDENTITY FULL;
ALTER TABLE public.crm_contacts REPLICA IDENTITY FULL;

CREATE POLICY "Admins read crm-media" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'crm-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins write crm-media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'crm-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update crm-media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'crm-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete crm-media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'crm-media' AND public.has_role(auth.uid(),'admin'));