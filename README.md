# toursbybrad

Single-page site for private walking tours of Hiroshima and Miyajima.

`index.html` is the whole thing — hand-written HTML and CSS, no build step, no
framework, no dependencies. Served by GitHub Pages from `main`.

Edit the file, commit, push. The live site updates in about a minute.

---

## Analytics — Umami Cloud

**Installed 2026-09-18.** The tracking tag sits at the end of `<head>` in
`index.html`. GitHub Pages gives no server logs and no visitor stats, so without
this there was no way to tell a page nobody finds from one people find and
leave.

**Umami** was chosen over Google Analytics deliberately:

- **Cookieless.** No consent banner needed. Most enquiries come from Europe and
  Australia, so GDPR applies to the visitors regardless of where the server is.
- Visitor data is not fed into an advertising graph.
- The free tier covers 100,000 events a month, which is far more than this page
  will see.

### How it is wired

```html
<script defer src="https://cloud.umami.is/script.js"
        data-website-id="c7f4d0e9-4884-4bb6-a9c8-1163d4019874"></script>
```

The website id is **not a secret** — it ships in the page source by design and
is safe to commit. The dashboard is at https://cloud.umami.is.

To rebuild this from scratch: create a site under **Settings → Websites → Add
website** with the domain set to the host the page is served from, then copy the
id out of **Edit → Tracking code**.

### What to look at

Visitor counts on this URL are not a fair measure of demand: a
`github.io` address carries no search standing and reads as provisional to
someone deciding whether to book a paid tour.

**Referrers are the useful number.** They answer whether Instagram actually
sends anyone, whether anyone arrives from search, and whether the page is ever
found by someone who was not already told about it. That signal holds no matter
what the raw totals look like.

### If a custom domain is ever added

Update the domain in the Umami website settings to match, or events from the new
hostname will be rejected.
