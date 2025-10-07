CREATE TABLE IF NOT EXISTS password_reset_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  phone VARCHAR(20) NOT NULL,
  reset_code VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP DEFAULT NULL,
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_password_reset_codes_phone ON password_reset_codes(phone);
CREATE INDEX idx_password_reset_codes_reset_code ON password_reset_codes(reset_code);
CREATE INDEX idx_password_reset_codes_user_id ON password_reset_codes(user_id);