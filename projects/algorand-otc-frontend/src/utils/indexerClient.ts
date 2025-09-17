import algosdk from 'algosdk';

const indexerToken = ''; // No token needed for public AlgoNode
const indexerServer = 'https://testnet-idx.algonode.cloud';
const indexerPort = 443;

export function getIndexerClient() {
  return new algosdk.Indexer(indexerToken, indexerServer, indexerPort);
}