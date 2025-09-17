// import React, { useState, useEffect } from 'react';
// // We import our new dummy data file
// import { dummyOffers } from '../dummyData';

// // We keep these imports commented out for now, to make switching back easy
// // import { getIndexerClient } from '../utils/indexerClient';
// // import { DEPLOYER_ADDRESS } from '../config';

// interface Offer {
//   appId: number;
//   maker: string;
//   sellAssetId: number;
//   sellAmount: number;
//   buyAssetId: number;
//   buyAmount: number;
//   pricePerUnit: number;
//   expiryText: string;
// }

// function BrowseOffers() {
//   // 1. Initialize the offers state with our dummy data
//   const [offers, setOffers] = useState<Offer[]>(dummyOffers);
//   // 2. Initialize loading to false since we aren't fetching
//   const [loading, setLoading] = useState(false);

//   // 3. Comment out the entire useEffect hook. We can uncomment it later to go live.
//   /*
//   useEffect(() => {
//     const fetchOffers = async () => {
//       setLoading(true);
//       try {
//         const indexerClient = getIndexerClient();
//         const response = await indexerClient.lookupApplicationsByCreator(DEPLOYER_ADDRESS).do();
        
//         const processedOffers: Offer[] = response.applications
//           .map((app: any) => {
//             if (!app.params['global-state']) return null;
//             const state = decodeState(app.params['global-state']);
//             if (state.is_completed === 1) return null;

//             const pricePerUnit = Number(state.asset_b_amount) / Number(state.asset_a_amount);
//             const expiryText = `${Math.floor(Number(state.offer_expiry) / 973)}h left`; 

//             return {
//               appId: app.id,
//               maker: state.maker as string,
//               sellAssetId: state.asset_a_id as number,
//               sellAmount: state.asset_a_amount as number,
//               buyAssetId: state.asset_b_id as number,
//               buyAmount: state.asset_b_amount as number,
//               pricePerUnit: pricePerUnit,
//               expiryText: expiryText,
//             };
//           })
//           .filter((offer): offer is Offer => offer !== null);

//         setOffers(processedOffers);
//       } catch (error) {
//         console.error("Failed to fetch offers:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOffers();
//   }, []);
//   */

//   const handleAcceptOffer = (appId: number) => {
//     alert(`Accepting Offer from App ID: ${appId} (Logic to be implemented)`);
//   };

//   // Helper function to show a shorter, more readable maker address
//   const formatMaker = (maker: string) => {
//     if (maker.length > 12) {
//       return `${maker.substring(0, 5)}...`;
//     }
//     return maker;
//   };

//   // The JSX part is almost the same, but we will use asset IDs for now
//   return (
//     <div className="bg-[#1a202c] p-6 rounded-lg border border-gray-700 w-full max-w-2xl ml-8">
//       <h2 className="text-2xl font-bold mb-4 text-cyan-400">BROWSE PUBLIC OFFERS</h2>
//       {loading ? (
//         <p>Loading offers...</p>
//       ) : (
//         <table className="w-full text-left">
//           <thead>
//             <tr className="border-b border-gray-600 text-gray-400">
//               <th className="p-2 font-semibold">MAKER</th>
//               <th className="p-2 font-semibold">SELL</th>
//               <th className="p-2 font-semibold">BUY</th>
//               <th className="p-2 font-semibold">PRICE/UNIT</th>
//               <th className="p-2 font-semibold">EXPIRY</th>
//               <th className="p-2"></th>
//             </tr>
//           </thead>
//           <tbody>
//             {offers.map((offer) => (
//               <tr key={offer.appId} className="border-b border-gray-700 hover:bg-gray-800">
//                 <td className="p-2 font-mono text-sm">{formatMaker(offer.maker)}</td>
//                 <td className="p-2">{`${offer.sellAmount} ASA#${offer.sellAssetId}`}</td>
//                 <td className="p-2">{`${offer.buyAmount} ASA#${offer.buyAssetId}`}</td>
//                 <td className="p-2">{offer.pricePerUnit.toFixed(4)}</td>
//                 <td className="p-2">{offer.expiryText}</td>
//                 <td className="p-2 text-right">
//                   <button 
//                     onClick={() => handleAcceptOffer(offer.appId)}
//                     className="bg-gray-600 hover:bg-cyan-500 text-white font-bold py-1 px-3 rounded text-sm transition-colors"
//                   >
//                     ACCEPT
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }

