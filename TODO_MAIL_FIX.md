# Mail Not Coming - Fix Plan

## Steps
- [x] Fix `src/services/adminRequestService.js` - EmailJS v4 API init & send
- [x] Fix `src/context/AuthContext.jsx` - capture and return emailResult
- [x] Fix `src/pages/Register.jsx` - show proper feedback + inline approval links when email fails/succeeds
- [x] Test build with `npm run build`

## Summary of Fixes

### Root Causes Fixed
1. **Missing `emailjs.init()`** — v4 requires initialization before `.send()`
2. **Wrong `.send()` signature** — v4 uses 3 args + init, not 4 args with raw publicKey string
3. **No visual fallback** — users had no way to see approval links when email failed

### Files Changed
- `src/services/adminRequestService.js` — Added `emailjs.init()`, fixed `.send()` to v4 API, returns `acceptLink`/`rejectLink` always
- `src/context/AuthContext.jsx` — Captures `emailResult` from `createRequest()` and returns it
- `src/pages/Register.jsx` — Shows toast on success/failure, displays inline Accept/Reject approval links + "Go to Login" button

### To Test
1. Register as admin
2. If email env vars are set → success toast + green panel with links
3. If email env vars are missing → error toast + amber panel with links + reason

### Required Env Variables
- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`
- `VITE_APP_URL`

