# Portfolio

## Run locally

```sh
npm install
npm run dev
```

## Owner content editor

Tap the `G` logo five times quickly to open `/admin`.

### Local development

The local admin uses a development-only server endpoint. It stores editable
content in `portfolio-data/content.json` and uploaded images in `public/uploads/`.
These files are part of the project, so you can version them and include them
in a later site build. The local endpoint only runs under Vite's development
server, which binds to `127.0.0.1`.

Set `PORTFOLIO_ADMIN_PIN` in the ignored `.env.local` file, then restart Vite:

```env
PORTFOLIO_ADMIN_PIN=choose-a-local-pin
```

Open `/admin`, sign in with that local PIN, and save. This local PIN is not used
by the deployed website.

### Free project-folder media

Use the local editor to upload images. It saves files under `public/uploads/`
and updates `portfolio-data/content.json`; Vite serves them at `/uploads/...`.
Commit those files and push to GitHub so Vercel can include them in the next
static build. The deployed site can display these files, but cannot write new
files into its project folder at runtime.

The deployed editor's image fields accept `/uploads/your-file.png` URLs. Its
upload buttons direct you to use the local editor instead of Firebase Storage.

### Deployed website

Static site folders cannot be written by a visitor's browser after deployment.
The deployed editor therefore uses Firebase Authentication custom tokens from
the callable function and writes to Firebase Realtime Database. Firebase
Storage is not used. Set a separate, strong PIN as a Firebase secret and deploy
the function and database rules:

```sh
firebase functions:secrets:set ADMIN_PIN --project core-falcon-416215
npm install --prefix functions
firebase deploy --only functions,database --project core-falcon-416215
```

Cloud Functions deployment may require the Firebase project to use the Blaze
billing plan. The callable endpoint allows five attempts per IP per 15-minute
window. The deployed PIN must be set as a Firebase secret; the local `.env.local`
PIN is never bundled into production.

The contact form and optional live portfolio content still use Realtime
Database. Reactivate that database in Firebase Console if it is deactivated;
this is separate from project-folder media.

The editor manages the introduction, section headings, links, skills and their
individual ratings, projects, thumbnails, education/profile details,
testimonial, and marquee labels. Image uploads are limited to 5 MB. Until content is saved to
Realtime Database at `/portfolio/content`, the site uses its bundled defaults
and any content committed in `portfolio-data/content.json`.

The website's public portfolio content and uploaded images are readable by
visitors. Do not put private information in those fields. The existing contact
form writes messages under `/Viewers`; its public-write rule is kept separate
from the owner-only portfolio rules.

## Build

```sh
npm run build
```
