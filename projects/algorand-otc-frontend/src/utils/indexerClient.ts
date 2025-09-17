// src/utils/indexerClient.ts

import algosdk from 'algosdk';

// Configuration for the public TestNet Indexer
const indexerToken = '';
const indexerServer = 'https://testnet-idx.algonode.cloud';
const indexerPort = 443;

export function getIndexerClient() {
  return new algosdk.Indexer(indexerToken, indexerServer, indexerPort);
}