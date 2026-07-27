## WhatsApp CRM (Admin Section)

A full CRM built on top of WhatsApp Cloud API, embedded in the existing admin dashboard at `/admin/crm/*`.

### 1. WhatsApp Cloud API setup

You'll need from Meta Business:
- **Phone Number ID**
- **WhatsApp Business Account ID (WABA ID)**
- **Permanent Access Token** (System User token)
- **App Secret** (for webhook signature validation)
- A **Verify Token** (any random string you pick)

Stored as secrets: `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_WABA_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`.

Webhook URL to paste into Meta: the deployed `whatsapp-webhook` edge function URL.

### 2. Database (new tables)

- `crm_contacts` — wa_id (phone), name, email, tags[], stage, owner_id, notes, last_message_at, unread_count
- `crm_conversations` — contact_id, status (open/closed/pending), assigned_to, last_message_at, window_expires_at (24h)
- `crm_messages` — conversation_id, direction (in/out), wa_message_id, type (text/image/template/…), content jsonb, status (sent/delivered/read/failed), sent_by, created_at
- `crm_tags` — name, color
- `crm_pipeline_stages` — name, order, color
- `crm_notes` — contact_id, author_id, body
- `crm_templates` — name, language, category, body, status (approved/pending), variables[]
- `crm_broadcasts` — name, template_id, audience_filter jsonb, status, scheduled_at, sent_count, delivered_count, read_count
- `crm_broadcast_recipients` — broadcast_id, contact_id, status, wa_message_id
- `crm_automations` — name, trigger (keyword/first_message/inactivity), conditions jsonb, actions jsonb, is_active
- `crm_automation_logs` — automation_id, contact_id, executed_at, result

All tables have RLS: admins full access; team members via `has_role` + assignment.

### 3. Edge Functions

- `whatsapp-webhook` (public, verify_jwt=false) — verifies Meta signature, receives inbound messages + status updates, upserts contacts/messages, triggers automations.
- `whatsapp-send` — send text/media/template message; updates conversation window.
- `whatsapp-broadcast` — iterates recipients, sends approved template, tracks status.
- `whatsapp-templates-sync` — pulls approved templates from WABA.
- `crm-automation-runner` — evaluates triggers, executes actions.

### 4. Admin UI (`/admin/crm/*`)

```text
/admin/crm
├── /inbox          Two-pane chat: conversation list ↔ message thread + composer
├── /contacts       Table + filters (tag, stage, owner) + detail drawer (notes, timeline)
├── /pipeline       Kanban by stage, drag to move
├── /broadcasts     List + create wizard (audience → template → schedule → review)
├── /templates      Approved templates from Meta, create/preview
├── /automations    Rule builder: trigger + conditions + actions (reply, tag, assign, stage)
└── /settings       Phone numbers, business hours, auto-reply, webhook status
```

Realtime: Supabase Realtime on `crm_messages` for live inbox updates.

### 5. Delivery in phases

**Phase 1 — Foundation:** DB schema + RLS, secrets, `whatsapp-webhook` + `whatsapp-send`, `/admin/crm/inbox` with realtime, `/admin/crm/contacts`.
**Phase 2 — Broadcasts:** templates sync, broadcast wizard + runner, delivery stats.
**Phase 3 — Automation:** rule builder, keyword triggers, auto-reply, pipeline kanban, tags.

### Technical notes

- 24-hour messaging window enforced in `whatsapp-send`: outside window → must use approved template.
- Webhook signature: HMAC SHA256 with `WHATSAPP_APP_SECRET` on raw body.
- Media: download from Meta CDN → store in new `crm-media` bucket → serve signed URLs.
- Phone numbers normalized to E.164 as `wa_id`.

### What I need from you to start

1. Confirm you have (or can get) the 5 Meta credentials listed above.
2. Confirm phase order — I'll build Phase 1 first unless you say otherwise.