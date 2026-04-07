/**
 * setup-app.js
 *
 * Creates (or updates) the BrowserCallingApp and links the endpoint + number to it.
 * The app answer URL handles SDK-initiated outbound calls.
 * The phone number answer URL handles inbound PSTN calls (set separately in setup-number.js).
 *
 * Usage:
 *   node setup-app.js
 */

require('dotenv').config();
const plivo = require('plivo');

const authId    = process.env.PLIVO_AUTH_ID;
const authToken = process.env.PLIVO_AUTH_TOKEN;
const baseUrl   = process.env.BASE_URL;
const username  = process.env.AGENT1_ENDPOINT_USERNAME;

const client = new plivo.Client(authId, authToken);

(async () => {
  console.log('\n--- Step 1: Find or create BrowserCallingApp ---\n');

  let appId = null;

  const appList = await client.applications.list({ limit: 20 });
  const existing = appList.find(a => a.appName === 'BrowserCallingApp');

  if (existing) {
    appId = existing.appId;
    console.log(`✓ App already exists (ID: ${appId})`);
    await client.applications.update(appId, {
      answer_url: `${baseUrl}/outbound-answer`,
      answer_method: 'POST',
      hangup_url: `${baseUrl}/inbound-fallback`,
      hangup_method: 'POST',
    });
    console.log(`  Answer URL updated to: ${baseUrl}/outbound-answer`);
  } else {
    await client.applications.create('BrowserCallingApp', {
      answer_url: `${baseUrl}/outbound-answer`,
      answer_method: 'POST',
      hangup_url: `${baseUrl}/inbound-fallback`,
      hangup_method: 'POST',
    });
    const updated = await client.applications.list({ limit: 20 });
    const created = updated.find(a => a.appName === 'BrowserCallingApp');
    appId = created && created.appId;
    console.log(`✓ App created (ID: ${appId})`);
  }

  if (!appId) {
    console.error('ERROR: Could not determine app ID.');
    process.exit(1);
  }

  console.log('\n--- Step 2: Link endpoint to app ---\n');

  const epList = await client.endpoints.list({ limit: 20 });
  const ep = epList.find(e => e.username === username);

  if (!ep) {
    console.error(`ERROR: Endpoint "${username}" not found.`);
    epList.forEach(e => console.log(`  alias="${e.alias}"  username="${e.username}"`));
    process.exit(1);
  }

  await client.endpoints.update(ep.endpointId, { app_id: appId });
  console.log(`✓ Endpoint "${ep.alias}" (${ep.username}) linked to app ${appId}`);

  console.log('\n--- Step 3: Set phone number answer URL for inbound PSTN calls ---\n');

  try {
    const number = process.env.AGENT1_PLIVO_NUMBER.replace(/^\+/, '');
    await client.numbers.update(number, {
      answer_url: `${baseUrl}/inbound-call`,
      answer_method: 'POST',
    });
    console.log(`✓ Number +${number} answer URL set to: ${baseUrl}/inbound-call`);
  } catch (err) {
    console.warn(`  Warning: ${err.message}`);
  }

  console.log('\n✓ All done!\n');
  console.log('Restart server → hard-refresh browser (Ctrl+Shift+R)');
  console.log('Select Niraj → Connected → type a number → Click Call');
  console.log('For inbound: call +' + process.env.AGENT1_PLIVO_NUMBER + ' from your phone');
})().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
