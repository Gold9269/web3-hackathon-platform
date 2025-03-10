import React from 'react'
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet, ArrowUpRight, ArrowDownLeft, DollarSign } from 'lucide-react';


function WalletBox({walletAddress}) {
  
const [balance,setBalance] = useState(0);
  const [transactions,setTransactions] = useState([]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletAddress) return;

      try {
        const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth");
        const balance = await provider.getBalance(walletAddress);
        setBalance(ethers.formatEther(balance)); // ✅ `ethers.formatEther()` in v6

      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, [walletAddress]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!walletAddress) {
        console.error("Invalid Wallet Address:", walletAddress);
        return;
      }
  
      try {
        const response = await fetch(
          `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=IMVFBHKJVWVAP91NT8KS7FEAV2HAPWRI8Y`
        );
  
        // ✅ Ensure `data` is properly defined
        const data = await response.json();
        console.log("API Response:", data); // ✅ Debugging
  
        if (Array.isArray(data.result)) {
          setTransactions(data.result); // ✅ Store only if it's an array
        } else {
          console.error("Invalid transactions data:", data);
          setTransactions([]); // ✅ Prevent issues by setting an empty array
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setTransactions([]); // ✅ Ensure it's always an array
      }
    };
  
    fetchTransactions();
  }, [walletAddress]);
  

  return(
  <div className=" bg-gray-100 flex items-center justify-center p-0 mt-0">
  <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
    {/* Balance Section */}
    <div className="bg-indigo-600 p-6 text-white">
      <div className="flex items-center gap-2 mb-2">
        <Wallet className="w-6 h-6" />
        <h2 className="text-lg font-semibold">My Wallet</h2>
      </div>
      <div className="mt-4">
        <p className="text-sm text-indigo-200">Current Balance</p>
        <div className="flex items-center gap-1">
          <DollarSign className="w-6 h-6" />
          <span className="text-3xl font-bold">{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>

    {/* Transactions Section */}
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
      {/* <div className="space-y-4">
        {transactions.map(transaction => (
          <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                {transaction.type === 'credit' 
                  ? <ArrowDownLeft className="w-5 h-5 text-green-600" />
                  : <ArrowUpRight className="w-5 h-5 text-red-600" />
                }
              </div>
              <div>
                <p className="font-medium text-gray-800">{transaction.description}</p>
                <p className="text-sm text-gray-500">{transaction.date}</p>
              </div>
            </div>
            <span className={`font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
              {transaction.type === 'credit' ? '+' : '-'}${transaction.amount}
            </span>
          </div>
        ))}
      </div> */}
    </div>
  </div>
</div>
)
}

export default WalletBox;