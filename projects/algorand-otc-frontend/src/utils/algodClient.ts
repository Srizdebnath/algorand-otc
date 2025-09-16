import algosdk from 'algosdk';

const algodToken = ''; // API token for the Algod server, leave empty for sandbox
const algodServer = 'http://localhost'; // Or your sandbox/testnet address
const algodPort = 4001; // Default sandbox port

export function getAlgodClient() {
  return new algosdk.Algodv2(algodToken, algodServer, algodPort);
}