import { useEffect, useState } from "react";
import { Alchemy, Network } from "alchemy-sdk";
import { useAccount } from "wagmi";
import NavBar from "../components/NavBar";

const avaxConfig = {
  apiKey: "pbkka3X51DqfysHMD4UZ3yYxD6jhBgOe",
  network: Network.AVAX_FUJI,
};
const avaxAlchemy = new Alchemy(avaxConfig);

export default function TransactionsFetcher() {
  const { isConnected, address } = useAccount();  // ✅ now inside component
  const [transactions, setTransactions] = useState([]);

  /////////////////////////////////////////////////////////////////////////////////////

  // alchemy avax data helper function
  const mapAlchemyTransfers = (alchemyTransfers, userAddress) => {
    return alchemyTransfers.map((tx, i) => ({
      id: tx.hash || i,
      type: tx.from.toLowerCase() === "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266".toLowerCase()
        ? "send"
        : "receive",                          
      asset: tx.asset || "AVAX",              
      amount: tx.value || 0,                  
      timestamp: Date.now(),            
      status: "success",                      // assume success if it's in transfers
      explorerUrl: `https://testnet.snowtrace.io/tx/${tx.hash}`,  // block explorer link
      chain: "Avalanche Fuji",                // your chain label
      chainIcon: "/logos/avax-logo.png",      // your chain icon
      icon: "/logos/avax-logo.png",           // token icon placeholder
    }));
  };

  /////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (!isConnected || !address) return;

    const fetchTxs = async () => {
      const avaxData = await avaxAlchemy.core.getAssetTransfers({
        fromAddress: address,   // ✅ no {address} object, just the string
        category: ["external"],
        order: "desc",
        maxCount: 20,
      });

      
      setTransactions(avaxData.transfers);
      console.log(avaxData.transfers);
    };

    fetchTxs();
  }, [isConnected, address]);

  return (
    <div>
      <NavBar />
      {transactions.length > 0 ? (
        <ul>
          {transactions.map((tx) => (
            <li key={tx.hash}>
              {tx.asset} {tx.value} → {tx.to}
            </li>
          ))}
        </ul>
      ) : (
        <p>No transactions yet.</p>
      )}
    </div>
  );
}
