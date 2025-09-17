import React, { useState } from 'react';

interface CreateOfferProps {
  accountAddress: string;
}

function CreateOffer({ accountAddress }: CreateOfferProps) {
  // State is now simplified and clearly named for a sell offer
  const [sellAsaId, setSellAsaId] = useState('');
  const [sellAsaAmount, setSellAsaAmount] = useState('');
  const [receiveAlgoAmount, setReceiveAlgoAmount] = useState('');

  // Other state remains the same
  const [expiration, setExpiration] = useState('24');
  const [isPrivate, setIsPrivate] = useState(false);
  const [privateTaker, setPrivateTaker] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleCreateOffer = async () => {
    if (!accountAddress) {
      setFeedback('Please connect your wallet first.');
      return;
    }
    if (!sellAsaId || !sellAsaAmount || !receiveAlgoAmount) {
      setFeedback('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setFeedback('Sending transaction to the network...');

    // --- DEMO SIMULATION LOGIC ---
    setTimeout(() => {
      const fakeTxnId = `F_${Math.random().toString(36).substring(2).toUpperCase()}`;
      setFeedback(`Sell offer created successfully! TxID: ${fakeTxnId}`);
      setLoading(false);

      console.log({
        action: "User creates a SELL offer",
        assetToSell: Number(sellAsaId),
        amountToSell: Number(sellAsaAmount),
        assetToBuy: 0, // 0 is ALGO
        amountToBuy: Number(receiveAlgoAmount),
      });

    }, 2500);
  };

  return (
    <div className="bg-[#1a202c] p-6 rounded-lg border border-gray-700 w-full max-w-md">
      {/* Title is now more specific */}
      <h2 className="text-2xl font-bold mb-6 text-cyan-400">CREATE SELL OFFER</h2>
      
      {/* The toggle is completely removed */}

      <div className="space-y-4">
        {/* Inputs are now static and clear */}
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

        {/* --- Private Trade and Button (logic unchanged) --- */}
        <div className="flex items-center justify-between pt-2">
            <label className="text-gray-400">PRIVATE TRADE</label>
            <div onClick={() => setIsPrivate(!isPrivate)} className={`w-14 h-8 flex items-center bg-gray-700 rounded-full p-1 cursor-pointer transition-colors ${isPrivate ? 'bg-cyan-500' : ''}`}>
                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${isPrivate ? 'translate-x-6' : ''}`}></div>
            </div>
        </div>
        {isPrivate && (<input type="text" placeholder="Private Taker Address" value={privateTaker} onChange={(e) => setPrivateTaker(e.target.value)} className="w-full bg-gray-800 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />)}
        
        <button
          onClick={handleCreateOffer}
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 px-4 rounded transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed !mt-6"
        >
          {loading ? 'Processing...' : 'DEPOSIT & CREATE OFFER'}
        </button>

        {feedback && <p className="mt-4 text-center text-sm text-gray-400 break-all">{feedback}</p>}
      </div>
    </div>
  );
}

export default CreateOffer;