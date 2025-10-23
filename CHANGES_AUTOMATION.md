# Repository tidy-up summary

The project has been normalised so that every HTML page loads the same asset pipeline:

- JavaScript lives in `assets/js/` (`site.js`, `content.js`, `admin.js`, `osun-flow.js`).
- Shared styling lives in `assets/css/site.css`.
- Demo artwork lives in `assets/images/` (now lightweight SVG placeholders).
- The serverless Stripe example is now located at `api/create-checkout-session.js`.

All obsolete temporary files from previous automation runs were removed.
