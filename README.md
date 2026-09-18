# toursbybrad

Single-page site for private walking tours of Hiroshima and Miyajima.

`index.html` is the whole thing — hand-written HTML and CSS, no build step, no
framework, no dependencies. Served by GitHub Pages from `main`.

Edit the file, commit, push. The live site updates in about a minute.

---

## Analytics — Umami Cloud

The site has no analytics until the step below is done. GitHub Pages gives no
server logs and no visitor stats, so without this there is no way to tell a page
nobody finds from a page people find and leave.

**Umami** was chosen over Google Analytics deliberately:

- **Cookieless.** No consent banner needed. Most enquiries come from Europe and
  Australia, so GDPR applies to the visitors regardless of where the server is.
- Visitor data is not fed into an advertising graph.
- The free tier covers 100,000 events a month, which is far more than this page
  will see.

### Setup

1. Create an account at **https://cloud.umami.is** — free tier, no card.
2. **Settings → Websites → Add website.** Name it anything; set the domain to
   `jrflippp-ux.github.io`.
3. Open the new website's **Edit → Tracking code**. Copy the `data-website-id`
   value — a UUID that looks like `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.
4. Paste that id into the script tag in `index.html`, immediately above
   `</head>`:

   ```html
   <script defer src="https://cloud.umami.is/script.js"
           data-website-id="PASTE-THE-UUID-HERE"></script>
   ```

5. Commit and push. Load the live site once, then check the Umami dashboard —
   the visit should appear within a few seconds.

The website id is **not a secret**. It is visible in the page source by design
and is safe to commit.

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
