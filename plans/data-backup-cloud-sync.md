# Syncvault — Build Plan (Batch 20, #99)

## One-liner & positioning
Local encrypted backup agent: watch folders, back up on a schedule to any S3-compatible target (BYO storage), versioned + encrypted. **$29 one-time desktop** vs Backblaze Personal ($9/mo) or iDrive subscriptions.

## MVP features
- Watch folders (add/remove paths to protect), schedule (continuous/hourly/daily) or manual "back up now".
- Client-side AES-256 encryption before upload (BYO S3-compatible target: AWS S3, Backblaze B2, Wasabi, Cloudflare R2, MinIO self-hosted — user supplies bucket + keys, so the recurring cost is their own cheap storage bill, not a subscription to Syncvault).
- Versioning: keep last N versions per file (configurable), restore any version via a browse UI.
- Deduplication (content-hash based) to avoid re-uploading unchanged files, bandwidth-friendly incremental sync.
- Restore: browse backed-up tree as of any point in time, restore individual files or full folders.

## Architecture
Electron desktop/background-agent app, `aws-sdk` S3-compatible client, local SQLite for the file/version index, encryption via Node `crypto` (AES-256-GCM, key derived from user passphrase, never uploaded).

## Data model
Local SQLite: `watched_folders`(id, path, schedule), `file_versions`(id, path, hash, size, encrypted_key_id, remote_key, backed_up_at), `restore_log`(id, path, restored_at).

## Launch kit notes
Real cost math: Backblaze B2 storage ≈ $6/TB/mo — a 100GB backup costs ~$0.60/mo in storage vs Backblaze Personal's flat $9/mo (unlimited but per-computer) or iDrive's $79.86/yr tiers; angle is "pay only for the storage bytes, not a backup-software subscription on top." SEO: backblaze alternative self hosted, encrypted backup tool byo s3, file backup software one time purchase, s3 backup client with encryption.
