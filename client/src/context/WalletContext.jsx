import { createContext, useContext, useEffect, useState } from "react";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);

  const connectWallet = async () => {
    if (!window.aptos) {
      alert("Please install the Petra wallet extension.");
      return null;
    }

    try {
      await window.aptos.connect();
      const account = await window.aptos.account();
      setWalletAddress(account.address);
      return account.address;
    } catch (error) {
      console.error("Wallet connection failed:", error);
      return null;
    }
  };

  useEffect(() => {
    const autoConnect = async () => {
      try {
        const account = await window.aptos?.account?.();
        if (account?.address) {
          setWalletAddress(account.address);
        }
      } catch (err) {
        console.log("Auto-connect failed", err);
      }
    };
    autoConnect();
  }, []);

  return (
    <WalletContext.Provider value={{ walletAddress, connectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
