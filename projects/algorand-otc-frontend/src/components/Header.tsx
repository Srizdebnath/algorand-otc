import React, { useState, useEffect, useCallback } from "react"; // Import useCallback
import { peraWallet } from "../perawallet";

interface HeaderProps {
  accountAddress: string | null;
  setAccountAddress: (address: string | null) => void;
}

function Header({ accountAddress, setAccountAddress }: HeaderProps) {
  const isConnected = !!accountAddress;

  // Wrap the disconnect handler in useCallback for stability
  const handleDisconnectWalletClick = useCallback(() => {
    peraWallet.disconnect();
    setAccountAddress(null);
  }, [setAccountAddress]);

  useEffect(() => {
    peraWallet
      .reconnectSession()
      .then((accounts) => {
        // Use the stable disconnect handler here
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);

        if (accounts.length) {
          setAccountAddress(accounts[0]);
        }
      })
      .catch((e) => console.log(e));

    // CORRECTED CLEANUP FUNCTION
    return () => {
      // Use .off() with the same arguments to remove the listener
      peraWallet.connector?.off("disconnect", handleDisconnectWalletClick);
    };
  }, [setAccountAddress, handleDisconnectWalletClick]); // Add the stable handler to dependencies

  const handleConnectWalletClick = () => {
    peraWallet
      .connect()
      .then((newAccounts) => {
        // Use the stable disconnect handler here as well
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);
        setAccountAddress(newAccounts[0]);
      })
      .catch((error) => {
        if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
          console.log(error);
        }
      });
  };

  return (
    <header className="p-4 bg-gray-800 text-white flex justify-between items-center">
      <h1 className="text-2xl font-bold">OTC Swap dApp</h1>
      <div>
        {isConnected ? (
          <div className="flex items-center">
            <span className="mr-4 font-mono bg-gray-700 p-2 rounded">
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