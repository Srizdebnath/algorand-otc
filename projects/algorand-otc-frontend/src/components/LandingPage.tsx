import React from 'react';
import { ShieldCheckIcon, DocumentPlusIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

// This component receives the connect function as a prop
interface LandingPageProps {
  onConnect: () => void;
}

function LandingPage({ onConnect }: LandingPageProps) {
  return (
    <div className="text-center flex flex-col items-center max-w-4xl mx-auto">
      {/* Main Headline */}
      <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
          Secure, Trustless, Peer-to-Peer
        </span>
        <br />
        ASA Trading on Algorand.
      </h1>

      {/* Sub-headline */}
      <p className="mt-6 text-lg text-gray-400 max-w-2xl">
        Escape the risks of off-chain deals and high-slippage DEXs. Create private or public Over-the-Counter (OTC) offers executed atomically by a secure smart contract.
      </p>

      {/* Call-to-Action Button */}
      <div className="mt-8">
        <button
          onClick={onConnect}
          className="px-8 py-4 bg-cyan-500 text-black font-bold text-lg rounded-lg hover:bg-cyan-400 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-cyan-500/30"
        >
          Connect Wallet to Begin
        </button>
      </div>

      {/* Feature List */}
      <div className="mt-20 grid md:grid-cols-3 gap-12">
        <div className="flex flex-col items-center">
          <DocumentPlusIcon className="w-12 h-12 text-cyan-400 mb-4" />
          <h3 className="text-xl font-bold">Create Your Offer</h3>
          <p className="text-gray-400 mt-2">
            Define the exact assets and amounts you want to trade. Your terms, your rules.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <ShieldCheckIcon className="w-12 h-12 text-cyan-400 mb-4" />
          <h3 className="text-xl font-bold">Secure Escrow</h3>
          <p className="text-gray-400 mt-2">
            Your asset is locked in the smart contract, eliminating all counterparty risk.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <ArrowsRightLeftIcon className="w-12 h-12 text-cyan-400 mb-4" />
          <h3 className="text-xl font-bold">Atomic Swap</h3>
          <p className="text-gray-400 mt-2">
            The trade executes instantly and automatically when the other party fulfills their side.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;