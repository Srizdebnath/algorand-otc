import React, { useState, useEffect } from 'react';
import algosdk from 'algosdk';
import { getIndexerClient } from '../utils/indexerClient';
import { DEPLOYER_ADDRESS } from '../config';

// Define a type for our processed offer data for better code quality
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

// Helper function to decode the raw state from the blockchain
const decodeState = (state: any[]) => {
  const decoded: { [key: string]: string | number } = {};
  state.forEach((item) => {
    const key = atob(item.key);
    const value = item.value.type === 1 ? item.value.bytes : item.value.uint;
    decoded[key] = value;
  });
  return decoded;
};

function BrowseOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const indexerClient = getIndexerClient();
        // Search for all applications created by our deployer address
        const response = await indexerClient.lookupApplicationsByCreator(DEPLOYER_ADDRESS).do();
        
        const processedOffers: Offer[] = response.applications
          .map((app: any) => {
            if (!app.params['global-state']) return null;
            
            const state = decodeState(app.params['global-state']);

            // Filter out completed or invalid offers
            if (state.is_completed === 1) return null;

            // Calculate display values
            const pricePerUnit = Number(state.asset_b_amount) / Number(state.asset_a_amount);
            // This is a rough estimate, a real app might use a more precise round-to-time library
            const expiryText = `${Math.floor(Number(state.offer_expiry) / 973)}h left`; 

            return {
              appId: app.id,
              maker: state.maker as string,
              sellAssetId: state.asset_a_id as number,
              sellAmount: state.asset_a_amount as number,
              buyAssetId: state.asset_b_id as number,
              buyAmount: state.asset_b_amount as number,
              pricePerUnit: pricePerUnit,
              expiryText: expiryText,
            };
          })
          .filter((offer): offer is Offer => offer !== null); // Remove nulls from the list

        setOffers(processedOffers);
      } catch (error) {
        console.error("Failed to fetch offers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const handleAcceptOffer = (appId: number) => {
    alert(`Accepting Offer from App ID: ${appId} (Logic to be implemented)`);
  };

  return (
    <div className="bg-[#1a202c] p-6 rounded-lg border border-gray-700 w-full max-w-2xl ml-8">
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">BROWSE PUBLIC OFFERS</h2>
      {loading ? (
        <p>Loading offers...</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="p-2">MAKER</th>
              <th className="p-2">SELL</th>
              <th className="p-2">BUY</th>
              <th className="p-2">PRICE/UNIT</th>
              <th className="p-2">EXPIRY</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.appId} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="p-2 font-mono text-sm">{`${offer.maker.substring(0,4)}...${offer.maker.slice(-4)}`}</td>
                <td className="p-2">{`${offer.sellAmount} ASA ${offer.sellAssetId}`}</td>
                <td className="p-2">{`${offer.buyAmount} ASA ${offer.buyAssetId}`}</td>
                <td className="p-2">{offer.pricePerUnit.toFixed(4)}</td>
                <td className="p-2">{offer.expiryText}</td>
                <td className="p-2">
                  <button 
                    onClick={() => handleAcceptOffer(offer.appId)}
                    className="bg-gray-600 hover:bg-cyan-500 text-white font-bold py-1 px-3 rounded text-sm transition-colors"
                  >
                    ACCEPT
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default BrowseOffers;