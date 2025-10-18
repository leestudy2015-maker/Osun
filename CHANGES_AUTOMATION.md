# Automated changes performed on 2025-10-16

Summary of automated maintenance tasks performed by the assistant:

- Created `assets/osun-flow.js` (copied content from original root `osun-flow.js`) so HTML files referencing `assets/osun-flow.js` will load correctly.
- Removed potential duplicate root files to avoid conflicts:
  - root `site.js` and root `admin.js` were removed from the repository root to prevent double-definitions.
  - Full backups were written to `archive/js_site.js` and `archive/js_admin.js`.
- Replaced the hardcoded admin password in `js/admin.js` with the placeholder `REPLACE_ME`. Please do not keep real passwords client-side.
- Added a validation script `tools/check-links.ps1` (PowerShell) to scan `.html` files for `<script src="...">` references and report any missing local files.

How to restore archived files:

1. Copy `archive/js_site.js` back to `js/site.js` (or root `site.js`) if you want the archived code restored.
2. Copy `archive/js_admin.js` back to `js/admin.js` (or root `admin.js`) if needed.

Security Note:
- If this repository is public, rotate any credentials that were previously committed. Avoid storing secrets in client-side files.
