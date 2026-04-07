# Plivo Browser Calling POC

Browser-based calling for 3 sales agents using Plivo. Each agent has an assigned Plivo number, receives inbound calls in the browser, and makes outbound calls with their number as caller ID. Runs locally with ngrok.

---

## Prerequisites

- Node.js 18+
- A [Plivo account](https://console.plivo.com) with 3 phone numbers
- [ngrok](https://ngrok.com) installed

---

## Step 1: Create Plivo Endpoints

Each agent needs a **Plivo Endpoint** (SIP credentials) to register the browser SDK.

1. Log in to [Plivo Console](https://console.plivo.com)
2. Go to **Voice** → **Endpoints** → **New Endpoint**
3. Fill in:
   - **Username**: `Agent1` (must match `AGENT1_ENDPOINT_USERNAME` in `.env`)
   - **Password**: choose a strong password (must match `AGENT1_ENDPOINT_PASSWORD`)
   - **Alias**: `Agent 1`
   - **App**: leave as default or create a Voice SDK app
4. Click **Create**
5. Repeat for `Agent2` and `Agent3`

---

## Step 2: Configure Plivo Number Answer URLs

For each of your 3 Plivo numbers:

1. Go to **Phone Numbers** → click the number
2. Set **Voice Configuration**:
   - **Answer URL**: `https://your-ngrok-url.ngrok.io/inbound-call`
   - **Answer Method**: `POST`
3. Save

Update this URL each time ngrok restarts (see Step 5).

---

## Step 3: Install and Configure

```bash
git clone <this-repo>
cd plivo-browser-calling
npm install
cp .env.example .env
```

Edit `.env` and fill in your real values:

```
PLIVO_AUTH_ID=your_auth_id        # Plivo Console → Overview
PLIVO_AUTH_TOKEN=your_auth_token  # Plivo Console → Overview

AGENT1_NAME=Agent 1
AGENT1_PLIVO_NUMBER=+1xxxxxxxxxx  # E.164 format
AGENT1_ENDPOINT_USERNAME=Agent1
AGENT1_ENDPOINT_PASSWORD=xxxxxxxx

# same for Agent2, Agent3

BASE_URL=https://your-ngrok-url.ngrok.io
PORT=3000
```

---

## Step 4: Start the Server

```bash
node server.js
```

Expected: `Plivo browser calling server running on http://localhost:3000`

---

## Step 5: Set Up ngrok

```bash
ngrok http 3000
```

Copy the HTTPS URL (e.g. `https://abc123.ngrok.io`).

1. Update `BASE_URL` in `.env` with the new URL
2. Restart the server: `node server.js`
3. Update the Answer URL in Plivo Console for each number

> **Note:** The free ngrok tier generates a new URL on each restart. Always repeat steps 1–3 after restarting ngrok.

---

## Step 6: Test Inbound Calls

1. Open `https://your-ngrok-url.ngrok.io` in Chrome or Firefox (use HTTPS for mic access)
2. Select an agent from the dropdown — status should turn **Connected**
3. Allow microphone access when prompted
4. Call that agent's Plivo number from your phone
5. The browser shows an incoming call notification → click **Accept**
6. To test voicemail: call the number but don't click Accept — after 25 seconds you'll hear the voicemail greeting

---

## Step 7: Test Outbound Calls

1. Select an agent in the browser
2. Type a phone number in E.164 format (e.g. `+14155550123`)
3. Click **Call**
4. The destination phone rings with the agent's Plivo number as caller ID
5. Click **Hang Up** to end the call

---

## Common Issues

**Microphone not working / call has no audio**
Chrome/Firefox require HTTPS for mic access. Use the ngrok HTTPS URL, not `http://localhost`.
Check `chrome://settings/content/microphone` — the site must be allowed.

**Status stays "Disconnected" after selecting agent**
- Check browser console for SDK errors
- Verify endpoint username/password in `.env` exactly matches Plivo Console (case-sensitive)
- Endpoint usernames must match exactly: `Agent1`, `Agent2`, `Agent3`

**Inbound call doesn't ring the browser**
- Confirm Answer URL in Plivo Console matches your current ngrok URL + `/inbound-call`
- Confirm the server is running and ngrok is active
- Check server console for `[inbound-call]` log lines

**"Invalid number format" on outbound**
Numbers must be E.164: `+` followed by country code and number, no spaces or dashes.
Example: `+14155550123` not `415-555-0123`

**ngrok "Tunnel not found"**
Free tier URLs expire on restart. Restart ngrok, get new URL, update `.env` and Plivo Console.

**Outbound call connects but no audio**
Make sure you're accessing the app via HTTPS (ngrok URL), not HTTP localhost.

---

## Project Structure

```
plivo-browser-calling/
├── .env.example          # config template
├── config.js             # loads .env, builds agent maps, exports Plivo client
├── server.js             # Express entry point
├── routes/
│   ├── agents.js         # GET /agents, GET /agent-credentials/:id
│   └── calls.js          # /inbound-call, /inbound-fallback, /voicemail-recording,
│                         # /outbound-call, /outbound-answer
├── public/
│   └── index.html        # complete browser UI (Plivo SDK + vanilla JS)
└── package.json
```
