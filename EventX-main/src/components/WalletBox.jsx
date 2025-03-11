import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet, DollarSign, Network, X } from "lucide-react";

function WalletBox({ walletAddress, isOpen, onToggle }) {
  const [balance, setBalance] = useState(0);
  const [network, setNetwork] = useState("");

  useEffect(() => {
    const fetchWalletDetails = async () => {
      if (!walletAddress) return;

      try {
        const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth");

        // ✅ Fetch Balance
        const balance = await provider.getBalance(walletAddress);
        setBalance(ethers.formatEther(balance));

        // ✅ Fetch Network Name
        const network = await provider.getNetwork();
        setNetwork(network.name.charAt(0).toUpperCase() + network.name.slice(1));

      } catch (error) {
        console.error("Error fetching wallet details:", error);
      }
    };

    fetchWalletDetails();
  }, [walletAddress]);

  // ✅ Shorten Wallet Address for Display
  const shortenAddress = (address) => address.slice(0, 6) + "..." + address.slice(-4);

  return (
    <div className="relative">
      {/* Small Wallet Preview (Click to Expand) */}
      <button 
        onClick={onToggle} 
        className="flex items-center gap-3 p-4 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition"
      >
        <Wallet className="w-6 h-6 text-indigo-600" />
        <div className="text-left">
          <p className="text-sm text-gray-500">Balance</p>
          <p className="text-lg font-semibold">{parseFloat(balance).toFixed(4)} ETH</p>
        </div>
      </button>

      {/* Full Wallet Details (Modal) */}
      {isOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md z-50"
          onClick={onToggle}
        >
          <div 
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={onToggle} 
              className="absolute top-4 right-4 bg-gray-200 text-gray-800 p-2 rounded-full hover:bg-gray-300"
            >
              <X size={18} />
            </button>

            {/* Wallet Details */}
            <div className="bg-indigo-600 p-6 text-white rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-6 h-6" />
                <h2 className="text-lg font-semibold">My Wallet</h2>
              </div>
              <div className="mt-4">
                <p className="text-sm text-indigo-200">Current Balance</p>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-6 h-6" />
                  <span className="text-3xl font-bold">
                    {parseFloat(balance).toFixed(4)} ETH
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Wallet Address</p>
                <p className="font-mono text-gray-800 break-all">{shortenAddress(walletAddress)}</p>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-gray-500">Network</p>
                </div>
                <span className="font-semibold text-gray-800">{network}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WalletBox;