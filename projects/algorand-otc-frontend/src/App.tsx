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
          <div className="flex flex-wrap justify-center">
            <CreateOffer accountAddress={accountAddress} />
            {/* MODIFIED LINE: Pass the user's address to BrowseOffers */}
            <BrowseOffers accountAddress={accountAddress} />
          </div>
        ) : (
          // ... rest of the file is the same
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