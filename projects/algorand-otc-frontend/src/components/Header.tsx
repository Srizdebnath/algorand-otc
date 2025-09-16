import React, { useState, useEffect } from "react";
import { peraWallet } from "../perawallet"; // Import our instance

function Header() {
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const isConnected = !!accountAddress;

  useEffect(() => {
    // Reconnect to the session when the component mounts
    peraWallet
      .reconnectSession()
      .then((accounts) => {
        // Setup disconnect event listener
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);

        if (accounts.length) {
          setAccountAddress(accounts[0]);
        }
      })
      .catch((e) => console.log(e));

    // Cleanup the event listener when the component unmounts
    return () => {
      peraWallet.connector?.removeAllListeners();
    };
  }, []);

  const handleConnectWalletClick = () => {
    peraWallet
      .connect()
      .then((newAccounts) => {
        // Setup the disconnect event listener
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);
        setAccountAddress(newAccounts[0]);
      })
      .catch((error) => {
        // Handle the case where the user closes the connection modal
        if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
          console.log(error);
        }
      });
  };

  const handleDisconnectWalletClick = () => {
    peraWallet.disconnect();
    setAccountAddress(null);
  };

  return (
    <header className="p-4 bg-gray-800 text-white flex justify-between items-center">
      <h1 className="text-2xl font-bold">OTC Swap dApp</h1>
      <div>
        {isConnected ? (
          <div className="flex items-center">
            <span className="mr-4 font-mono bg-gray-700 p-2 rounded">
              {/* Display truncated address */}
              {`${accountAddress.substring(0, 5)}...${accountAddress.substring(
                accountAddress.length - 5
              )}`}
            </span>
            <button
              onClick={handleDisconnectWalletClick}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnectWalletClick}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;