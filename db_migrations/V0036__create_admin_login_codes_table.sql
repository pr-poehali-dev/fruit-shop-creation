-- Create admin login codes table
CREATE TABLE IF NOT EXISTS admin_login_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    login_code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    UNIQUE(login_code)
);

CREATE INDEX IF NOT EXISTS idx_admin_login_codes_user_id ON admin_login_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_login_codes_login_code ON admin_login_codes(login_code);
CREATE INDEX IF NOT EXISTS idx_admin_login_codes_expires_at ON admin_login_codes(expires_at);