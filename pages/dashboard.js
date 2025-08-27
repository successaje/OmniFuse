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
  const { isConnected, address } = useAccount(); // ✅ now inside component
  const [transactions, setTransactions] = useState([]);

  /////////////////////////////////////////////////////////////////////////////////////

  // alchemy avax data helper function
  const mapAlchemyTransfers = (alchemyTransfers, userAddress) => {
    return alchemyTransfers.map((tx, i) => ({
      id: tx.hash || i,
      type:
        tx.from.toLowerCase() ===
        "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266".toLowerCase()
          ? "send"
          : "receive",
      asset: tx.asset || "AVAX",
      amount: tx.value || 0,
      timestamp: Date.now(),
      status: "success", // assume success if it's in transfers
      explorerUrl: `https://testnet.snowtrace.io/tx/${tx.hash}`, // block explorer link
      chain: "Avalanche Fuji", // your chain label
      chainIcon: "/logos/avax-logo.png", // your chain icon
      icon: "/logos/avax-logo.png", // token icon placeholder
      address: tx.from || "",
    }));
  };

  /////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (!isConnected || !address) return;

    const fetchTxs = async () => {
      const avaxData = await avaxAlchemy.core.getAssetTransfers({
        fromAddress: address, // ✅ no {address} object, just the string
        category: ["external"],
        order: "desc",
        maxCount: 20,
      });

      const mapped = mapAlchemyTransfers(avaxData.transfers);
      setTransactions(mapped);
      // setTransactions(avaxData.transfers);
      console.log(avaxData.transfers);
    };

    fetchTxs();
  }, [isConnected, address]);

  return (
    <div>
      {/* <NavBar /> */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold font-orbitron">Recent Transactions</h3>
        <div className="bg-[var(--card-bg)] rounded-2xl border border-[#23272F]/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Asset
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Chain
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Time
                  </th>
                  <th scope="col" className="relative px-4 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {transactions && transactions.length > 0 ? (
                  transactions.slice(0, 10).map((tx) => {
                    const isSend = tx.type;   // this might throw an error
                    const amount = parseFloat(tx.amount).toFixed(4);
                    // const timeAgo = formatTimeAgo(tx.timestamp);
                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-gray-750 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                isSend
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-green-500/20 text-green-400"
                              }`}
                            >
                              {isSend ? "↑" : "↓"}
                            </div>
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-100 capitalize">
                                {isSend ? "Sent" : "Received"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-6 w-6 rounded-full"
                              src={tx.icon}
                              alt={tx.asset}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/logos/ethereum-eth-logo.png";
                              }}
                            />
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-100">
                                {tx.asset}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div
                            className={`text-sm font-medium ${
                              isSend ? "text-red-400" : "text-green-400"
                            }`}
                          >
                            {isSend ? "-" : "+"}
                            {amount} {tx.asset}
                          </div>
                          <div className="text-xs text-gray-400">
                            ${(amount * 1).toFixed(2)} USD
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-5 w-5 rounded-full mr-2"
                              src={tx.chainIcon}
                              alt={tx.chain}
                            />
                            <span className="text-sm text-gray-200">
                              {tx.chain}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                              tx.status === "success"
                                ? "bg-green-900/50 text-green-300"
                                : "bg-red-900/50 text-red-300"
                            }`}
                          >
                            {tx.status === "success" ? "Confirmed" : "Failed"}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 whitespace-nowrap text-sm text-gray-300"
                          title={new Date(tx.timestamp).toLocaleString()}
                        >
                          {tx.timestamp}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <a
                            href={tx.explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 flex items-center justify-end"
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-8 text-center text-[var(--text-muted)]"
                    >
                      <p>No transaction</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
