// Define the structure of an Offer, just like in our component
interface Offer {
    appId: number;
    maker: string;
    sellAssetId: number;
    sellAmount: number;
    buyAssetId: number; // We'll use 0 for ALGO and 31566704 for USDC
    buyAmount: number;
    pricePerUnit: number;
    expiryText: string;
  }
  
  // Create and export the array of dummy offers
  export const dummyOffers: Offer[] = [
    {
      appId: 1001,
      maker: "ALGOWHALE99",
      sellAssetId: 10458941, // GO-GOLD
      sellAmount: 1,
      buyAssetId: 31566704, // USDC
      buyAmount: 150,
      pricePerUnit: 150,
      expiryText: "10h left",
    },
    {
      appId: 1002,
      maker: "PackGuru",
      sellAssetId: 31566704, // USDC
      sellAmount: 150,
      buyAssetId: 811721479, // PAW
      buyAmount: 10000,
      pricePerUnit: 0.015,
      expiryText: "2d left",
    },
    {
      appId: 1003,
      maker: "ASA_Trader",
      sellAssetId: 0, // ALGO
      sellAmount: 2500,
      buyAssetId: 31566704, // USDC
      buyAmount: 500,
      pricePerUnit: 0.2,
      expiryText: "1d left",
    },
    {
      appId: 1004,
      maker: "HEADLINE",
      sellAssetId: 137594422, // HDL
      sellAmount: 2500,
      buyAssetId: 0, // ALGO
      buyAmount: 3000,
      pricePerUnit: 1.2,
      expiryText: "1h left",
    },
  ];