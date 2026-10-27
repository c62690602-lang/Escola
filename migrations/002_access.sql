CREATE TABLE account_tokens (
 id uuid PRIMARY KEY,
 token_hash text UNIQUE NOT NULL,
 kind text NOT NULL CHECK(kind IN ('invitation','recovery')),
 email text NOT NULL,
 institution_id uuid REFERENCES institutions(id),
 role text CHECK(role IN ('gestor','diretor','especialista','rh','acolhimento')),
 created_by uuid REFERENCES users(id),
 expires_at timestamptz NOT NULL,
 used_at timestamptz,
 revoked_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK ((kind='invitation' AND institution_id IS NOT NULL AND role IS NOT NULL AND created_by IS NOT NULL) OR (kind='recovery' AND institution_id IS NULL AND role IS NULL AND created_by IS NULL))
);
CREATE INDEX account_tokens_institution ON account_tokens(institution_id,created_at);
CREATE INDEX account_tokens_email ON account_tokens(email,kind);
