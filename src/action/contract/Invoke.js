import { ethers } from 'ethers';
import fs from 'fs';
import { getProvider } from '../../util/web3util.js';
// prompt
import prompt from 'prompt-sync';

export const Invoke = async (options) => {

    const abiFile = options.abiFile;
    
    const provider = getProvider(options.rpc);
    const wallet = new ethers.Wallet(options.privateKey, provider);

    // feeData
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;

    if (abiFile) {
        const abiContent = fs.readFileSync(abiFile);
        const abi = JSON.parse(abiContent);
        const contract = new ethers.Contract(options.contract, abi, wallet);
        
        const method = options.method;
        console.log('method:', method);
        const args = options.args.split('|');
        console.log('args:', args)

        if (options.value) {
            console.log('value:', options.value + ' ETH');
        }

        const _args = [];
        for (let arg of args) {
            if (arg.startsWith('(')) {
                const _arg = arg.substring(1, arg.length - 1);
                const _argsArr = _arg.split(',');
                _args.push(_argsArr);
            } else if (arg.startsWith('[')) {
                const _arg = arg.substring(1, arg.length - 1);
                const _argsArr = _arg.split(',');
                _args.push(_argsArr);
            } else {
                _args.push(arg);
            }
                
        }
        const data = contract.interface.encodeFunctionData(method, _args);
        
        const nonce = await provider.getTransactionCount(wallet.address);
        const gasLimit = await contract[method].estimateGas(..._args);

        console.log(`nonce: ${nonce}`);
        console.log(`gasLimit: ${gasLimit}`);
        console.log(`gasPrice: ${ethers.formatUnits(gasPrice, 'gwei')} Gwei`);
        
        // gas total
        const gasTotal = gasLimit * gasPrice;
        console.log(`gasTotal: ${ethers.formatEther(gasTotal)} ETH`);

        if (options.gasOnly) {
            return;
        }

        if (!options.yes) {
            console.log('Are you sure to do the invoke ?');
            const yes = prompt()('Continue? [y/N] ');
            if (yes !== 'y') {
                return;
            }
        }

        const tx = {
            nonce: nonce,
            gasLimit: gasLimit,
            gasPrice: gasPrice,
            to: options.contract,
            value: options.value ? ethers.parseEther(options.value) : 0,
            data: data
        };

        // const signedTx = await wallet.signTransaction(tx);
        const txReceipt = await wallet.sendTransaction(tx);
        console.log(`txHash: ${txReceipt.hash}`);
        if (!options.async) {
            await txReceipt.wait();
        }

        return txReceipt;
    } else {
    }
}