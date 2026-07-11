# Forumly — Build Plan (Batch 18, #88)

## One-liner & positioning
Self-hosted community forum/discussion board: categories, threads, reactions, member profiles. **$39 one-time** vs Circle **$89+/mo** or Discourse hosted plans.

## MVP features
- Categories → threads → replies (nested one-level for readability), rich text + image embed.
- Reactions (like/emoji), thread pinning, locking; moderator tools (delete/edit any post, ban user).
- Member profiles: avatar, bio, post count/join date, badges (simple manual-award badge system).
- Notifications: reply-to-your-thread, @mention (in-app bell + optional email digest).
- Search across threads; "new since last visit" indicator.

## Architecture
Web app, port **5366**. Node+Express+better-sqlite3+React/Vite/Tailwind.

## Data model
`categories`(id, name, order), `threads`(id, category_id, title, author_id, pinned, locked, created_at), `posts`(id, thread_id, author_id, body_html, created_at), `members`(id, name, avatar_path, bio, joined_at), `reactions`(id, post_id, member_id, emoji), `notifications`(id, member_id, type, ref_id, read, at).

## Launch kit notes
Angle: "Circle is $89/mo to host a forum — forums existed before SaaS pricing did." SEO: circle.so alternative, discourse alternative self hosted, community forum software free, online community platform one time purchase.
