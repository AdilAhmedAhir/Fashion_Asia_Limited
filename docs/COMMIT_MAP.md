# Commit map: the 2026-10-08 authorship rewrite

On 2026-10-08 the owner ruled that each GitHub repo shows only its own account (DECISIONS 2026-10-08), so the whole history was rewritten once:
- `client` (happierbangladesh/Fashion_Asia_Limited): authored and committed by `happierbangladesh`;
- `origin` (AdilAhmedAhir/Fashion_Asia_Limited): authored and committed by `AdilAhmedAhir`;
- no co-author lines in either.

Files, dates and merge shape are unchanged; only names and co-author lines differ. Commit ids written in the docs before this date are the **old** ids in the first column. The pre-rewrite history is kept locally under `refs/backup/2026-10-08/` and in `.git/backups/pre-authorship-rewrite-2026-10-08.bundle`.

| Old id | `client` id | `origin` id | Subject |
|---|---|---|---|
| `65c955b` | `2f2ca6b` | `49dad2d` | chore(git): give each repo its own author and drop co-author lines |
| `52b582d` | `b067347` | `4d8e89a` | chore: merge wave-5c-menu into main (T-029) |
| `8b59f34` | `543cd4b` | `8b1fa97` | docs(roadmap): close Wave 5c and the autonomous run's build phase (T-029) |
| `0924597` | `b2ee132` | `de96324` | fix(a11y): keep menu focus visible, tidy the link rings, inert the closing menu (T-029) |
| `00f6105` | `5c6802e` | `77b1c51` | feat(a11y): make the public mobile menu keyboard- and screen-reader-safe (T-029) |
| `253eaa4` | `42051a0` | `ddf0431` | chore: merge wave-5b-motion into main (T-028) |
| `d73e345` | `503c420` | `c508b41` | docs(design): record Wave 5b's motion and hero rules, close T-028, file T-043 (T-028) |
| `01245bf` | `71d1bad` | `72316ba` | fix(motion): unmount the hidden preloader, AA hero accent and stats, static marquee fits (T-028) |
| `f65a8c2` | `cf0e6f5` | `8b8f8a3` | fix(a11y): hero overlay AA, with an opaque tag pill and foreground stat labels (T-028, hero overlay AA) |
| `1768926` | `dfc5cf4` | `66dea17` | feat(motion): hold the autoplay videos on their posters under reduced motion (T-028) |
| `0a5bf42` | `f584841` | `79c985b` | feat(motion): gate hover transforms and infinite animations behind motion-safe (T-028) |
| `2f5b093` | `2a63372` | `288b98e` | feat(motion): respect reduced motion in framer, Lenis, GSAP, the preloader and the career scroll (T-028) |
| `8d1b0ca` | `8cd0c62` | `23d6c7d` | chore: merge wave-5a-headers into main (T-008, T-022, T-017) |
| `e50dd3c` | `669ae35` | `cc0ebd6` | docs(roadmap): close Wave 5a, record reviews, the redirect ruling and T-042 (T-008, T-022, T-017) |
| `2db0af9` | `3347f3d` | `53f9f5a` | fix(preloader): drop the dead hero frame loop, time every width like mobile (T-017) |
| `b8558c3` | `b1c9bf5` | `f13ba92` | fix(seo): stop the sitemap stamping every URL as just modified (T-022) |
| `b4c01e8` | `a3046b2` | `b7a9050` | feat(security): send sitewide security headers and drop X-Powered-By (T-008) |
| `edd1c6c` | `d67687a` | `4cd3059` | docs(roadmap): fold the Wave 5a premortem and its rulings (T-008, T-022, T-017) |
| `bb8c29f` | `f456733` | `987df8d` | chore: merge wave-4d-admin-nav into main (T-030) |
| `e5a0ce4` | `e6aaeff` | `917c412` | docs(roadmap): close Wave 4d and Wave 4, record reviews and the shared hook (T-030) |
| `edff562` | `2eb6953` | `7e03b56` | fix(admin): space the nav groups, 44 px phone targets, close the menu on any route change (T-030) |
| `a8a3fdd` | `8a6cff3` | `1ee588f` | feat(admin): phone menu and current-page marking in the admin nav (T-030) |
| `8b718dd` | `3d8130e` | `ed549ae` | feat(admin): add useOverlayMenu, the shared overlay-menu hook (T-030) |
| `f145abb` | `3fc5cb9` | `9921210` | chore: merge wave-4c-a11y into main (T-011) |
| `25dd0a9` | `90544a7` | `79e6e0b` | docs(roadmap): close Wave 4c, record reviews and follow-ups (T-011) |
| `43fd990` | `1b0549c` | `4115cfb` | fix(admin): fit Stats rows at 360, name them per card, announce login errors (T-011) |
| `bf72bfe` | `17d4d01` | `7a4b151` | fix(admin): keep focus on Save and the Sync checkboxes, and fix the chip row (T-011) |
| `a77ad46` | `f2b4b7a` | `404cded` | fix(admin): AA labels, the house focus ring and a disabled look in shared editors (T-011) |
| `b007771` | `c721a08` | `92ff5c6` | fix(admin): name every shared editor control and list group (T-011) |
| `a7bcc7a` | `2976f5d` | `769ca52` | chore: merge wave-4b-labels into main (T-027) |
| `078af08` | `d10e7ff` | `d4e7f81` | docs(design): record Wave 4b's tokens and close T-027, file T-041 (T-027) |
| `647b2d5` | `b7e13e1` | `43316b4` | fix(admin): match the Secure Session icon to its accent label (T-027) |
| `684ed09` | `b7af952` | `8a8a9af` | refactor(ui): add the scrim background token for the category cards (T-027) |
| `84e4da3` | `db4ba29` | `6c348fa` | fix(ui): move text-primary labels and white headings to AA tokens (T-027) |
| `6cd9844` | `d14e65b` | `1f47e29` | chore: merge wave-4a-leave-guard into main (T-034, T-020) |
| `4ef1d9a` | `454f9bc` | `e173e6b` | docs(roadmap): close Wave 4a, record reviews, file T-040 (T-034, T-020) |
| `40d4424` | `a3c9e08` | `a7acc79` | fix(admin): warn that a change may not be saved when leaving or signing out mid-save (T-034) |
| `82067bd` | `2306f42` | `45dc792` | fix(ui): give green-filled buttons one AA-contrast treatment (T-020) |
| `3d6f745` | `5ac5b96` | `5b1c749` | fix(admin): warn before leaving while a product save is pending (T-034) |
| `8f5011d` | `2aca0ed` | `1311617` | docs(roadmap): fold the Wave 4 and 5 contracts, file T-036 to T-038 (T-034, T-008) |
| `9549130` | `4a40db9` | `46d979e` | chore: merge wave-3b-editors into main (T-009, T-010) |
| `985fa7a` | `5a01714` | `40dea8c` | docs(roadmap): close Wave 3b, record reviews and follow-ups (T-009, T-010) |
| `367a6ab` | `a90f48d` | `6db0801` | fix(admin): key list rows stably and hold Save during uploads (T-010) |
| `f8e29ed` | `42b4fa9` | `be31140` | fix(admin): apply only the latest image pick (T-009) |
| `3f3f3c5` | `3656dcb` | `1ed1430` | chore: merge wave-3a-media into main (T-019, T-007) |
| `90547aa` | `1b1720c` | `4ecd33a` | docs(roadmap): close Wave 3a, record reviews and follow-ups (T-019, T-007) |
| `4abe008` | `ac848a8` | `03a45a2` | fix(media): AA status, visible busy delete, focus rings (T-019) |
| `a42ddcb` | `d98f0bb` | `112df16` | fix(uploads): re-check pixel dimensions on the server (T-007) |
| `fb34d7d` | `259759a` | `e2fb686` | fix(media): report add/delete failures and check the session (T-019) |
| `b7a4e8f` | `a73d622` | `640b043` | docs(roadmap): fold the Wave 3 contract, rulings and premortem (T-019, T-007, T-009, T-010) |
| `7edafb0` | `9880a09` | `22dae63` | chore: merge wave-2b-reorder into main (T-013) |
| `96e9214` | `8c8c026` | `88959fc` | docs(roadmap): close Wave 2b, record reviews and follow-ups (T-013) |
| `48fc3d7` | `68c7ddf` | `3c80d2c` | fix(products): exact-set reorder with put-backs on failure (T-013) |
| `3eb2759` | `1e96815` | `925d224` | chore: merge wave-2a-write-path into main (T-018, T-014) |
| `8d69e14` | `ec0240d` | `0fae503` | docs(roadmap): close Wave 2a, record reviews and file T-039 (T-018, T-014) |
| `732c67e` | `589600b` | `7ab195e` | fix(catalog): stricter image paths, clearer image messages (T-014) |
| `1c3027a` | `90d75d6` | `939bfc8` | fix(catalog): image address rule, name cap, end-of-list create (T-014) |
| `022d5fc` | `9616a5f` | `6b8544f` | fix(admin): fixed messages for database errors, argument checks (T-018) |
| `e87f2ab` | `56bc644` | `16a7ff3` | docs(roadmap): fold the Wave 2 contract and premortem (T-018, T-014, T-013) |
| `30edcb6` | `1c63abc` | `ec9e4d8` | chore: merge wave-1-catalog-hygiene into main (T-033, T-032) |
| `3d86d8f` | `5f6e112` | `0982cac` | docs(roadmap): close Wave 1, record reviews and follow-ups (T-033, T-032) |
| `1a57cfa` | `9cf647f` | `8710be9` | fix(catalog): placeholder, digit wording, own-key image lookup (T-033) |
| `032c8fa` | `0e21efa` | `0d13d33` | fix(admin): category-save and settings-key edge cases (T-032) |
| `2aab4d5` | `1922c07` | `61fcb2b` | fix(catalog): title and slug hygiene, narrowing, admin copy (T-033) |
| `010939f` | `34e991d` | `d2e1094` | docs(roadmap): fold the Wave 1 contract and premortem (T-033, T-032) |
| `95f7ea1` | `7868232` | `f8c57cc` | docs(roadmap): plan the 2026-10-06 autonomous run in five waves |
| `bc3d634` | `5a9ad88` | `8c5c78a` | chore: merge t-016-product-editor into main (T-016) |
| `28af90c` | `91cf8b0` | `65b7528` | docs(roadmap): close T-016, record reviews and follow-ups (T-016) |
| `09702d0` | `ba1480c` | `0ad86d0` | fix(admin): type-scale errors, a cue on the busy path box (T-016) |
| `eabec4b` | `73e0ea6` | `2a4dffd` | fix(admin): one save queue per product, path box saves on blur (T-016) |
| `44cdfb2` | `566eb87` | `9f99311` | fix(products): partial product updates, a read that can fail (T-016) |
| `afb7997` | `cb18607` | `8e767c6` | docs(roadmap): fold the T-016 contract and premortem into its AC (T-016) |
| `2c77b0c` | `5529f4d` | `de753db` | chore: merge t-026-admin-products into main (T-026) |
| `4060263` | `443aad0` | `947c47c` | docs(roadmap): close T-026, record reviews and follow-ups (T-026) |
| `e201aca` | `ff255fd` | `7a22079` | fix(admin): use the foreground token on new admin text (T-026) |
| `a6ce5f6` | `88223fb` | `de2b789` | fix(settings): stamps move forward, long titles get valid slugs (T-026) |
| `8d850bd` | `a3d69ef` | `875f3c5` | feat(admin): add the Products page and slim What We Do (T-026) |
| `e050f85` | `3eca53d` | `4bddf99` | feat(settings): one writer per field in the business row (T-026) |
| `8ee80bf` | `01a6a83` | `d026423` | docs(roadmap): fold the T-026 contract and premortem into its AC (T-026) |
| `c986384` | `bf1fa26` | `da9656b` | chore: merge t-025-products-routes into main (T-025) |
| `5934122` | `e49b09d` | `7b02621` | docs(roadmap): close T-025, record reviews and follow-ups (T-025) |
| `15beec0` | `c16d714` | `210fd70` | chore(tooling): add a production preview on port 3101 (T-025) |
| `c8d4d85` | `32655a6` | `c3879f9` | fix(catalog): contain menu overscroll, encode card slugs (T-025) |
| `f1bd94d` | `c3b6c5d` | `195cae3` | fix(catalog): scrollable menu, AA page tags, encoded slugs (T-025) |
| `309bc0d` | `e4e15e5` | `6725104` | feat(catalog): add /products overview and move category pages (T-025) |
| `271bdd3` | `9f427dd` | `53af9a6` | docs(roadmap): fold the T-025 premortem into its acceptance criteria (T-025) |
| `e8a303f` | `d281625` | `3a6d3ec` | chore: merge t-024-catalog-components into main (T-024) |
| `d81507f` | `32f7e39` | `a84c19c` | docs(roadmap): close T-024 and T-021, log the review decisions (T-024) |
| `49e13ba` | `b06e2a6` | `1a1f91e` | fix(catalog): foreground titles, no empty headings, safe hrefBase and capped stagger (T-024) |
| `9755389` | `c4042b9` | `663e7b9` | feat(catalog): shared category and product card grids with meaningful image names (T-024) |
| `af6efb0` | `11f8aa7` | `81443c8` | chore: merge chore/plan-products-catalog into main |
| `6fd8b67` | `b7d386f` | `8a6fe89` | docs(roadmap): plan the /products catalog run (T-024, T-025, T-026, T-016) |
| `0d345b5` | `2e27a56` | `4214428` | chore: merge chore/genesis-skills into main |
| `898fd5c` | `eefdbc8` | `060177c` | chore(ateam): install three reviewed skills and lock agents out of the database |
| `ba6e61f` | `159c587` | `93480ba` | chore: merge chore/genesis-team into main |
| `e3249ac` | `9430276` | `8728c02` | chore(ateam): add genesis custom agents and the admin-allowlist ticket |
| `fd878da` | `7dc98e3` | `e151fa3` | chore: merge chore/a-team-v7-genesis into main |
| `a5549bc` | `f027060` | `feae4fa` | chore(ateam): adapt V7 to this stack, write the genesis blueprint |
| `260fe34` | `f3cef7a` | `8a8dc0c` | chore(ateam): migrate to A-Team V7 + genesis, retire V5 |
| `8f085e7` | `e1ced47` | `a98d1c3` | chore: merge fix/T-015-admin-crud-errors into main |
| `455e089` | `66e0a6c` | `6a42c9a` | fix(admin): surface report, job and leader CRUD failures (T-015) |
| `b637a86` | `234f893` | `78a49ff` | chore: merge fix/T-006-next-security-bump into main |
| `21e7ed5` | `68016ef` | `ecc6cc8` | fix(deps): bump next to 16.3.6 to close SEC-HIGH-1 |
| `d0e655a` | `e181409` | `209f83c` | chore: merge chore/sprint-2-plan into main |
| `b948199` | `8e42b21` | `e96cf02` | docs(roadmap): plan the post-launch hardening sprint (T-015 to T-022) |
| `e8eace1` | `0074b72` | `13c2d73` | chore: merge chore/agents-opus-5-5 into main |
| `90ac056` | `1fad6ed` | `d9a71e4` | docs(workflow): record pinned commit attribution and Opus 5.5 agents |
| `5036941` | `ba23c41` | `6798865` | chore(agents): run all A-Team role agents on Opus 5.5 |
| `846ac6e` | `767d349` | `d613cc7` | chore: merge chore/archive-t005-t012-t004 into main |
| `87e7a09` | `a766fa1` | `0c495e4` | docs(memory): archive T-005, T-012, T-004 and prune roadmap |
| `15ec7c3` | `f322088` | `8b19124` | chore: merge feat/T-004-admin-category-products into main |
| `109c1e3` | `b737bab` | `fd85807` | feat(admin): manage products within each category on /admin/business |
| `3800aee` | `f95eedc` | `9812c21` | chore: merge fix/T-012-settings-save-errors into main |
| `96b1fa8` | `f3d1907` | `cb8464c` | fix(admin): surface settings save errors instead of failing silently in production |
| `27660e3` | `c5ba40d` | `b5bcb53` | chore: merge feat/T-005-category-detail-pages into main |
| `d3ac3f5` | `ea0d849` | `bfd1f5b` | feat(catalog): add public category detail pages under /what-we-do |
| `34c4af1` | `39189b0` | `604b6b1` | chore: merge chore/t004-prereqs-roadmap into main |
| `1ad82bf` | `1e91e50` | `c96b524` | docs(roadmap): fold T-004 prerequisites, queue T-012-T-014, correct TECH_STACK notes |
| `78a3498` | `ca24cd3` | `f8d7e1a` | chore: merge chore/archive-sprint-1 into main |
| `a8c4490` | `dfb66a9` | `411a75e` | docs(memory): archive T-001–T-003 and prune roadmap |
| `ed76507` | `a0e3e82` | `e3af2d2` | chore: merge feat/T-003-category-products-data-layer into main |
| `5984b74` | `615d615` | `b1ba940` | feat(catalog): add category-products data layer with delete guard |
| `8906fb5` | `8eb69f6` | `a7b960f` | chore: merge chore/roadmap-review-findings into main |
| `8733761` | `ce6793d` | `dde7047` | docs(roadmap): fold review findings into T-003/T-005, queue T-006-T-011 |
| `0f42faf` | `32478ec` | `7480f03` | chore: merge feat/T-001-products-within-category into main |
| `64268a6` | `bd4a690` | `dcaab2a` | feat(catalog): add stable category slug, CategoryProduct type, helpers |
| `96b6010` | `2508530` | `735b5be` | chore(db): mark migration 0001 applied |
| `be4b986` | `e8a0151` | `0e332c7` | feat(db): design products-within-category schema and migration |
| `8030456` | `b7038ff` | `d73aaeb` | chore: merge feat/T-002-image-size-warning into main |
| `95338dc` | `7adb107` | `70732ae` | feat(admin): show recommended size, warn on size/proportion issues |
| `83e5e07` | `3acf1ae` | `8b22ff1` | chore: merge chore/ateam-setup-docs into main |
| `299cc1a` | `c82308d` | `3018464` | docs: establish initial A-Team process docs |
| `c5690e0` | `b6ac166` | `c8838bb` | fix: admin sidebar could not stick, because the document was a scroll container |
| `4c1b6e1` | `f7c5f20` | `ce9f3ca` | feat: six motion treatments on the layout preview, with phone behaviour |
| `e1366e7` | `b559e8c` | `79e34cf` | fix: admin pages scrolled into dead space below the content |
| `d8959ed` | `2204a63` | `7cfb870` | chore: serve the layout comparison at /layout-preview.html |
| `f3e6536` | `9a64f58` | `640e722` | feat: drag-and-drop image upload for product and facility cards |
| `ecf6cf6` | `6598e0b` | `e690ba3` | feat: URLs match their menu names; product cards gain an editable description |
| `19fe2fb` | `d28f771` | `d738009` | fix: black-and-white Sportswear card to match the other product cards |
| `38fb2a2` | `0a90b0f` | `fcf93f5` | fix: product tiles become photo cards, matching the client's reference |
| `83b53ea` | `2b56800` | `4e7f047` | feat: client feedback round two — items 8 to 18 |
| `dfc040a` | `de3cf10` | `57d2e85` | feat: client copy round — real milestones, new About text, cert labels |
| `d4fce2f` | `ebbeb0b` | `14f0f68` | fix: hide unfilled leaders, stop shipping invented milestone dates |
| `07497f7` | `8c03675` | `45d6fb2` | fix: show the built-in factory photos alongside the client's uploads |
| `61d5660` | `20a8bd7` | `72fcb4c` | feat: surface the client's gallery photos, optimise images, fix CMS wiring |
| `7ac5070` | `5dd0bcb` | `78a637f` | feat: restore Supabase CMS on top of the new front-end |
| `db60bf6` | `1c24291` | `49ba032` | Drop Customers from What We Do, move the stats block to Who We Are |
| `1a38c6f` | `256be77` | `1c9ab67` | Align certification names across the site with the supplied artwork |
| `db8d8cc` | `d423896` | `70ee8d0` | Show certification marks on Sustainability instead of text pills |
| `b02f869` | `7339d9a` | `34909ef` | Move culture pillars to Life at Fashion Asia, add cutting video to What We Do |
| `0d6a97a` | `0714079` | `23359ee` | Remove How We Partner and the closing CTA from /who-we-work-with |
| `130838f` | `d5c6c2a` | `f79268a` | Swap two background images, fold Reports into Sustainability |
| `898aafd` | `45cf73c` | `7a79af5` | Fix milestone dot positioning so markers sit on the spine |
| `a00cb4b` | `d7cbf67` | `42d6288` | Restore milestone timeline, drop only the circle markers |
| `eba90ba` | `e2b7463` | `d3ed511` | Replace milestone timeline dots with plain cards |
| `beb9450` | `76d3313` | `29662d5` | Rename nav to content-led labels, rebuild Life section, fix hero poster |
| `943d073` | `225fa87` | `7cc490a` | Use client logos in Business page Customers section |
| `894e432` | `a7c458f` | `16e2d2e` | Add client brand logos to Trusted By section |
| `5cea838` | `a6ecf34` | `37dead8` | feat(content): add 'What We Do' (Business) and 'Life at Fashion Asia' (Who We Are) |
| `6065867` | `ceba529` | `8372d6f` | feat(who-we-are): update content from client document |
| `8bb92df` | `9e6099d` | `7e3afad` | fix(media): convert color gallery images to black & white |
| `a181522` | `6efcffe` | `d512d8e` | feat(who-we-are): add portrait photo to About Us section |
| `fa13bda` | `534ce20` | `ae72c62` | feat(media): update 4 'More Than a Workplace' amenity photos |
| `5c56560` | `b0e2216` | `4e6d2a2` | feat(hero): use aerial building video for hero background |
| `c5a2d65` | `820caa8` | `a1236a3` | refactor: make site fully static & backend-free for Vercel |
| `41173c6` | `55d39bb` | `8a6a0e9` | feat(hero): replace scroll-frame canvas with background video |
| `2b10e92` | `f44d156` | `7b477e2` | chore: add Claude A-Team agency tooling and docs |
| `d6ea2e3` | `8c611dc` | `4d39bce` | feat(home): apply Claude Design handoff — amenity media grid, About video, refreshed imagery |
| `006f97a` | `0622a41` | `df3849f` | chore: change keep-alive cron to every 4 days |
| `44fc64b` | `7560ed1` | `5a55d78` | chore: trigger Vercel redeploy for keep-alive route |
| `7794c21` | `3e4d372` | `f5ba448` | fix: exclude keep-alive route from auth middleware, use direct Supabase client |
| `0116c2a` | `b2f7219` | `906a0a5` | feat: add Supabase keep-alive cron job to prevent inactivity pausing |
| `42b2619` | `53708f4` | `4d46a0d` | fix: all contact emails → admin@fashionasialtd.com |
| `5bce25c` | `f90eca5` | `74c5015` | fix: hover text color white on all outline buttons |
| `a015850` | `21b0608` | `6a6ddf6` | fix: all outline buttons & tags text-primary → text-white for readability |
| `ee23816` | `fd6315e` | `673f595` | fix: pillar images visible + add Trusted By section + revert AI images |
| `503b68d` | `90063cb` | `f4fc218` | fix: replace tiny pillar images with high-quality versions |
| `6a25522` | `240cd9d` | `ef4c1b9` | feat: apply button in job postings auto-fills position in career form |
| `6578981` | `18ef2fa` | `861acb6` | feat: expanded job posting fields (responsibilities, education, experience, salary, compensation) |
| `8e35d63` | `6588f74` | `1690cc9` | feat: job postings - admin CRUD + career page accordion + footer fix |
| `8cbcec2` | `29e50be` | `2980b50` | fix: add logo to preloader + Connect button text white |
| `9a08c2d` | `7577006` | `b042827` | fix: Connect button text white |
| `d6b779f` | `53d7d99` | `ad29e4b` | feat: replace SVG logo with official Fashion Asia Limited logo |
| `ab47163` | `c5bc18a` | `4c938d8` | feat: direct PDF file upload in reports admin |
| `3d3b708` | `5a9764d` | `3cfaea5` | fix: mobile menu - prevent Home text hidden behind header |
| `81bc5e9` | `e97be82` | `91e979c` | fix: reduce mobile hero scroll distance from 150% to 80% |
| `2615dff` | `7709a2f` | `108e9ac` | fix: freeze poster until ALL hero frames loaded, prevent buggy scroll |
| `66ff68d` | `ef61ec9` | `713be07` | fix: footer readability with accent green, mobile perf optimization |
| `5ff471d` | `5fde926` | `dd22762` | perf: mobile optimization - 75% fewer frame requests, skip preloader loading, 1x DPR canvas |
| `021a623` | `32317b6` | `8d3c360` | fix: add accent color for text readability on dark backgrounds, fix hero contrast |
| `71e404b` | `13f013e` | `e9fd0c1` | fix: cap preloader at 2s max for slow connections |
| `19381eb` | `c54f0c3` | `88bb964` | feat: cinematic split-screen preloader with staggered text reveal |
| `a874692` | `8f21bb4` | `cdcf502` | fix: update green to #016138, remove BrandLogo from preloader, use icon.png |
| `2c2f967` | `cf1a22b` | `1a38cd7` | feat: proper footer with nav links, preloader with logo reveal + full frame loading, favicon, domain update to fashionasialtd.com |
| `4d1215c` | `592a4ff` | `4f23933` | feat: connect all public pages to Supabase settings + leadership profiles |
| `337c7dd` | `c67db87` | `b41a3f1` | feat(admin): comprehensive admin panel with 7 settings pages, reports CRUD, leadership CRUD, public /reports page |
| `26c2587` | `c1c8374` | `c2cd7aa` | feat(hero): nearest-frame scrubbing + cosmetic preloader + q70 frame tiers |
| `e47ea51` | `b38008e` | `7bfd334` | fix(pillars): brighter card images and reduced overlay for visible defaults |
| `50db841` | `e9848ba` | `de3a776` | fix(hero): eliminate scroll floppiness — remove double rAF, snap conflict, per-frame smoothing |
| `2fcb92d` | `779f391` | `678fd62` | feat(preloader): Logo Reveal + progress bar, tracks real hero frame loading |
| `565435f` | `1dba87d` | `28b990f` | feat(home): add Business, Sustainability, Media preview sections with page CTAs |
| `c386c94` | `7f95d84` | `45514ca` | feat(hero): single hero video with priority loading, remove 6-variant system |
| `f05875d` | `6f158fa` | `5106375` | fix(touch): remove overscroll-behavior:none, add touch-action:pan-y, scope Lenis CSS to hover devices |
| `f0772b0` | `c6ff1b5` | `6c69f24` | fix(scroll): disable Lenis on touch devices to restore native tablet/mobile scrolling |
| `2ce7daf` | `a4ca0a7` | `f3e1f73` | fix(hero): optimize scroll for touch devices — shorter distance, snappier scrub |
| `07d735a` | `8cb25ed` | `da86eb4` | fix(hero): retina-sharp canvas rendering via devicePixelRatio + premium text shadows |
| `ad0c174` | `fb1833d` | `b47947f` | perf(hero): max quality WebP q95 frames with instant poster fallback for slow connections |
| `315f28c` | `4646c43` | `af172d4` | perf(hero): upgrade to 24fps (192 frames) for 60% smoother canvas scroll |
| `d8d0ddc` | `8ecc2f5` | `1952e76` | fix: remove preloader from website layout |
| `ec63045` | `7463712` | `cbcb1f6` | perf(hero): boost first/last 15 frames to max quality for premium scroll transitions |
| `54016ec` | `9e8185d` | `4198584` | fix(auth): convert login to useActionState, create new admin account |
| `e359d52` | `745c9e5` | `6e657b9` | fix(admin): isolate login page from dashboard sidebar layout via route group |
| `743f078` | `62ebe32` | `5a7fb12` | docs: generate final client handover manual |
| `5d1c674` | `97f6e0c` | `0e8cd91` | chore(seo): implement dynamic sitemap, robots.txt, rich metadata, and 404 page |
| `a43719c` | `60b764e` | `d21ea37` | feat(cms): build media database, admin ui, and dynamic frontend gallery |
| `b423628` | `eeeb4ed` | `83eb720` | feat(cms): add home dropdown nav, admin submissions UI, and 720 extracted JPEG frames |
| `9307a5b` | `c1349eb` | `e185eb4` | feat(cms): route group refactor and protected admin dashboard UI |
| `1051d82` | `907a81b` | `4848759` | feat(canvas): re-implement 60fps frame scrubber engine for 6 video variations |
| `13ced9b` | `0232150` | `d2d9ce1` | feat(hero): integrate 6x 4k hero videos with GSAP scale engine and preview switcher |
| `4ab1825` | `741bcc6` | `345703e` | feat(content): inject official client copywriting into marketing sub-pages |
| `49451cf` | `ad280d1` | `6083ee1` | feat(ui): integrate authentic client imagery, brand logo, and cinematic preloader |
| `86b5923` | `116bb72` | `e1c46df` | feat(ui): implement premium cinematic preloader and logo prompt |
| `8a1bfb9` | `9ffa414` | `9b10836` | chore: establish phase 1-9 baseline and project state tracking |
| `f7804db` | — (not on client) | `c5b9f16` | Ten product card layout directions for client review |
