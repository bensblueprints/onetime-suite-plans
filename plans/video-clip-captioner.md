# Captionly — Build Plan (Batch 13, #65)

## One-liner & positioning
Local auto-captioning + burn-in tool for short-form video: Whisper transcription, styled animated captions (karaoke/word-highlight), export ready-to-post MP4. **$34 one-time desktop** vs Submagic **$18-39/mo** or Captions app subscriptions.

## MVP features
- Import video, local Whisper transcription (reuse whisper-transcriber's local model pipeline) → word-level timestamps.
- Caption style presets (bold center, karaoke word-highlight, classic subtitle bar) with font/color/position customization.
- Edit transcript inline (fix misheard words), re-sync auto-adjusts timing for edited segment.
- Emoji/keyword auto-highlight (basic keyword→emoji dictionary, optional).
- Burn-in export via ffmpeg (drawtext/ass subtitle overlay) to MP4, plus separate .srt/.ass export.

## Architecture
Electron desktop app, reuses local Whisper model pattern from whisper-transcriber, ffmpeg (bundled binary like clip-grabber) for burn-in render.

## Data model
Local project files: `.captionly` project JSON (transcript segments + style config) alongside source video reference.

## Launch kit notes
Angle: "Submagic is $39/mo to run Whisper and ffmpeg on your video — this runs the same pipeline, locally, once." SEO: submagic alternative free, auto captions video local, karaoke caption generator, whisper video captions desktop app.