// export default BrowseOffers;


import React, { useState, useEffect } from 'react';
import algosdk from 'algosdk';
import { dummyOffers } from '../dummyData';
import { peraWallet } from '../perawallet';
import { getAlgodClient } from '../utils/algodClient';

// This component now needs to know the connected user's address
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

function BrowseOffers({ accountAddress }: BrowseOffersProps) {
  const [offers, setOffers] = useState<Offer[]>(dummyOffers);
  const [loading, setLoading] = useState(false);
  
  // New state to track which offer is being accepted for UI feedback
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');

  const algodClient = getAlgodClient();

  // The new, fully implemented accept offer function
  const handleAcceptOffer = async (offer: Offer) => {
    if (!accountAddress) {
      setFeedback("Please connect your wallet first.");
      return;
    }

    setAcceptingId(offer.appId);
    setFeedback('Preparing to accept offer...');

    try {
      const appAddress = algosdk.getApplicationAddress(offer.appId);
      const suggestedParams = await algodClient.getTransactionParams().do();

      // According to your smart contract, the `accept_offer` transaction group has two parts:
      
      // 1. The Taker's payment transaction (sending Asset B to the contract)
      const takerDepositTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: accountAddress,
        to: appAddress,
        assetIndex: offer.buyAssetId,
        amount: offer.buyAmount, // NOTE: Assumes base units. For real assets, you'd handle decimals.
        suggestedParams,
      });

      // 2. The Application Call to the `accept_offer` method
      const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
        from: accountAddress,
        appIndex: offer.appId,
        appArgs: [new Uint8Array(Buffer.from("accept_offer"))], // Method selector
        suggestedParams,
      });

      // Group them together to be atomic
      const txnsToGroup = [takerDepositTxn, appCallTxn];
      algosdk.assignGroupID(txnsToGroup);

      // Format for Pera Wallet signing
      const txnsToSign = txnsToGroup.map(txn => ({ txn, signers: [accountAddress] }));

      setFeedback('Please sign the transactions in your Pera Wallet.');
      const signedTxns = await peraWallet.signTransaction([txnsToSign]);

      setFeedback('Sending transaction to the network...');
      const { txId } = await algodClient.sendRawTransaction(signedTxns).do();
      
      // In a real app, you would now re-fetch the offers list to remove this one
      setFeedback(`Offer accepted! TxID: ${txId}`);

    } catch (error) {
      console.error("Failed to accept offer:", error);
      setFeedback('Failed to accept offer. See console for details.');
    } finally {
      setAcceptingId(null); // Clear the loading state for this specific offer
    }
  };

  const formatMaker = (maker: string) => {
    if (maker.length > 12) return `${maker.substring(0, 5)}...`;
    return maker;
  };

  return (
    <div className="bg-[#1a202c] p-6 rounded-lg border border-gray-700 w-full max-w-2xl ml-8">
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">BROWSE PUBLIC OFFERS</h2>
      {loading ? (
        <p>Loading offers...</p>
      ) : (
        <>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-600 text-gray-400">
                <th className="p-2 font-semibold">MAKER</th>
                <th className="p-2 font-semibold">SELL</th>
                <th className="p-2 font-semibold">BUY</th>
                <th className="p-2 font-semibold">PRICE/UNIT</th>
                <th className="p-2 font-semibold">EXPIRY</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer.appId} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="p-2 font-mono text-sm">{formatMaker(offer.maker)}</td>
                  <td className="p-2">{`${offer.sellAmount} ASA#${offer.sellAssetId}`}</td>
                  <td className="p-2">{`${offer.buyAmount} ASA#${offer.buyAssetId}`}</td>
                  <td className="p-2">{offer.pricePerUnit.toFixed(4)}</td>
                  <td className="p-2">{offer.expiryText}</td>
                  <td className="p-2 text-right">
                    <button 
                      onClick={() => handleAcceptOffer(offer)}
                      disabled={acceptingId === offer.appId} // Disable only this button
                      className="bg-gray-600 hover:bg-cyan-500 text-white font-bold py-1 px-3 rounded text-sm transition-colors disabled:bg-gray-800 disabled:cursor-wait"
                    >
                      {acceptingId === offer.appId ? '...' : 'ACCEPT'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {feedback && <p className="mt-4 text-center text-sm text-gray-400 break-all">{feedback}</p>}
        </>
      )}
    </div>
  );
}

export default BrowseOffers;