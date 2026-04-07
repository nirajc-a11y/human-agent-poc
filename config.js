require('dotenv').config();
const plivo = require('plivo');

const plivoClient = new plivo.Client(
  process.env.PLIVO_AUTH_ID,
  process.env.PLIVO_AUTH_TOKEN
);

const agentMap = {};    // keyed by Plivo number (E.164)
const agentById = {};   // keyed by endpointUsername

[
  {
    name: process.env.AGENT1_NAME,
    number: process.env.AGENT1_PLIVO_NUMBER,
    endpointUsername: process.env.AGENT1_ENDPOINT_USERNAME,
    endpointPassword: process.env.AGENT1_ENDPOINT_PASSWORD,
  },
  {
    name: process.env.AGENT2_NAME,
    number: process.env.AGENT2_PLIVO_NUMBER,
    endpointUsername: process.env.AGENT2_ENDPOINT_USERNAME,
    endpointPassword: process.env.AGENT2_ENDPOINT_PASSWORD,
  },
  {
    name: process.env.AGENT3_NAME,
    number: process.env.AGENT3_PLIVO_NUMBER,
    endpointUsername: process.env.AGENT3_ENDPOINT_USERNAME,
    endpointPassword: process.env.AGENT3_ENDPOINT_PASSWORD,
  },
].forEach((agent) => {
  agentMap[agent.number] = agent;
  agentById[agent.endpointUsername] = agent;
});

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

module.exports = { plivoClient, agentMap, agentById, BASE_URL };
