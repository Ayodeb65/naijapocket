# NaijaPocket landing page — setup notes

Pure static site (HTML + CSS + vanilla JS). No build step, no server, no paid services.
Everything you need to edit lives in **one place**: the `CONFIG` block at the very top of `app.js`.

```js
const CONFIG = {
  SIGNUP_ENDPOINT: "",                 // 1. Google Apps Script web-app URL
  WHATSAPP_COMMUNITY_URL: "https://chat.whatsapp.com/REPLACE_WITH_YOUR_INVITE_LINK", // 2.
  SITE_URL: ""                         // 3. e.g. "https://yourname.github.io/naijapocket/"
};
```

While `SIGNUP_ENDPOINT` is empty the form runs in **preview mode**: it validates and shows the
success screen, but nothing is saved (a note is printed in the browser console).

---

## 1. Save sign-ups to a free Google Sheet (≈5 minutes)

1. Go to <https://sheets.new> and name the sheet **NaijaPocket Early Access**.
2. Menu **Extensions → Apps Script**. Delete the sample code, paste everything from
   `google-apps-script.gs`, and click **Save**.
3. Click **Deploy → New deployment**. Click the gear ⚙ → **Web app**.
   - Description: `NaijaPocket signups`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**, then **Authorize access** and allow it with your Google account
   (Google may show "unverified app" — click *Advanced → Go to project* since it's your own script).
5. Copy the **Web app URL** (ends in `/exec`) and paste it into `SIGNUP_ENDPOINT` in `app.js`.
6. Test: submit the form once. A `Signups` tab appears with the new row.

If you change the script later, use **Deploy → Manage deployments → Edit → New version**
so the same URL keeps working.

The script re-checks every field on the server, ignores bots (hidden honeypot field),
blocks spreadsheet-formula injection and marks repeat phone numbers in a `Duplicate?` column.

## 2. WhatsApp community link

WhatsApp → **Communities** (or a group) → **Invite via link** → copy → paste into
`WHATSAPP_COMMUNITY_URL`.

## 3. Your site address

After publishing (e.g. GitHub Pages: `https://<username>.github.io/<repo>/`):

- Put it in `SITE_URL` in `app.js` (used in the WhatsApp share messages).
- Replace `https://naijapocket.example/` in `index.html` (canonical, `og:url`, `og:image`,
  `twitter:image`), `robots.txt` and `sitemap.xml`. WhatsApp link previews need the full
  absolute `og:image` URL.
- Replace `privacy@naijapocket.example` in `privacy.html` with a real contact email.

## Files

| File | What it is |
|---|---|
| `index.html` | The landing page |
| `styles.css` | All styles |
| `app.js` | Budget teaser, form validation, submission, share links (+ CONFIG) |
| `privacy.html` | Privacy notice (NDPA 2023 basics) |
| `google-apps-script.gs` | Paste into Google Apps Script to save sign-ups |
| `manifest.webmanifest`, `favicon.svg`, `assets/` | Logo, icons, WhatsApp/OG share image |
| `robots.txt`, `sitemap.xml`, `.nojekyll` | SEO + GitHub Pages helpers |
| `screenshots/` | Review screenshots (not needed on the live site) |

## Phone number rules

Accepted: `0803 123 4567`, `803 123 4567`, `+234 803 123 4567`, `2348031234567`.
Saved as `+2348031234567`. Valid Nigerian mobile prefixes: 070x, 080x, 081x, 090x, 091x.
