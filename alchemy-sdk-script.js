import { Alchemy, Network } from "alchemy-sdk";

// avax configuration
const avaxConfig = {
  apiKey: "pbkka3X51DqfysHMD4UZ3yYxD6jhBgOe",
  network: Network.AVAX_FUJI,
  
};
// base configuration
// const baseConfig = {
//   apiKey: "pbkka3X51DqfysHMD4UZ3yYxD6jhBgOe",
//   network: Network.BASE_MAINNET,
// };

const avaxAlchemy = new Alchemy(avaxConfig);
// const baseAlchemy = new Alchemy(baseConfig);

export const avaxData = await avaxAlchemy.core.getAssetTransfers({
  fromBlock: "0x000000",
  fromAddress: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  category: ["external"],
  order: "desc",       
  maxCount: 20
});



// const baseData = await baseAlchemy.core.getAssetTransfers({
//   fromBlock: "0x000000",
//   fromAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
//   category: ["external"],
// });

console.log(avaxData.transfers);