// src/components/BrowseOffers.tsx

import React, { useState, useEffect } from 'react';
import algosdk, { Transaction } from 'algosdk';
import { peraWallet } from '../perawallet';
import { getAlgodClient } from '../utils/algodClient';
import { getIndexerClient } from '../utils/indexerClient';
import { DEPLOYER_ADDRESS } from '../config';

interface BrowseOffersProps {
  accountAddress: string;
}

interface Offer {
  appId: number;
  maker: string;
  sellAssetId: number;
  sellAmount: number;
  buyAssetId: number;
  buyAmount: number;
  pricePerUnit: number;
  expiryText: string;
}

const decodeState = (state: any[]): Record<string, string | number | bigint> => {
  const decodedState: Record<string, string | number | bigint> = {};
  state.forEach((item) => {
    const key = atob(item.key);
    const value = item.value;
    decodedState[key] = value.type === 1 ? algosdk.encodeAddress(new Uint8Array(Buffer.from(value.bytes, "base64"))) : value.uint;
  });
  return decodedState;
};

function BrowseOffers({ accountAddress }: BrowseOffersProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const algodClient = getAlgodClient();
  
  useEffect(() => {
    const fetchOffers = async () => {
      if (!DEPLOYER_ADDRESS) {
        setFeedback("Deployer address not set in config.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setFeedback('');
      try {
        const indexerClient = getIndexerClient();
        const response = await indexerClient.lookupApplications(DEPLOYER_ADDRESS as unknown as number).do();

        const processedOffers: Offer[] = (response as any).applications
          .map((app: any) => {
            if (!app.params['global-state']) return null;
            const state = decodeState(app.params['global-state']);
            if (state.is_completed === 1) return null;

            const sellAmount = Number(state.asset_a_amount);
            const buyAmount = Number(state.asset_b_amount);
            const pricePerUnit = sellAmount > 0 ? buyAmount / sellAmount / 1_000_000 : 0;

            return {
              appId: app.id,
              maker: state.maker as string,
              sellAssetId: state.asset_a_id as number,
              sellAmount: sellAmount,
              buyAssetId: state.asset_b_id as number,
              buyAmount: buyAmount,
              pricePerUnit: pricePerUnit,
              expiryText: "On-chain",
            };
          })
          .filter((offer: Offer | null): offer is Offer => offer !== null);

        setOffers(processedOffers);
      } catch (error) {
        console.error("Failed to fetch offers:", error);
        setFeedback('Could not fetch offers from the Indexer.');
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const handleAcceptOffer = async (offer: Offer) => {
    if (!accountAddress) {
      setFeedback("Please connect your wallet first.");
      return;
    }
    if (!offer.maker) {
      setFeedback("Offer is missing maker address.");
      return;
    }
    setAcceptingId(offer.appId);
    setFeedback('Preparing transaction...');
    try {
      const suggestedParams = await algodClient.getTransactionParams().do();
      const appAddress = algosdk.getApplicationAddress(offer.appId);
      const transactions: Transaction[] = [
        algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: accountAddress,
          receiver: appAddress,
          amount: offer.buyAmount,
          suggestedParams,
        }),
        algosdk.makeApplicationNoOpTxnFromObject({
          sender: accountAddress,
          appIndex: offer.appId,
          appArgs: [new Uint8Array(Buffer.from("accept_offer"))],
          foreignAssets: [offer.sellAssetId],
          accounts: [offer.maker],
          suggestedParams,
        }),
      ];
      algosdk.assignGroupID(transactions);
      const txnsToSign = transactions.map((txn) => ({ txn, signers: [accountAddress] }));
      
      setFeedback('Please check your Pera Wallet to sign the transaction.');
      const encoded = txnsToSign.map(({ txn }) => ({ txn: algosdk.encodeUnsignedTransaction(txn) }));
      const signed = await peraWallet.signTransaction([encoded as unknown as any]);
      const signedFlat = signed.flat();
      
      setFeedback('Signature received! Sending transaction...');
      const sendResult = await algodClient.sendRawTransaction(signedFlat).do();
      const txId = (sendResult as any).txId ?? (sendResult as any).txid ?? '';
      setFeedback(`Offer accepted! TxID: ${String(txId).substring(0, 10)}...`);
      setOffers(offers.filter(o => o.appId !== offer.appId));
    } catch (error: any) {
      console.error("Failed to accept offer:", error);
      setFeedback(`Transaction failed: ${error?.message || 'User rejected request.'}`);
    } finally {
      setAcceptingId(null);
    }
  };
  
  const formatMaker = (maker: string) => maker.length > 8 ? `${maker.substring(0, 4)}...${maker.slice(-4)}` : maker;

  return (
    <div className="bg-[#1a202c] p-6 rounded-lg border border-gray-700 w-full max-w-2xl ml-8">
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">BROWSE PUBLIC OFFERS</h2>
      {loading ? ( <p className="text-center text-gray-400">Loading live offers from TestNet...</p> ) : offers.length === 0 ? ( <p className="text-center text-gray-400">No active offers found.</p> ) : (
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
              {offers.map((offer: Offer) => (
                <tr key={offer.appId} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="p-2 font-mono text-sm">{formatMaker(offer.maker)}</td>
                  <td className="p-2">{`${offer.sellAmount} of ASA #${offer.sellAssetId}`}</td>
                  <td className="p-2">{`${offer.buyAmount / 1_000_000}`}</td>
                  <td className="p-2">{offer.pricePerUnit.toFixed(4)}</td>
                  <td className="p-2">{offer.expiryText}</td>
                  <td className="p-2 text-right">
                    <button onClick={() => handleAcceptOffer(offer)} disabled={acceptingId === offer.appId} className="bg-gray-600 hover:bg-cyan-500 text-white font-bold py-1 px-3 rounded text-sm transition-colors disabled:bg-gray-800 disabled:cursor-wait">
                      {acceptingId === offer.appId ? '...' : 'ACCEPT'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {feedback && <p className="mt-4 text-center text-sm text-gray-400 break-all">{feedback}</p>}
    </div>
  );
}

export default BrowseOffers;