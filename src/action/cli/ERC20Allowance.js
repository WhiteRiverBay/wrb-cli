import {ethers} from 'ethers';
import { getProvider } from '../../util/web3util.js';
// ERC20_ABI
import { ERC20_ABI } from '../../util/abi.js';

export const ERC20Allowance = async (options) => {
    const {address, to, contract, rpc} = options;
    const provider = getProvider(rpc);
    const _contract = new ethers.Contract(contract, ERC20_ABI, provider);
    const allowance = await _contract.allowance(address, to);
    console.log(allowance.toString());
}