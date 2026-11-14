# Portfolio

## Run locally

```sh
npm install
npm run dev
```

## Owner content editor

Tap the `G` logo five times quickly to open `/admin`. The shortcut only opens
the editor. A Firebase callable function verifies the PIN and issues a custom
admin session; database and storage rules accept only that session.

1. Enable Firebase Authentication for the project configured in `firbase.js`.
   Email/Password sign-in is not required.
2. Install the Firebase CLI, sign in, and set the PIN as a Firebase secret:

   ```sh
   firebase functions:secrets:set ADMIN_PIN --project core-falcon-416215
   ```

   Enter the PIN at the prompt; do not put it in source code or a committed
   environment file. A longer random PIN is safer than a short numeric one.
3. Install function dependencies and deploy the callable function and rules:

   ```sh
   npm install --prefix functions
   firebase deploy --only functions,database,storage --project core-falcon-416215
   ```

   Cloud Functions deployment may require the Firebase project to use the
   Blaze billing plan.
4. Open `/admin`, enter the PIN, edit the content, and select **Save changes**.

The PIN endpoint allows five attempts per IP per 15-minute window. Attempts are
stored as hashed IP identifiers in Realtime Database.

The editor manages the introduction, section headings, links, skills,
proficiency, projects, thumbnails, education/profile details, testimonial, and
marquee labels. Image uploads are limited to 5 MB. Until content is saved to
Realtime Database at `/portfolio/content`, the site uses its bundled defaults.

The website's public portfolio content and uploaded images are readable by
visitors. Do not put private information in those fields. The existing contact
form writes messages under `/Viewers`; its public-write rule is kept separate
from the owner-only portfolio rules.

## Build

```sh
npm run build
```
