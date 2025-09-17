import algosdk from 'algosdk';

// --- CORRECT CONFIGURATION FOR PUBLIC TESTNET ---

// The API token for AlgoNode's public server is an empty string.
const algodToken = ''; 

// The server address for the Algorand TestNet provided by AlgoNode.
const algodServer = 'https://testnet-api.algonode.cloud';

// The port for HTTPS traffic is 443.
const algodPort = 443;

export function getAlgodClient() {
  // This now creates a client correctly configured to talk to the TestNet.
  return new algosdk.Algodv2(algodToken, algodServer, algodPort);
}