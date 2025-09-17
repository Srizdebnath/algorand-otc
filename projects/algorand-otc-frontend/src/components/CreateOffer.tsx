// src/components/CreateOffer.tsx

import React, { useState } from 'react';
import algosdk, { AtomicTransactionComposer } from 'algosdk';
import { peraWallet } from '../perawallet';
import { OTCDapp_APP_ID } from '../config';
import { getAlgodClient } from '../utils/algodClient';
import contract from '../contracts/OTCSwap.arc56.json';

interface CreateOfferProps {
  accountAddress: string;
}

// Correct Algorand zero address (32 zero bytes with checksum)
const ZERO_ADDRESS = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";

function CreateOffer({ accountAddress }: CreateOfferProps) {
  const [sellAsaId, setSellAsaId] = useState('');
  const [sellAsaAmount, setSellAsaAmount] = useState('');
  const [receiveAlgoAmount, setReceiveAlgoAmount] = useState('');
  const [expiration, setExpiration] = useState('24');
  const [isPrivate, setIsPrivate] = useState(false);
  const [privateTaker, setPrivateTaker] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const algodClient = getAlgodClient();
  const abiContract = new algosdk.ABIContract(contract);

  const handleCreateOffer = async () => {
    if (!accountAddress) {
      setFeedback('Please connect your wallet first.');
      return;
    }
    if (!sellAsaId || !sellAsaAmount || !receiveAlgoAmount || (isPrivate && !privateTaker)) {
      setFeedback('Please fill in all required fields.');
      return;
    }
    if (isPrivate && privateTaker && !algosdk.isValidAddress(privateTaker)) {
      setFeedback('Private taker address is invalid.');
      return;
    }

    setLoading(true);
    setFeedback('Preparing transaction...');

    try {
      // Pera wallet signer wrapper
      const peraSigner: algosdk.TransactionSigner = async (txns, indexes) => {
        const groupToSign = indexes.map((i) => {
          const txn = txns[i] as unknown as algosdk.Transaction;
          return { txn: txn.toByte() };
        });
        const signedGroups = await peraWallet.signTransaction([groupToSign] as unknown as any);
        return signedGroups[0] as unknown as Uint8Array[];
      };

      const atc = new AtomicTransactionComposer();
      const suggestedParams = await algodClient.getTransactionParams().do();
      const appAddress = algosdk.getApplicationAddress(OTCDapp_APP_ID);

      // NOTE: Adjust decimals depending on your ASA
      const sellAmountInBase = Number(sellAsaAmount);
      const receiveAlgoAmountInMicroAlgos = Number(receiveAlgoAmount) * 1_000_000;
      const expirationRounds = Number(expiration) * 973; // ~1h = 973 rounds

      // Fund escrow with minimum balance
      const fundTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: accountAddress,
        receiver: appAddress,
        amount: 200_000,
        suggestedParams,
      });

      // Transfer ASA to escrow
      const assetTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: accountAddress,
        receiver: appAddress,
        assetIndex: Number(sellAsaId),
        amount: sellAmountInBase,
        suggestedParams,
      });

      atc.addTransaction({ txn: fundTxn, signer: peraSigner });
      atc.addTransaction({ txn: assetTransferTxn, signer: peraSigner });

      // ✅ Correct way: use ABIContract methods directly
      const createMethod = abiContract.methods.find((m) => m.name === "create_application");
      if (!createMethod) {
        throw new Error("create_application method not found in contract ABI");
      }

      atc.addMethodCall({
        appID: OTCDapp_APP_ID,
        method: createMethod,
        sender: accountAddress,
        signer: peraSigner,
        suggestedParams,
        methodArgs: [
          Number(sellAsaId),
          sellAmountInBase,
          0, // asset_b is ALGO
          receiveAlgoAmountInMicroAlgos,
          expirationRounds,
          isPrivate ? privateTaker : ZERO_ADDRESS,
        ],
      });

      setFeedback('Please check your Pera Wallet to sign the transaction...');
      const result = await atc.execute(algodClient, 3);

      setFeedback(`✅ Offer created! TxID: ${result.txIDs[0].substring(0, 10)}...`);
      setSellAsaId('');
      setSellAsaAmount('');
      setReceiveAlgoAmount('');
    } catch (error: any) {
      console.error(error);
      setFeedback(`Transaction failed: ${error?.message || 'User rejected request.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1a202c] p-6 rounded-lg border border-gray-700 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-cyan-400">CREATE SELL OFFER</h2>
      <div className="space-y-4">
        <label className="text-sm font-semibold text-gray-400">Asset to Sell</label>
        <input
          type="number"
          placeholder="ASA ID of the asset you are selling"
          value={sellAsaId}
          onChange={(e) => setSellAsaId(e.target.value)}
          className="w-full bg-gray-800 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <input
          type="number"
          placeholder="Quantity of ASA to sell"
          value={sellAsaAmount}
          onChange={(e) => setSellAsaAmount(e.target.value)}
          className="w-full bg-gray-800 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <label className="text-sm font-semibold text-gray-400">ALGO to Receive</label>
        <input
          type="number"
          placeholder="Amount of ALGO you want in return"
          value={receiveAlgoAmount}
          onChange={(e) => setReceiveAlgoAmount(e.target.value)}
          className="w-full bg-gray-800 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <label className="text-sm font-semibold text-gray-400">Expiration</label>
        <select
          value={expiration}
          onChange={(e) => setExpiration(e.target.value)}
          className="w-full bg-gray-800 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="1">1 Hour</option>
          <option value="24">24 Hours</option>
          <option value="168">7 Days</option>
        </select>
        <div className="flex items-center justify-between pt-2">
          <label className="text-gray-400">PRIVATE TRADE</label>
          <div
            onClick={() => setIsPrivate(!isPrivate)}
            className={`w-14 h-8 flex items-center bg-gray-700 rounded-full p-1 cursor-pointer transition-colors ${isPrivate ? 'bg-cyan-500' : ''}`}
          >
            <div
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${isPrivate ? 'translate-x-6' : ''}`}
            ></div>
          </div>
        </div>
        {isPrivate && (
          <input
            type="text"
            placeholder="Private Taker Address"
            value={privateTaker}
            onChange={(e) => setPrivateTaker(e.target.value)}
            className="w-full bg-gray-800 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        )}
        <button
          onClick={handleCreateOffer}
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 px-4 rounded transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed !mt-6"
        >
          {loading ? feedback : 'DEPOSIT & CREATE OFFER'}
        </button>
        {feedback && !loading && (
          <p className="mt-4 text-center text-sm text-gray-400 break-all">{feedback}</p>
        )}
      </div>
    </div>
  );
}

export default CreateOffer;
