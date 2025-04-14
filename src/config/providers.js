import { ethers } from 'ethers';

const providerUrls = [
  'https://geth-geth.ede2390e1937cf50.dyndns.dappnode.io',
  'https://eth-mainnet.public.blastapi.io',
  'https://rpc.ankr.com/eth',
  'https://ethereum.publicnode.com'
];

export async function getProvider() {
  for (const url of providerUrls) {
    try {
      const provider = new ethers.providers.JsonRpcProvider(url);
      // Test the provider with a simple call
      await provider.getBlockNumber();
      console.log(`Connected to provider: ${url}`);
      return provider;
    } catch (error) {
      console.log(`Provider ${url} failed: ${error.message}`);
    }
  }
  throw new Error('All providers failed');
}