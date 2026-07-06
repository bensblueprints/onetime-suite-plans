# Reelsnag — yt-dlp desktop GUI (Build Plan)

**One-liner:** A clean desktop front-end for yt-dlp: paste a URL, pick format/quality, queue downloads, trim, extract MP3, grab subtitles — **$24 once**, no subscription, for downloading **your own content and permitted material**. Roadmap item #39, Batch 8.

**Directory:** `C:\Users\ADMIN\Desktop\onetime-suite\clip-grabber\` · **Desktop Electron app** (no port, no web mode). Follow `BUILD-SPEC.md` desktop rules (main + preload + renderer, `npm start`, electron-builder NSIS config present but not run, MIT, launch-kit, git init, no push).

## Positioning + REQUIRED ToS note
Vs "downloader" web services and subscription converters. Core pitch: creators re-downloading their **own uploads**, archiving licensed/CC/public-domain material, and offline access where the platform permits it.

**MANDATORY:** README **and every launch-kit file** must carry a clear positioning note, e.g.:
> Reelsnag is a GUI for the open-source yt-dlp project, intended for **personal use**: downloading your own uploads, content you have rights to, Creative Commons / public-domain media, and material the platform's terms permit you to download. Respect each platform's Terms of Service and copyright law. Don't use it to redistribute or pirate content.
Ad copy and PH listing must be written around "back up YOUR content" — never "download any YouTube video free." Strategy.md targets creator/archival communities (r/DataHoarder, r/NewTubers backup angle) with this framing.

## MVP features
- **Paste URL → probe** — runs `yt-dlp -J` to fetch metadata; shows title, thumbnail, duration, uploader, and a **format/quality picker** (grouped: video mp4/webm by resolution, audio-only; "best" default; merged video+audio via ffmpeg when needed).
- **Download queue** — multiple jobs, sequential by default (concurrency setting 1–3), per-job progress (%/speed/ETA parsed from yt-dlp output), pause=cancel+re-add, retry, remove, open-in-folder.
- **Trim start/end** — optional per job; post-process the downloaded file with ffmpeg (`-ss/-to`, stream-copy first, re-encode fallback).
- **Audio-only extract MP3** — yt-dlp `-x --audio-format mp3` (uses ffmpeg), bitrate picker.
- **Subtitle download** — list available subs/auto-captions from probe; download selected langs as `.srt` alongside video (`--write-subs --sub-langs … --convert-subs srt`).
- **Batch from list** — paste multiple URLs or open a `.txt` file (one URL per line) → enqueue all with current default settings.
- **Settings** — output folder, filename template, default quality, concurrency.

## Architecture
Electron main owns a **JobQueue** module (plain Node, `src/lib/queue.js`) that spawns `yt-dlp.exe` per job and parses stdout progress lines; renderer is plain HTML/CSS/JS or React — keep premium dark UI per spec. **Binary strategy (required):** do NOT bundle binaries in the repo. On first run (and in the smoke test), download:
1. `yt-dlp.exe` from the official GitHub latest release (`github.com/yt-dlp/yt-dlp/releases`) into userData/`bin/`, following the whisper-transcriber `src/lib/download.js` pattern (progress callback, cache, size sanity check). Include an "Update yt-dlp" button (`yt-dlp -U` or re-download) — critical because extractors break and yt-dlp updates weekly.
2. ffmpeg via `ffmpeg-static` npm dependency (same as whisper-transcriber) — pass its path to yt-dlp with `--ffmpeg-location`.
Persistence: `queue.json` + `settings.json` in userData written via Node (BOM-free; never PowerShell).

## Data model (JSON files, no SQLite)
- `settings.json` — `{outDir, template, defaultQuality, concurrency, subLangsDefault}`
- `history.json` — completed jobs `{id, url, title, filePath, formatLabel, bytes, finishedAt}`
- In-memory queue jobs: `{id, url, meta{title,thumb,duration}, formatId, audioOnly, trim{start,end}|null, subs[], status queued|probing|downloading|processing|done|error, progress, error}`

## IPC surface (preload-exposed, `contextIsolation: true`)
- `probe(url) → {title, thumbnail, duration, uploader, formats[], subtitles[]}`
- `enqueue(jobSpec)` / `enqueueBatch(urls[], defaults)` / `cancel(id)` / `retry(id)` / `removeJob(id)`
- `onJobUpdate(cb)` — push events (status/progress) main → renderer
- `getSettings()/setSettings(s)` · `getHistory()/clearHistory()`
- `chooseFolder()` / `openInFolder(path)` / `openTxtBatchFile()`
- `binaryStatus()` / `ensureBinaries(onProgress)` / `updateYtdlp()`

## UI screens
1. **Main window** — URL paste bar + "Add"; below, queue list (thumbnail, title, format chip, progress bar, speed/ETA, per-job kebab: cancel/retry/folder). First-run banner: "Downloading yt-dlp…" with progress (like whisper-transcriber model download UI).
2. **Format picker modal** — after probe: quality table, audio-only toggle + bitrate, subtitle checkboxes, trim inputs (mm:ss), destination override.
3. **Batch modal** — textarea + "load .txt", default settings summary.
4. **Settings** — folder, template, concurrency, defaults, yt-dlp version + Update button.
5. **History tab**. Footer: the personal-use/ToS note verbatim, linked to README section.

## Smoke test (`test/smoke.js`, style: whisper-transcriber/test — real binary download)
No Electron; exercise `src/lib/*` directly, cache in `test/.cache`, work in `test/.work`:
1. `ensureYtdlp(CACHE)` — real download from GitHub releases; assert exe exists, size > 5MB; run `yt-dlp --version`, assert output matches `\d{4}\.\d{2}` pattern.
2. ffmpeg-static resolves and `-version` runs.
3. **Local pipeline (network-independent beyond step 1):** generate a 10s test MP4 with ffmpeg-static (`testsrc` + `sine` audio). Trim it via the app's trim module (`-ss 2 -to 5`) → assert output exists and ffprobe-parsed duration ≈3s (±0.5).
4. Extract MP3 from the fixture via the extract module → file exists, >10KB, starts with ID3/MPEG sync.
5. Queue module unit pass: enqueue 3 fake jobs with a stubbed runner, assert sequential execution, progress events, cancel mid-run, retry-after-error, `queue.json` round-trips through JSON.parse.
6. Progress parser: feed captured sample yt-dlp stdout lines (fixture string) → assert %/speed/ETA parsed.
7. Optional live check behind `SMOKE_LIVE=1`: probe a known CC-licensed URL — skipped by default so `npm test` is deterministic.

## Launch kit
Per BUILD-SPEC (product-hunt.md, ad-copy.md, strategy.md) — **all copy uses the personal-use framing above**. PH tagline idea: "Back up your own videos — a friendly desktop yt-dlp." Price math vs $10–15/mo converter subscriptions.

## Risks / gotchas
- **ToS/copyright positioning is a launch requirement**, not a footnote — reviewer will check README + all 3 launch-kit files.
- **yt-dlp churn:** pin nothing; ship the updater; surface extractor errors ("try Update yt-dlp") instead of raw stderr.
- Windows path/filename sanitization (`--restrict-filenames` optional; handle long titles, emoji).
- Merged formats need ffmpeg — always pass `--ffmpeg-location`; verify at startup.
- Progress parsing must tolerate yt-dlp output format changes (regex defensively, fall back to indeterminate bar).
- Don't run `npm run dist` during build; don't commit downloaded binaries (`.gitignore` userData/bin, test/.cache).
