import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import WalletBox from "./WalletBox";
import { Wallet } from "lucide-react";

const MetaMaskAuth = () => {
    const [walletAddress, setWalletAddress] = useState(null);
    const [isWalletOpen, setIsWalletOpen] = useState(false);

    useEffect(() => {
        checkWalletConnection();
    }, []);

    const checkWalletConnection = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: "eth_accounts" });
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    console.log("✅ Wallet connected:", accounts[0]);
                }
            } catch (error) {
                console.error("Error checking wallet connection:", error);
            }
        }
    };

    const connectWallet = async () => {
        if (!window.ethereum) {
            toast.error("MetaMask is not installed! Please install it.");
            console.log("🚨 MetaMask is not detected");
            return;
        }

        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            setWalletAddress(accounts[0]);
            toast.success("✅ Wallet Connected!");
            console.log("Connected Wallet:", accounts[0]);
        } catch (error) {
            console.error("❌ Wallet connection failed", error);
        }
    };

    return (
        <div className="flex flex-col items-center">
            {walletAddress ? (
                <WalletBox 
                    walletAddress={walletAddress} 
                    isOpen={isWalletOpen} 
                    onToggle={() => setIsWalletOpen(!isWalletOpen)}
                />
            ) : (
                <>
                    <button 
                        onClick={connectWallet} 
                        className="flex items-center gap-2 p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        <Wallet className="w-5 h-5" />
                        Connect Wallet
                    </button>
                    <ToastContainer />
                </>
            )}
        </div>
    );
};

export default MetaMaskAuth;