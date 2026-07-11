# Keyloop — Build Plan (Batch 12, #57)

## One-liner & positioning
Local, encrypted TOTP authenticator (like Authy/Google Authenticator) that also does what those don't: full encrypted export/import and QR-based backup, so you're never locked out again. **$19 one-time desktop** vs Authy's account lock-in or 1Password's $2.99+/mo add-on.

## MVP features
- Add account via QR scan (webcam/screenshot) or manual secret entry; live 6-digit codes with countdown ring, per-account.
- Search/filter accounts; icons by issuer (bundled small icon set + fallback initials).
- Encrypted local vault (master password, AES-256 via Web Crypto/Node crypto), auto-lock after idle.
- Export: encrypted `.keyloop` backup file + printable QR-code sheet for offline paper backup.
- Import: from encrypted backup, or bulk from a standard `otpauth://` URI list (migration from other apps).

## Architecture
Electron desktop app. `otpauth` lib for TOTP, `jsQR`/`qrcode` for scan/generate, local encrypted SQLite or flat encrypted JSON.

## Data model
Local encrypted store: `accounts`(id, issuer, label, secret_encrypted, icon).

## Launch kit notes
Angle: "Authy holds your 2FA hostage to their app. This is yours, exportable, on your machine." SEO: authy alternative desktop, self hosted 2fa app, totp authenticator backup, offline authenticator app windows.
