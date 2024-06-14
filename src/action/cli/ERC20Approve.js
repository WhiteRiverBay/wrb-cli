import { ethers } from 'ethers';
import { getProvider } from '../../util/web3util.js';
// ERC20_ABI
import { ERC20_ABI } from '../../util/abi.js';
import prompt from 'prompt-sync';

export const ERC20Approve = async (options) => {
    const { to, contract, rpc, amount } = options;
    const provider = getProvider(rpc);

    const  wallet = new ethers.Wallet(options.privateKey, provider);
    const _contract = new ethers.Contract(contract, ERC20_ABI, wallet);
    const decimals = await _contract.decimals();

    let _amount = amount;
    if (amount) {
        _amount = ethers.parseUnits(amount, decimals);
        console.log('Approve:', ethers.formatUnits(_amount, decimals));
    } else {
        _amount = ethers.MaxUint256;
        console.log('Approve MaxUint256');
    }

    if (!options.yes) {
        console.log(`Approve ${to} ${ethers.formatUnits(_amount, decimals)}?`);
        const yes = prompt()('Continue? [y/N] ');
        if (yes !== 'y') {
            return;
        }
    }

    const tx = await _contract.approve(to, _amount);
    console.log(tx.hash);
    if (!options.async) {
        tx.wait();
    }
}