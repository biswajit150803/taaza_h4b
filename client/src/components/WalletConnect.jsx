import React from "react";
import { useWallet } from "../context/WalletContext";

const WalletConnect = () => {
  const { walletAddress, connectWallet } = useWallet();

  return (
    <div className="flex items-center gap-3">
      {walletAddress ? (
        <span className="text-sm text-green-700 font-mono">
          Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </span>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-green-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-green-700 transition"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default WalletConnect;
