import React, { useState, useEffect, useCallback } from 'react';
import { peraWallet } from './perawallet';
import Header from './components/Header';
import CreateOffer from './components/CreateOffer';
import BrowseOffers from './components/BrowseOffers';
import LandingPage from './components/LandingPage'; // Import our new landing page
import Sidebar from './components/Sidebar'; 

function App() {
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const isConnected = !!accountAddress;

  // --- Wallet Logic now lives in the main App component ---
  const handleDisconnectWalletClick = useCallback(() => {
    peraWallet.disconnect();
    setAccountAddress(null);
  }, []);

  const handleConnectWalletClick = useCallback(() => {
    peraWallet.connect()
      .then((newAccounts) => {
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);
        setAccountAddress(newAccounts[0]);
      })
      .catch((error) => {
        if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
          console.log(error);
        }
      });
  }, [handleDisconnectWalletClick]);

  useEffect(() => {
    peraWallet.reconnectSession()
      .then((accounts) => {
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);
        if (accounts.length) {
          setAccountAddress(accounts[0]);
        }
      })
      .catch((e) => console.log(e));
    
    return () => {
      peraWallet.connector?.off("disconnect", handleDisconnectWalletClick);
    };
  }, [handleDisconnectWalletClick]);
  // --- End of Wallet Logic ---

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Header accountAddress={accountAddress} onDisconnect={handleDisconnectWalletClick} />
      
      <div className={isConnected ? "app-grid" : ""}>
        {isConnected ? (
          <>
            <Sidebar />
            <main className="p-8">
              <div className="flex flex-wrap justify-center gap-8">
                <CreateOffer accountAddress={accountAddress} />
                <BrowseOffers accountAddress={accountAddress} />
              </div>
            </main>
          </>
        ) : (
          <main className="p-8 mt-10">
            <LandingPage onConnect={handleConnectWalletClick} />
          </main>
        )}
      </div>
    </div>
  );
}

export default App;