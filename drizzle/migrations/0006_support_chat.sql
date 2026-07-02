CREATE TABLE IF NOT EXISTS support_conversations (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_id integer REFERENCES users(id) ON DELETE SET NULL,
  subject varchar(255) NOT NULL DEFAULT 'Support request',
  status varchar(50) NOT NULL DEFAULT 'open',
  last_message_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_messages (
  id serial PRIMARY KEY,
  conversation_id integer NOT NULL REFERENCES support_conversations(id) ON DELETE CASCADE,
  sender_user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_role varchar(50) NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS support_conversations_user_status_idx
  ON support_conversations(user_id, status, last_message_at DESC);

CREATE INDEX IF NOT EXISTS support_conversations_admin_status_idx
  ON support_conversations(admin_id, status, last_message_at DESC);

CREATE INDEX IF NOT EXISTS support_messages_conversation_created_idx
  ON support_messages(conversation_id, created_at);
