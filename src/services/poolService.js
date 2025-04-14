import { ethers } from 'ethers';
import { FACTORY_ABI, POOL_ABI, ERC20_ABI } from '../config/abis.js';
import { UNISWAP_V3_FACTORY, WETH_ADDRESS } from '../config/constants.js';
import { getPriceFromTick } from '../utils/calculations.js';

export async function getPoolInfo(tokenAddress, fee, provider) {
  try {
    const factoryContract = new ethers.Contract(UNISWAP_V3_FACTORY, FACTORY_ABI, provider);
    
    // Get pool address
    const poolAddress = await factoryContract.getPool(tokenAddress, WETH_ADDRESS, fee);
    
    if (poolAddress === ethers.constants.AddressZero) {
      // Try reverse order
      const reversePoolAddress = await factoryContract.getPool(WETH_ADDRESS, tokenAddress, fee);
      
      if (reversePoolAddress === ethers.constants.AddressZero) {
        return null; // No pool found
      }
      
      return fetchPoolDetails(reversePoolAddress, tokenAddress, fee, provider);
    }
    
    return fetchPoolDetails(poolAddress, tokenAddress, fee, provider);
  } catch (error) {
    console.error(`Error getting pool: ${error.message}`);
    return null;
  }
}

async function fetchPoolDetails(poolAddress, tokenAddress, fee, provider) {
  try {
    const poolContract = new ethers.Contract(poolAddress, POOL_ABI, provider);
    
    // Get pool data
    const token0 = await poolContract.token0();
    const token1 = await poolContract.token1();
    const slot0 = await poolContract.slot0();
    const liquidity = await poolContract.liquidity();
    
    // Get token details
    const token0Contract = new ethers.Contract(token0, ERC20_ABI, provider);
    const token1Contract = new ethers.Contract(token1, ERC20_ABI, provider);
    
    const symbol0 = await token0Contract.symbol();
    const symbol1 = await token1Contract.symbol();
    const decimals0 = await token0Contract.decimals();
    const decimals1 = await token1Contract.decimals();
    
    const tick = slot0.tick;
    
    // Is our token token0 or token1?
    const tokenIsToken0 = token0.toLowerCase() === tokenAddress.toLowerCase();
    let price, uniswapFormat;
    
    if (tokenIsToken0) {
      // Token is token0
      price = getPriceFromTick(tick, decimals0, decimals1);
      
      // Calculate tokens per ETH
      if (token1.toLowerCase() === WETH_ADDRESS.toLowerCase()) {
        uniswapFormat = 1 / price;
      }
    } else {
      // Token is token1
      price = 1 / getPriceFromTick(tick, decimals0, decimals1);
      
      // Calculate tokens per ETH
      if (token0.toLowerCase() === WETH_ADDRESS.toLowerCase()) {
        uniswapFormat = price;
      }
    }
    
    return {
      address: poolAddress,
      fee,
      liquidity: liquidity.toString(),
      tick,
      token0,
      token1,
      symbol0,
      symbol1,
      decimals0,
      decimals1,
      tokenIsToken0,
      price,
      uniswapFormat: uniswapFormat.toLocaleString('en-US', {maximumFractionDigits: 2})
    };
  } catch (error) {
    console.error(`Error fetching pool details: ${error.message}`);
    return null;
  }
}