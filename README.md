# Es Pisang Ijo POS (PWA starter)

This is a mobile-friendly installable web app. It uses Supabase for shared cloud sales records.

## What is included
- Four fixed menu prices: Original RM10, Mix RM12, Special RM15, Extra Special RM18
- Transaction entry with quantity and Cash / QR payment type
- Today's totals, menu breakdown and recent transactions
- CSV export
- PWA manifest and service worker for Android home-screen installation

## Important: deployment is not automatic
A permanent public URL and shared database require one-time setup in accounts owned by you. This project does not contain your credentials and has not been published yet.

## 1. Create the shared database (Supabase)
1. Create a free Supabase project at https://supabase.com.
2. Open SQL Editor, paste `supabase-schema.sql`, and run it.
3. In Authentication > Users, create two users: your account and your wife's account. Use separate passwords.
4. Disable public sign-ups in Authentication settings after creating both users.
5. In Project Settings > API, copy the Project URL and the public anon/publishable key. Never copy the service_role/secret key.

The SQL policies let signed-in users read and insert sales. Since public sign-ups are disabled and only your two accounts should exist, this starter is intended for a private two-person POS. Do not share the public key together with a service_role key.

## 2. Publish free (GitHub Pages)
1. Create/sign in to GitHub and create a new public repository, e.g. `es-pisang-ijo-pos`.
2. Upload all files from this folder to the repository root.
3. Open Settings > Pages. Choose Deploy from a branch, select `main` and `/ (root)`, then Save.
4. GitHub will show the permanent URL, usually `https://YOUR-USERNAME.github.io/es-pisang-ijo-pos/`.
5. Open that URL on each Android phone in Chrome. Use the app's connection panel to enter the same Supabase Project URL and public anon key on both phones.
6. Sign in on each phone using its own authorised email/password.
7. In Chrome, menu ⋮ > Add to Home screen or Install app.

## 3. Data and security notes
- Sales are stored in Supabase, not only on the phone.
- Both phones see the same cloud records.
- Dashboard in this starter shows today's transactions based on the phone's local date.
- The public anon key is designed to be used in browser apps. Never put a Supabase service_role or secret key in browser code.
- This starter does not yet include stock tracking, cost/profit accounting, refunds, editing/deleting transactions, multi-business support, or advanced staff roles.
- Test with a small sample transaction before using it for real sales.
