# RJN PRINT PORTAL — updated starter package

This ZIP is a **starter implementation**, not a verified production release. It includes the requested 37 service listings, wallet ledger/history, admin price/enable controls, manual wallet credit/debit/refund, top-up approval/rejection, broadcast in-portal notifications, basic branding/poster URL settings, login/registration, customer orders, and `/api/health`.

## Deploy
1. Extract the ZIP.
2. Upload all files/folders to your GitHub repository, keeping the structure.
3. In Render use Build Command `npm install` and Start Command `npm start`.
4. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (strong unique password), `SESSION_SECRET` (random 32+ characters), and `NODE_ENV=production`.
5. Verify `/api/health` returns JSON `{ "ok": true, ... }`.

## Important before real customers
- The first admin is created from environment variables only on first startup. Change default credentials and set a strong SESSION_SECRET before deployment.
- This starter stores data in local `data/db.json`; Render local disk may reset/redeploy. Configure a managed database and persistent private file storage before real transactions.
- The UI lists all automatic tools but does not implement the full underlying image/OCR/PDF/voice functionality for each tool. Sara AI voice, real PAN submissions, authorized lookup provider integration, document upload, PDF receipt generation, and genuine external tracking integrations are not fully implemented.
- Price entries for the two paid automatic colour Aadhaar tools are set to ₹5 as a placeholder because final prices were not provided; change in admin before publishing. Other service prices are based on the requirements shared in chat and should be reviewed before launch.
- PAN/Aadhaar lookups must only use authorized, consent-based provider channels. Do not use this starter to access private identity data without permission.
- Wallet top-up is only credited after admin approval; UTR submission alone is not proof of payment. Test with dummy accounts and small amounts first.
- No automated test suite or live deployment test is included in this ZIP. Test on a staging service before handling customer data.


## Service icon update
- Added original SVG logo-style icons to `public/icons/services/`.
- Every configured service in `services.json` has its own icon path and service cards display the icons.
- This package currently contains **37 configured service records** (18 automatic tools plus the manual/PAN-related listings). All configured services receive icons.
- Icons are original visual placeholders, not official government logos or endorsements.


## Demo activity preview
The customer home dashboard includes a clearly-labelled **DEMO ONLY** activity preview. It cycles through 56 sample name/service entries every second. The entry index is based on the current Unix second, so customers on different devices see the same sample entry at the same time. These records are illustrative only and are not real application submissions.


## Supplied RJN branding and advertisement
- Uses the uploaded RJN PRINT PORTAL logo artwork in the header.
- Shows the uploaded RJN PRINT PORTAL promotional poster on the customer dashboard by default.
- The demo activity rotation has 300 slots and is labelled as sample/demo activity. This package expansion repeats the initial sample records to fill 300 slots; it does **not** represent 300 distinct verified applications. Replace the repeated entries with the full approved demo list before publishing if all 300 should be unique.


## Updated customer authentication
- Registration requires full name, mobile, email, password (8+ characters), and a 4–8 digit recovery PIN.
- Login accepts mobile or email plus password and displays a success alert with the customer's name, or a generic “Incorrect details” alert.
- Forgot password requires matching full name, registered mobile/email, and PIN. On success, a new-password page appears; on mismatch, the reset flow does not open.
- Passwords and recovery PINs are stored as bcrypt hashes, not plaintext. The reset verification is tied to the session and expires after 10 minutes.
- This PIN recovery is a basic account-recovery method; a verified email/SMS recovery flow is stronger for a public production portal.


## Animated sign-in and registration design
- Login, registration, forgot-password and change-password screens share a smooth multi-colour animated gradient background.
- The supplied RJN promotional poster appears beside the form on desktop and below the form on mobile.
- The poster is also visible while moving between login, registration, and password recovery screens.
- Demo activity timing remains a global-clock synchronized preview; this revision sets the display cadence to two seconds.
