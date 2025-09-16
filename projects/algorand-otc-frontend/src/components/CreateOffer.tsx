import React, { useState } from 'react';

// We will pass the connected account address as a prop
interface CreateOfferProps {
  accountAddress: string;
}

function CreateOffer({ accountAddress }: CreateOfferProps) {
  const [sellAssetId, setSellAssetId] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [buyAssetId, setBuyAssetId] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [expiration, setExpiration] = useState('24'); // Default to 24 hours
  const [isPrivate, setIsPrivate] = useState(false);
  const [privateTaker, setPrivateTaker] = useState('');

  const handleCreateOffer = () => {
    // We will implement the transaction logic here in the next step
    alert('Creating offer... (logic to be implemented)');
    console.log({
      sellAssetId,
      sellAmount,
      buyAssetId,
      buyAmount,
      expiration,
      isPrivate,
      privateTaker,
      creator: accountAddress
    });
  };

  return (
    <div className="bg-[#1a202c] p-6 rounded-lg border border-gray-700 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">CREATE NEW OFFER</h2>
      
      <div className="space-y-4">
        <input
          type="number"
          placeholder="SELL: ASA ID"
          value={sellAssetId}
          onChange={(e) => setSellAssetId(e.target.value)}
          className="w-full bg-gray-800 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <input
          type="number"
          placeholder="QUANTITY (Sell Amount)"
          value={sellAmount}
          onChange={(e) => setSellAmount(e.target.value)}
          className="w-full bg-gray-800 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <input
          type="number"
          placeholder="BUY: ASA ID"
          value={buyAssetId}
          onChange={(e) => setBuyAssetId(e.target.value)}
          className="w-full bg-gray-800 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <input
          type="number"
          placeholder="QUANTITY (Buy Amount)"
          value={buyAmount}
          onChange={(e) => setBuyAmount(e.target.value)}
          className="w-full bg-gray-800 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        
        <select 
          value={expiration} 
          onChange={(e) => setExpiration(e.target.value)}
          className="w-full bg-gray-800 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="1">1 Hour</option>
          <option value="24">24 Hours</option>
          <option value="168">7 Days</option>
        </select>

        <div className="flex items-center justify-between">
          <label htmlFor="private-trade" className="text-gray-400">PRIVATE TRADE</label>
          <div 
            onClick={() => setIsPrivate(!isPrivate)}
            className={`w-14 h-8 flex items-center bg-gray-700 rounded-full p-1 cursor-pointer transition-colors ${isPrivate ? 'bg-cyan-500' : ''}`}
          >
            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${isPrivate ? 'translate-x-6' : ''}`}></div>
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
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 px-4 rounded transition-colors"
        >
          DEPOSIT & CREATE OFFER
        </button>
      </div>
    </div>
  );
}

export default CreateOffer;