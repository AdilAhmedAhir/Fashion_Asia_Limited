# Product card layout options — Fashion Asia Limited

`index.html` compares ten layout directions for the product range on
/what-we-do. It is entirely self-contained: the eight photographs are embedded
as data URIs, so there is no build step, no assets folder and no server needed.
Open the file directly, or serve it as a static page.

This branch exists only to host that page. It shares no history with `main`,
is not part of the Next.js app, and is not deployed by Vercel.

## Publishing it

Settings → Pages → Source: **Deploy from a branch** → Branch: `design-preview`,
folder `/ (root)` → Save. The page then serves at the Pages URL for this
repository.

The page is marked `noindex,nofollow`, so it will not turn up in search results
while it is public.
