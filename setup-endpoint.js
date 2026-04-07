/**
 * setup-endpoint.js
 *
 * Creates (or updates) the Plivo SIP Endpoint for Agent 1 so the browser SDK can log in.
 * Run this once before testing.
 *
 * Usage:
 *   node setup-endpoint.js
 */

require('dotenv').config();
const plivo = require('plivo');

const authId    = process.env.PLIVO_AUTH_ID;
const authToken = process.env.PLIVO_AUTH_TOKEN;
const username  = process.env.AGENT1_ENDPOINT_USERNAME;
const password  = process.env.AGENT1_ENDPOINT_PASSWORD;
const alias     = process.env.AGENT1_NAME;

if (!authId || !authToken) {
  console.error('ERROR: PLIVO_AUTH_ID and PLIVO_AUTH_TOKEN must be set in .env');
  process.exit(1);
}

const client = new plivo.Client(authId, authToken);

(async () => {
  console.log(`\nSetting up Plivo endpoint for: ${username} (${alias})\n`);

  // Check if endpoint already exists
  let existing = null;
  try {
    const list = await client.endpoints.list({ limit: 20 });
    const objects = list.objects || list;
    existing = objects.find(e => e.username === username);
  } catch (err) {
    console.error('ERROR fetching endpoint list:', err.message);
    process.exit(1);
  }

  if (existing) {
    // Update password on existing endpoint
    try {
      await client.endpoints.update(existing.endpoint_id, {
        password,
        alias,
      });
      console.log(`✓ Endpoint "${username}" already exists — password updated.`);
      console.log(`  Endpoint ID: ${existing.endpoint_id}`);
      console.log(`  SIP URI:     ${existing.sip_uri}`);
    } catch (err) {
      console.error('ERROR updating endpoint:', err.message);
      process.exit(1);
    }
  } else {
    // Create new endpoint
    try {
      const resp = await client.endpoints.create(username, password, alias);
      console.log(`✓ Endpoint "${username}" created successfully.`);
      console.log(`  Endpoint ID: ${resp.endpoint_id || resp.id || '(see Plivo Console)'}`);
    } catch (err) {
      console.error('ERROR creating endpoint:', err.message);
      if (err.message && err.message.includes('already exists')) {
        console.log('\nHint: The username may already exist under a different alias.');
        console.log('Check Voice → Endpoints in the Plivo Console.');
      }
      process.exit(1);
    }
  }

  console.log('\n✓ Done. Now reload the browser and select the agent — it should connect.');
  console.log(`  Username: ${username}`);
  console.log(`  Password: ${password}`);
})();
