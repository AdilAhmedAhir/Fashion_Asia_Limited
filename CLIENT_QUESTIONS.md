# CLIENT_QUESTIONS.md — Open Questions for Stakeholders

> GENESIS Phase 1, 2026-09-28. These are the things the record can't answer. Every
> `[CONFIRM]` in `docs/` traces to a Q here.
> Legend: **[BLOCKING]** = work can't proceed without it · **[CONFIRM]** = has a working
> default; confirm it before relying on it.

| Q## | Question | Blocking? | Working default | Answer | Answered on |
|---|---|---|---|---|---|
| Q01 | Which domain should search engines treat as primary, `fal.com.bd` or `fashionasialtd.com`? Both serve the same site today. | [CONFIRM] | `fashionasialtd.com` (the current canonical and sitemap host) | | |
| Q02 | Who at FAL will add products and keep content current? We need a named person and the email for their admin account. | [CONFIRM] | The existing single admin login | | |
| Q03 | When can FAL supply real product photos per category, ideally about 1200×900, JPG or WebP, under 400 KB? | [CONFIRM] | Staff upload their own photos, compressed with TinyPNG | | |
| Q04 | Homepage "Business" strip: link it to the category pages, making the catalog the single source, or keep it as free text? | [CONFIRM] | Keep as-is (VISION.md ruling of 2026-09-26) | | |
| Q05 | The Contact and General editors in `/admin/settings` change nothing on the public site. Wire them up or remove them? | [CONFIRM] | Leave them, flagged as dead | | |
| Q06 | Who reads grievance submissions, how quickly, and how long is personal data kept? | [CONFIRM] | Admin inbox only; no retention policy | | |
| Q07 | Should new form submissions email someone? Today they only appear in the admin inbox. | [CONFIRM] | No email | | |
| Q08 | Most report PDFs are over 1 MB and can't be uploaded today. Raise the limit, with server-side PDF checks? | [CONFIRM] | Yes: ticket it with `/security-review` | | |
| Q09 | Should anyone besides FAL admins ever sign in, for example staff with limited rights? | [CONFIRM] | No: a single admin role, explicitly allow-listed (RISKS R1) | | |
| Q10 | Is the staging repo (`AdilAhmedAhir/Fashion_Asia_Limited_staging`) still needed? | [CONFIRM] | Keep it, and never push to it automatically | | |
| Q11 | Should company facts like "26 lines, 800,000 pieces/month" be editable in the admin? | [CONFIRM] | No: they stay in copy until they change | | |
