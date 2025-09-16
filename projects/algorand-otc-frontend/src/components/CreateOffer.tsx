// import React, { useState } from 'react';

// // We will pass the connected account address as a prop
// interface CreateOfferProps {
//   accountAddress: string;
// }

// function CreateOffer({ accountAddress }: CreateOfferProps) {
//   const [sellAssetId, setSellAssetId] = useState('');
//   const [sellAmount, setSellAmount] = useState('');
//   const [buyAssetId, setBuyAssetId] = useState('');
//   const [buyAmount, setBuyAmount] = useState('');
//   const [expiration, setExpiration] = useState('24'); // Default to 24 hours
//   const [isPrivate, setIsPrivate] = useState(false);
//   const [privateTaker, setPrivateTaker] = useState('');

//   const handleCreateOffer = () => {
//     // We will implement the transaction logic here in the next step
//     alert('Creating offer... (logic to be implemented)');
//     console.log({
//       sellAssetId,
//       sellAmount,
//       buyAssetId,
//       buyAmount,
//       expiration,
//       isPrivate,
//       privateTaker,
//       creator: accountAddress
//     });
//   };

//   return (
//     <div className="bg-[#1a202c] p-6 rounded-lg border border-gray-700 w-full max-w-md">
//       <h2 className="text-2xl font-bold mb-4 text-cyan-400">CREATE NEW OFFER</h2>
      
//       <div className="space-y-4">
//         <input
//           type="number"
//           placeholder="SELL: ASA ID"
//           value={sellAssetId}
//           onChange={(e) => setSellAssetId(e.target.value)}
//           className="w-full bg-gray-800 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
//         />
//         <input
//           type="number"
//           placeholder="QUANTITY (Sell Amount)"
//           value={sellAmount}
//           onChange={(e) => setSellAmount(e.target.value)}
//           className="w-full bg-gray-800 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
//         />
//         <input
//           type="number"
//           placeholder="BUY: ASA ID"
//           value={buyAssetId}
//           onChange={(e) => setBuyAssetId(e.target.value)}
//           className="w-full bg-gray-800 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
//         />
//         <input
//           type="number"
//           placeholder="QUANTITY (Buy Amount)"
//           value={buyAmount}
//           onChange={(e) => setBuyAmount(e.target.value)}
//           className="w-full bg-gray-800 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
//         />
        
//         <select 
//           value={expiration} 
//           onChange={(e) => setExpiration(e.target.value)}
//           className="w-full bg-gray-800 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
//         >
//           <option value="1">1 Hour</option>
//           <option value="24">24 Hours</option>
//           <option value="168">7 Days</option>
//         </select>

//         <div className="flex items-center justify-between">
//           <label htmlFor="private-trade" className="text-gray-400">PRIVATE TRADE</label>
//           <div 
//             onClick={() => setIsPrivate(!isPrivate)}
//             className={`w-14 h-8 flex items-center bg-gray-700 rounded-full p-1 cursor-pointer transition-colors ${isPrivate ? 'bg-cyan-500' : ''}`}
//           >
//             <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${isPrivate ? 'translate-x-6' : ''}`}></div>
//           </div>
//         </div>

//         {isPrivate && (
//           <input
//             type="text"
//             placeholder="Private Taker Address"
//             value={privateTaker}
//             onChange={(e) => setPrivateTaker(e.target.value)}
//             className="w-full bg-gray-800 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
//           />
//         )}

//         <button
//           onClick={handleCreateOffer}
//           className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 px-4 rounded transition-colors"
//         >
//           DEPOSIT & CREATE OFFER
//         </button>
//       </div>
//     </div>
//   );
// }

// export default CreateOffer;

import React, { useState } from 'react';
import algosdk from 'algosdk';
import { peraWallet } from '../perawallet'; // Our Pera Wallet instance
import { OTCDapp_APP_ID } from '../config';   // Our App ID
import { getAlgodClient } from '../utils/algodClient'; // Our algod client helper

interface CreateOfferProps {
  accountAddress: string;
}

