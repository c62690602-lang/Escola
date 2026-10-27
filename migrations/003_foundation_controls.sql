ALTER TABLE institutions ADD COLUMN timezone text NOT NULL DEFAULT 'America/Sao_Paulo';
ALTER TABLE memberships ADD COLUMN permissions text[];
ALTER TABLE memberships ADD CONSTRAINT membership_permission_keys CHECK (permissions IS NULL OR permissions <@ ARRAY['tasks.write','units.write','reports.read','audit.read']::text[]);
CREATE TABLE mfa_credentials (
 user_id uuid PRIMARY KEY REFERENCES users(id),
 secret_encrypted text,
 pending_encrypted text,
 pending_until timestamptz,
 enabled_at timestamptz,
 last_counter bigint NOT NULL DEFAULT -1,
 recovery_hashes text[] NOT NULL DEFAULT '{}'
);
ALTER TABLE sessions ADD COLUMN mfa_verified boolean NOT NULL DEFAULT false;
ALTER TABLE sessions ADD COLUMN setup_only boolean NOT NULL DEFAULT false;
