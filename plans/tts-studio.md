# Voicebarn — Local text-to-speech studio (Build Plan)

**One-liner:** Unlimited natural-sounding text-to-speech on your own machine via Piper — per-paragraph voices, WAV/MP3 export, batch mode — **$34 once** vs ElevenLabs/Play.ht-style subs ($5–99/mo, capped characters). Roadmap item #40, Batch 8.

**Directory:** `C:\Users\ADMIN\Desktop\onetime-suite\tts-studio\` · **Desktop Electron app** (no port, no web mode). Follow `BUILD-SPEC.md` desktop rules (main + preload + renderer, `npm start`, electron-builder NSIS config present but not run, MIT, launch-kit, git init, no push).

## Positioning
"Pay once. Own it forever." vs ElevenLabs Starter $5/mo (30k chars) / Creator $22/mo. Honest angle: not a voice-clone — Piper's neural voices are clean and great for narration, videos, audiobooks, IVR, accessibility; **unlimited characters, 100% offline, private**. Pays for itself in ~2 months vs Creator tier.

## MVP features
- **Local Piper TTS** — no cloud calls. First run downloads (a) the Piper Windows binary and (b) chosen voice models, with progress UI — **copy the whisper-transcriber pattern exactly**: read `Desktop/onetime-suite/whisper-transcriber/README.md` + `src/lib/download.js` first. Binary from `github.com/rhasspy/piper/releases` (piper_windows_amd64.zip — needs unzip step); voices (`.onnx` + `.onnx.json` pairs) from HuggingFace `rhasspy/piper-voices`. Curate ~8 starter voices (en_US amy/lessac/ryan, en_GB alan/cori, plus 2–3 other languages), each medium quality, listed with size + language in a Voice Manager.
- **Document editor, per-paragraph control** — a document = ordered paragraphs; each paragraph has text + voice + speed (Piper `--length_scale`, expose as 0.5×–2.0×) + pause-after. Defaults inherit from document settings; per-paragraph overrides via an inline toolbar.
- **Preview** — synthesize one paragraph to a temp WAV and play it in-app (renderer `<audio>`); cache previews keyed by hash(text+voice+speed).
- **Export WAV/MP3** — synthesize all paragraphs, insert pause gaps, concatenate, output WAV (native) or MP3 via **ffmpeg-static** (bitrate picker). Export progress per paragraph.
- **SSML-lite pauses** — inline `<pause 500ms>` (or `[pause 0.5s]`) tokens inside text plus the per-paragraph pause-after field. Implementation: split text at pause tokens, synth each chunk, join with generated silence (ffmpeg `anullsrc` or a zero-sample WAV writer). Do NOT pretend to support full SSML — Piper doesn't; document exactly what's supported.
- **Batch from text files** — pick multiple `.txt` files (or a folder) → one audio file per input using document-default voice/speed, blank-line = paragraph = pause; queue with progress + output folder.
- **Projects** — save/load documents as JSON in userData.

## Architecture
Electron main hosts `src/lib/`: `download.js` (binary + voice ensure, whisper-transcriber style), `piper.js` (spawn `piper.exe --model voice.onnx --output_file out.wav --length_scale N`, feed text via stdin, per-chunk), `audio.js` (silence generation, WAV concat, MP3 encode via ffmpeg-static), `batch.js`, `projects.js` (BOM-free JSON via Node). Renderer: premium dark UI (plain HTML/CSS/JS acceptable per spec). Synthesis runs sequentially in a small job queue (Piper is fast on CPU; one process at a time is fine). All files under userData: `bin/piper/`, `voices/`, `projects/`, `cache/previews/`.

## Data model (JSON files)
- `settings.json` — `{defaultVoice, defaultSpeed, exportFormat, mp3Bitrate, outDir}`
- `voices.json` — installed voices `{id, name, lang, quality, onnxPath, configPath, bytes}` (+ static curated catalog constant with download URLs)
- Project file — `{id, title, defaults{voice,speed}, paragraphs:[{id, text, voice|null, speed|null, pauseAfterMs}], updatedAt}`

## IPC surface (contextIsolation, preload bridge)
- `binaries.status()` / `binaries.ensurePiper(onProgress)`
- `voices.catalog()` / `voices.installed()` / `voices.download(id, onProgress)` / `voices.remove(id)`
- `tts.preview(paragraph) → wavPath` · `tts.export(project, {format, bitrate, outPath}, onProgress) → filePath`
- `batch.run(files[], defaults, onProgress)`
- `projects.list()/save(p)/load(id)/delete(id)` · `dialog.chooseFiles()/chooseFolder()` · `shell.openInFolder(path)`
- Progress events pushed main → renderer (`onProgress` channel per job id).

## UI screens
1. **Editor (main)** — paragraph cards with inline voice/speed/pause controls, play-preview button per paragraph, document defaults bar, big Export button (format picker). First-run modal: "Downloading Piper engine + default voice…" with progress bars (whisper-transcriber style).
2. **Voice Manager** — catalog grid (name, language flag, size, installed check, download/remove, preview sample phrase).
3. **Batch mode** — file list, defaults summary, output folder, per-file progress.
4. **Settings** — defaults, output folder, MP3 bitrate, cache clear.
5. **Projects list** (open/rename/delete).

## Smoke test (`test/smoke.js`, style: whisper-transcriber/test — real binary/model download)
No Electron; drive `src/lib/*` directly; cache in `test/.cache`, outputs in `test/.work` (wiped):
1. `ensurePiper(CACHE)` — real download + unzip of the Piper Windows release; assert `piper.exe` exists; run `--version`/`--help`, exit 0.
2. `ensureVoice(CACHE, 'en_US-amy-medium')` — real HF download; assert `.onnx` >20MB and `.onnx.json` parses as JSON.
3. Synthesize "Hello from Voicebarn." → assert WAV exists, RIFF/WAVE header, duration >0.5s (parse WAV header: byteLength/byteRate).
4. Speed check: synth same text at `length_scale` 1.0 vs 1.6 → slower output duration strictly greater.
5. SSML-lite: `"One. <pause 800ms> Two."` through the pause pipeline → output duration ≥ (no-pause duration + 0.7s); chunk splitter unit-asserts token parsing.
6. Multi-paragraph export with two different speeds → concatenated WAV valid; MP3 export via ffmpeg-static → file >5KB, starts with ID3/MPEG sync bytes.
7. Batch: write two fixture `.txt` files → `batch.run` produces two audio files; project save/load round-trips through JSON.parse (BOM-free).
`npm test` runs it; log progress like whisper-transcriber's `[smoke]` logger.

## Launch kit
Per BUILD-SPEC. PH tagline idea: "Unlimited offline text-to-speech — pay once, narrate forever." Strategy: r/selfhosted, r/audiobookscreation, r/YouTubeCreators (narration angle), accessibility communities; keywords "elevenlabs alternative offline", "local text to speech app". Honest comparison table: quality ("clean neural narration, not celebrity cloning") vs price/limits/privacy.

## Risks / gotchas
- **Piper release asset layout:** windows zip contains `piper.exe` + `espeak-ng-data/` + DLLs — must extract the whole folder and run with cwd set correctly, not just the exe. Verify espeak-ng-data path or phonemization fails silently.
- Voice URLs on HuggingFace are deep paths (`.../en/en_US/amy/medium/en_US-amy-medium.onnx`) — hardcode the curated catalog with exact URLs + expected sizes; both `.onnx` and `.onnx.json` are required.
- Piper reads text from stdin (one line = one utterance) — normalize newlines; long paragraphs are fine but split at pause tokens.
- Don't claim SSML support; only the documented pause syntax. Sample rate comes from the voice config JSON — read it when generating silence and concatenating (mismatched rates = chipmunk audio); if paragraphs use voices with different sample rates, resample via ffmpeg before concat.
- `.gitignore` bins/voices/test caches; never `npm run dist` in the build session; JSON writes via Node only (PS BOM issue).