function CreateOffer({ accountAddress }: CreateOfferProps) {
  const [sellAssetId, setSellAssetId] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [buyAssetId, setBuyAssetId] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [expiration, setExpiration] = useState('24');
  const [isPrivate, setIsPrivate] = useState(false);
  const [privateTaker, setPrivateTaker] = useState('');

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const algodClient = getAlgodClient();

  const handleCreateOffer = async () => {
    // 1. Input Validation
    if (!accountAddress) {
      setFeedback('Please connect your wallet first.');
      return;
    }
    if (!sellAssetId || !sellAmount || !buyAssetId || !buyAmount || (isPrivate && !privateTaker)) {
      setFeedback('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setFeedback('Preparing transaction...');

    try {
      // 2. Prepare transaction components
      const appAddress = algosdk.getApplicationAddress(OTCDapp_APP_ID);
      const suggestedParams = await algodClient.getTransactionParams().do();
      
      // NOTE: In a real app, you would fetch asset decimals. For now, we assume 0 for simplicity.
      // Adjust this if your test assets have decimals.
      const sellAmountInBase = Number(sellAmount);
      const buyAmountInBase = Number(buyAmount);
      
      const expirationRounds = Number(expiration) * 973; // Approx rounds per hour

      // 3. Create the transaction group
      
      // We must encode the method signature for the `create` method
      const appArgs = [
        algosdk.decodeAddress(accountAddress).publicKey, // asset_a
        algosdk.encodeUint64(sellAmountInBase),          // asset_a_amount
        algosdk.decodeAddress(accountAddress).publicKey, // asset_b - this is just a placeholder
        algosdk.encodeUint64(buyAmountInBase),           // asset_b_amount
        algosdk.encodeUint64(expirationRounds),          // expiration_rounds
        isPrivate ? algosdk.decodeAddress(privateTaker).publicKey : new Uint8Array(32) // taker_address
      ];

      // Define the method from the ABI
      const createMethod = algosdk.getMethodByName(
        // We'll create a dummy ABI object here. In a full build, this would be auto-generated.
        [
          { name: "create", args: [{type:"asset"}, {type:"uint64"}, {type:"asset"}, {type:"uint64"}, {type:"uint64"}, {type:"address"}] }
        ],
        "create"
      );
      
      const transactions = [
        // Txn 1: Fund the contract MBR
        algosdk.makePaymentTxnWithSuggestedParamsFromObject({
            from: accountAddress,
            to: appAddress,
            amount: 200000, // 0.2 ALGO
            suggestedParams,
        }),
        // Txn 2: Send the Sell Asset to the contract
        algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
            from: accountAddress,
            to: appAddress,
            assetIndex: Number(sellAssetId),
            amount: sellAmountInBase,
            suggestedParams,
        }),
        // Txn 3: Call the `create` method on the smart contract
        algosdk.makeApplicationCallTxnFromObject({
            from: accountAddress,
            appIndex: OTCDapp_APP_ID,
            onComplete: algosdk.OnApplicationComplete.NoOpOC,
            appArgs: [createMethod.getSelector(), ...appArgs.slice(1)], // Use the method selector
            foreignAssets: [Number(sellAssetId), Number(buyAssetId)],
            suggestedParams,
        }),
      ];

      // Group transactions atomically
      algosdk.assignGroupID(transactions);

      // 4. Format for Pera Wallet and Sign
      const txnsToSign = transactions.map(txn => ({ txn, signers: [accountAddress] }));

      setFeedback('Please sign the transaction in your Pera Wallet...');
      const signedTxns = await peraWallet.signTransaction([txnsToSign]);

      // 5. Send to the network
      setFeedback('Sending transaction to the network...');
      const { txId } = await algodClient.sendRawTransaction(signedTxns).do();
      setFeedback(`Offer created successfully! TxID: ${txId}`);

    } catch (error) {
      console.error(error);
      setFeedback('An error occurred. See the console for details.');
    } finally {
      setLoading(false);
    }
  };

  // The JSX part of the component remains the same
  return (
    <div className="bg-[#1a202c] p-6 rounded-lg border border-gray-700 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">CREATE NEW OFFER</h2>
      <div className="space-y-4">
        <input type="number" placeholder="SELL: ASA ID" value={sellAssetId} onChange={(e) => setSellAssetId(e.target.value)} className="w-full bg-gray-800 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        <input type="number" placeholder="QUANTITY (Sell Amount)" value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} className="w-full bg-gray-800 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        <input type="number" placeholder="BUY: ASA ID" value={buyAssetId} onChange={(e) => setBuyAssetId(e.target.value)} className="w-full bg-gray-800 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        <input type="number" placeholder="QUANTITY (Buy Amount)" value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)} className="w-full bg-gray-800 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        <select value={expiration} onChange={(e) => setExpiration(e.target.value)} className="w-full bg-gray-800 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500">
          <option value="1">1 Hour</option>
          <option value="24">24 Hours</option>
          <option value="168">7 Days</option>
        </select>
        <div className="flex items-center justify-between">
          <label className="text-gray-400">PRIVATE TRADE</label>
          <div onClick={() => setIsPrivate(!isPrivate)} className={`w-14 h-8 flex items-center bg-gray-700 rounded-full p-1 cursor-pointer transition-colors ${isPrivate ? 'bg-cyan-500' : ''}`}>
            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${isPrivate ? 'translate-x-6' : ''}`}></div>
          </div>
        </div>
        {isPrivate && (<input type="text" placeholder="Private Taker Address" value={privateTaker} onChange={(e) => setPrivateTaker(e.target.value)} className="w-full bg-gray-800 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />)}
        <button
          onClick={handleCreateOffer}
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 px-4 rounded transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {loading ? feedback : 'DEPOSIT & CREATE OFFER'}
        </button>
        {feedback && !loading && <p className="mt-4 text-center text-sm text-gray-400 break-all">{feedback}</p>}
      </div>
    </div>
  );
}

export default CreateOffer;