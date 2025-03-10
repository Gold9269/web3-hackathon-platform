import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import WalletBox from "./WalletBox";

import {ethers} from "ethers"

const MetaMaskAuth = () => {
    const [walletAddress, setWalletAddress] = useState(null);

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
            fetchUserData(accounts[0]); // Fetch or register/login user
        } catch (error) {
            console.error("❌ Wallet connection failed", error);
        }
    };

    const fetchUserData = async (walletAddress) => {
        try {
            const response = await fetch("http://localhost:3000/api/v1/user/metamask", {
                method: "POST",
                credentials:"include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ walletAddress }),
            });

            const result = await response.json();
            if (response.ok) {
                toast.success("🎉 User authenticated!");
                console.log("✅ User Data:", result);
            } else {
                toast.error("❌ Authentication failed!");
                console.error("Auth Error:", result.message);
            }
        } catch (error) {
            console.error("Error sending request to backend:", error);
        }
    };

    return (
        <div>
            {console.log(walletAddress)
            }
            {walletAddress?<WalletBox walletAddress={walletAddress}/>:
            <>
            <button 
                onClick={connectWallet} 
                className="p-2 m-2 border border-gray-700 hover:bg-indigo-800 hover:text-white rounded"
            >
               connected
            </button>
            <ToastContainer />
            </>
            }
        </div>
    );
};

export default MetaMaskAuth;


