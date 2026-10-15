# Dave Young site: architecture note (v2)

Status: preview, `noindex, nofollow` on every page, `robots.txt` disallows all.

## Principles
- One fact lives in one place. Pages never copy text, links or images that belong to a shared collection; they render it from `content.json`.
- Keep what already works: static pages with stable `data-dy` ids, `content.js` overlays `content.json`, the visual editor in `admin/` edits through the same overlay format. Saved edits (`pages`, `site`, `nav`, `seo`, `custom`) keep their format; new keys are only added.
- No libraries. One CSS layer, one small script for motion and the video facade.

## Pages and purpose (one purpose each)
| Page | Purpose | Pulls from content.json |
|---|---|---|
| `index.html` Home | Sell the Christmas shows, route visitors | shows (rail), offers, services, credits (highlights), clips (featured), testimonials (home), clients (strip), socials |
| `live.html` Live / Tickets | Dates, tickets, competition, trailer | shows (full), offers, clips (trailer) |
| `about.html` About | Biography, credits, gallery, press quotes, archive | credits (full), testimonials (about), clips (archive) |
| `book.html` Book | Weddings, Christmas parties, corporate: how booking works, enquiry | services, testimonials (book), contact |
| `corporate.html` Corporate | Corporate comedian pitch, client roll, reel | clients (full), clips (reel), testimonials (corporate), contact |
| `clips.html` Clips | All videos | clips (all) |
| `shop.html` Shop | DVDs and CDs | page content only |
| `contact.html` Contact | Contact details, socials | contact, contactSocials, socials |
| `magician.html` Unknown Magician | Separate act | contact |
| `page.html?p=slug` | Pages created in the editor | blocks from the editor |

## Single-source content model (`content.json`)
Existing keys stay: `shows`, `socials`, `contactSocials`, `contact.phone`, `nav`, `seo`, `custom`, `theme`, `site`, `pages`.

New keys:
- `contact`: `phone`, `email`, `emails[]`, `org`, `base`, `weddingsUrl`
- `services[]`: `key`, `title`, `text`, `img{src,alt}`, `url`, `cta` (Corporate, Christmas parties, Weddings)
- `testimonials[]`: `id`, `place` (home | corporate | book | about | magician), `title`, `text`, `who`
- `clients`: `tiles[]` (`name`, `src`) and `roll{src,alt}`
- `credits[]`: `key`, `label`, `items[]` (`t`, `home`)
- `clips[]`: `id`, `provider`, `vid`, `title`, `cap`, `thumb`, `place` (clips | featured | reel | archive | trailer)
- `offers[]`: `key`, `img{src,alt}`, `href`

Pages mark where a collection appears with a placeholder, e.g. `<div data-cms="testimonials" data-place="corporate">`; single strings use `data-cms="contact"` (phone, `emails[]`, org, base, weddings link). `content.js` fills them at runtime; `tools/prerender.js` bakes the same output into the HTML so the pages work without script and for first paint.

## What moves where (duplicates removed)
- Christmas party pitch ("Boring office Christmas parties…"): was on Home, Book, Corporate. Now only on Book (`#xmas`); Home and Corporate link to it via the services cards.
- "Make it unforgettable / Booking" copy: was on Book and Contact. Now only on Book; Contact links to it.
- Wedding promo: was on Book and Contact. Now only a Weddings service card (Book); Contact lists the weddings link as a contact detail.
- Testimonials: were on Home, About, Book, Corporate. Now one list; each has a single `place`.
- Credits: were on Home and About with different wording. Now one list; Home shows the `home` highlights, About shows all.
- Client logos: were on Home and Corporate. Now one list; Home shows a strip, Corporate the full grid and roll-call image.
- Shows, socials, phone, emails: single source already; footer and pages render from it.
- Corporate reel video: was on Book and Corporate. Now only on Corporate.

## Editor
- All existing inline editing (text, images, links, buttons, sections, blocks, page templates, drag and drop, undo, stale-draft version stamp) is unchanged and works on the static parts of every page.
- Shared collections render inside `data-cms` regions. Clicking one opens "Shared content", one panel per collection with add, remove, reorder and field editing. Changes reload the preview and apply everywhere the collection is used.
- `tools/assign-ids.js` skips `data-cms` regions, so ids stay stable when shared content changes.

## Tests (`tests/`)
`snap.js` (render, noindex, console), `drag.js` and `fix.js` (editor), `dupes.js` (same text on more than one page), `links.js` (links and images resolve), `shared.js` (shared content edits appear everywhere).

## Build tools
`tools/rebuild.sh` strips old ids, runs `tools/prerender.js` (bakes shared collections into the HTML) and `tools/assign-ids.js` (stable `data-dy` ids). Run it after changing a page or `content.json` by hand. The baked copy is only a first-paint/no-script fallback: `content.js` re-renders from `content.json` at load, so editor edits to shared content show everywhere without a rebuild; the baked HTML catches up on the next rebuild.
