import { useState } from "react";
import Header from "./components/Header";
import CreateOffer from "./components/CreateOffer";
import BrowseOffers from "./components/BrowseOffers";

function App() {
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const isConnected = !!accountAddress;
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Header accountAddress={accountAddress} setAccountAddress={setAccountAddress} />
      
      <main className="p-8">
        {isConnected ? (
          // 2. Use a flex container to show components side-by-side
          <div className="flex flex-wrap justify-center">
            <CreateOffer accountAddress={accountAddress} />
            <BrowseOffers />
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              Welcome to the Algorand OTC Platform
            </h2>
            <p className="text-gray-400 mt-2">Connect your wallet to create and accept offers.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;