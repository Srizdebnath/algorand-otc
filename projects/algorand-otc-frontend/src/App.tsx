import { useState } from "react";
import Header from "./components/Header";
import CreateOffer from "./components/CreateOffer";

function App() {
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const isConnected = !!accountAddress;

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Header accountAddress={accountAddress} setAccountAddress={setAccountAddress} />
      
      <main className="p-8 flex justify-center">
        {isConnected ? (
          // If connected, show the Create Offer form
          <CreateOffer accountAddress={accountAddress} />
        ) : (
          // If not connected, show a message
          <h2 className="text-xl">
            Welcome to the OTC Platform. Connect your wallet to get started.
          </h2>
        )}
      </main>
    </div>
  );
}

export default App;