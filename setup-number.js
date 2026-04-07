/**
 * setup-number.js
 *
 * Sets the inbound answer URL for your Plivo number using the Plivo REST API.
 * Run this once after starting ngrok (or whenever BASE_URL changes).
 *
 * Usage:
 *   node setup-number.js
 */

require('dotenv').config();
const plivo = require('plivo');

const authId    = process.env.PLIVO_AUTH_ID;
const authToken = process.env.PLIVO_AUTH_TOKEN;
const number    = process.env.AGENT1_PLIVO_NUMBER;   // only one number in POC
const baseUrl   = process.env.BASE_URL;

if (!authId || !authToken) {
  console.error('ERROR: PLIVO_AUTH_ID and PLIVO_AUTH_TOKEN must be set in .env');
  process.exit(1);
}
if (!number) {
  console.error('ERROR: AGENT1_PLIVO_NUMBER must be set in .env');
  process.exit(1);
}
if (!baseUrl || baseUrl.includes('your-ngrok')) {
  console.error('ERROR: BASE_URL in .env still has placeholder value. Update it with your real ngrok URL.');
  process.exit(1);
}

const answerUrl = `${baseUrl}/inbound-call`;
const client    = new plivo.Client(authId, authToken);

// Strip leading + for Plivo number lookup (API expects digits only)
const numberDigits = number.replace(/^\+/, '');

console.log(`\nConfiguring Plivo number: ${number}`);
console.log(`Setting answer URL to:    ${answerUrl}\n`);

(async () => {
  try {
    // Retrieve the phone number object
    const phoneNumber = await client.numbers.get(numberDigits);

    // Update the answer URL and method
    await client.numbers.update(numberDigits, {
      answer_url: answerUrl,
      answer_method: 'POST',
    });

    console.log('✓ Answer URL updated successfully.');
    console.log('\nNext steps:');
    console.log('  1. Make sure your server is running: node server.js');
    console.log(`  2. Open the app: ${baseUrl}`);
    console.log('  3. Select an agent in the dropdown and wait for "Connected"');
    console.log(`  4. Call ${number} from your phone to test inbound`);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      console.error(`ERROR: Number ${number} not found in your Plivo account.`);
      console.error('Check AGENT1_PLIVO_NUMBER in .env matches exactly (including country code).');
    } else {
      console.error('ERROR:', err.message || err);
    }
    process.exit(1);
  }
})();
