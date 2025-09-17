import React, { useState } from 'react';
import algosdk, { Transaction } from 'algosdk';
import { peraWallet } from '../perawallet';
import { getAlgodClient } from '../utils/algodClient';

interface BrowseOffersProps {
  accountAddress: string;
}

interface Offer {
  appId: number;
  maker: string;
  sellAssetId: number;
  sellAmount: number; // in base units of the asset
  buyAssetId: number; // 0 for ALGO
  buyAmount: number; // in microAlgos
  pricePerUnit: number;
  expiryText: string;
}

// Dummy data for the UI. NOTE: buyAmount is in microAlgos (1,000,000 microAlgos = 1 ALGO)
const dummyOffers: Offer[] = [
  {
    appId: 12345678, // Replace with a real App ID from your deployment for testing
    maker: "MAKER...", // Replace with the real maker address
    sellAssetId: 10458941, // TestNet USDC
    sellAmount: 150000000, // 150 USDC (assuming 6 decimals)
    buyAssetId: 0,
    buyAmount: 300_000_000, // 300 ALGO
    pricePerUnit: 2,
    expiryText: "10h left",
  },
  {
    appId: 87654321, // Replace with a real App ID from your deployment for testing
    maker: "MAKER...", // Replace with the real maker address
    sellAssetId: 811721479, // TestNet PAW
    sellAmount: 10000,
    buyAssetId: 0,
    buyAmount: 50_000_000, // 50 ALGO
    pricePerUnit: 0.005,
    expiryText: "2d left",
  },
];

function BrowseOffers({ accountAddress }: BrowseOffersProps) {
  const [offers, setOffers] = useState<Offer[]>(dummyOffers);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const algodClient = getAlgodClient();

  const handleAcceptOffer = async (offer: Offer) => {
    if (!accountAddress) {
      setFeedback("Please connect your wallet first.");
      return;
    }

    setAcceptingId(offer.appId);
    setFeedback('Preparing transaction...');

    try {
      const suggestedParams = await algodClient.getTransactionParams().do();
      const appAddress = algosdk.getApplicationAddress(offer.appId);

      // Your smart contract requires a group of two transactions:
      const transactions: Transaction[] = [
        // 1. The Taker's payment (sending ALGO to the contract)
        algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          from: accountAddress,
          to: appAddress,
          amount: offer.buyAmount, // Amount in microAlgos
          suggestedParams,
        }),
        // 2. The Application Call to the `accept_offer` method
        algosdk.makeApplicationNoOpTxnFromObject({
          from: accountAddress,
          appIndex: offer.appId,
          appArgs: [new Uint8Array(Buffer.from("accept_offer"))],
          // The contract needs to know about the assets and accounts it will interact with
          foreignAssets: [offer.sellAssetId],
          accounts: [offer.maker],
          suggestedParams,
        }),
      ];

      // Group transactions to ensure they happen together or not at all
      algosdk.assignGroupID(transactions);

      // Format for Pera Wallet's signTransaction method
      const txnsToSign = transactions.map(txn => ({ txn, signers: [accountAddress] }));
      
      setFeedback('Please check your Pera Wallet to sign the transaction.');

      // This line triggers the Pera Wallet popup on the user's phone
      const signedTxns = await peraWallet.signTransaction([txnsToSign]);
      
      setFeedback('Signature received! Sending transaction to the network...');
      const { txId } = await algodClient.sendRawTransaction(signedTxns).do();

      setFeedback(`Offer accepted! TxID: ${txId.substring(0, 10)}...`);
      // Remove the offer from the UI for a better user experience
      setOffers(offers.filter(o => o.appId !== offer.appId));

    } catch (error: any) {
      console.error("Failed to accept offer:", error);
      setFeedback(`Transaction failed: ${error?.message || 'User rejected request.'}`);
    } finally {
      setAcceptingId(null); // Reset loading state for this button
    }
  };

  const formatMaker = (maker: string) => {
    if (maker.length > 12) {
      return `${maker.substring(0, 5)}...${maker.slice(-4)}`;
    }
    return maker;
  };

  return (
    <div className="bg-[#1a202c] p-6 rounded-lg border border-gray-700 w-full max-w-2xl ml-8">
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">BROWSE PUBLIC OFFERS</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-600 text-gray-400">
              <th className="p-2 font-semibold">MAKER</th>
              <th className="p-2 font-semibold">SELL</th>
              <th className="p-2 font-semibold">BUY (ALGO)</th>
              <th className="p-2 font-semibold">PRICE/UNIT</th>
              <th className="p-2 font-semibold">EXPIRY</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.appId} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="p-2 font-mono text-sm">{formatMaker(offer.maker)}</td>
                <td className="p-2">{`${offer.sellAmount / 10**6} ASA#${offer.sellAssetId}`}</td>
                <td className="p-2">{`${offer.buyAmount / 1_000_000}`}</td>
                <td className="p-2">{offer.pricePerUnit.toFixed(4)}</td>
                <td className="p-2">{offer.expiryText}</td>
                <td className="p-2 text-right">
                  <button 
                    onClick={() => handleAcceptOffer(offer)}
                    disabled={acceptingId === offer.appId}
                    className="bg-gray-600 hover:bg-cyan-500 text-white font-bold py-1 px-3 rounded text-sm transition-colors disabled:bg-gray-800 disabled:cursor-wait"
                  >
                    {acceptingId === offer.appId ? '...' : 'ACCEPT'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {feedback && <p className="mt-4 text-center text-sm text-gray-400 break-all">{feedback}</p>}
    </div>
  );
}

export default BrowseOffers;