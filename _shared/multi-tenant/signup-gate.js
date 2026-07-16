/*
 * signup-gate.js — OPTIONAL purchase check at registration.
 *
 * Hosted multi-tenant apps live at <slug>.onetimesuite.com; eventually only
 * people who BOUGHT the app on Whop may register. The check is designed as a
 * single function swap: auth.js awaits `verifyPurchase(email)` during
 * POST /auth/register and refuses with 403 when it resolves falsy.
 *
 * TODO(whop): wire this to the Whop OAuth flow in
 *   onetime-suite/_shared/whop-license/whop-license.js —
 * the real implementation will not trust a typed email at all: it will send
 * the user through Whop OAuth (PKCE, same as whop-license.js ensureLicensed),
 * read the authenticated Whop user, and check `has_access` for this app's
 * experience_id (per-app map: onetime-suite/license-experience-map.json).
 * Until that lands, registration is open — hosted signups are gated at the
 * Whop checkout link instead.
 *
 * Swap it per app (or per deployment) via:
 *   createMultiTenant({ ..., verifyPurchase: async (email) => <real check> })
 */
async function verifyPurchase(email) { // eslint-disable-line no-unused-vars
  return true; // open registration until the Whop OAuth check above is wired
}

module.exports = { verifyPurchase };
