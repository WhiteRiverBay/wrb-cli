import { ethers } from 'ethers';
// ABI
import { ERC20_ABI, ERC721_ABI } from '../../util/abi.js';
import { getProvider } from '../../util/web3util.js';
import prompt from 'prompt-sync';

export const Transfer = async (options) => {
    const {
        type,
        rpc,
        privateKey,
        gasOnly,
    } = options;

    const provider = getProvider(rpc);
    const wallet = new ethers.Wallet(privateKey, provider);

    // const feeData = await provider.getFeeData();
    // options.gasPrice = options.gasPrice ? ethers.parseUnits(options.gasPrice, 'gwei') : await feeData.gasPrice;
    options.gasPrice = options.gasPrice ? ethers.parseUnits(options.gasPrice, 'gwei')
         : await provider.getFeeData().then(feeData => feeData.gasPrice);
    console.log(`Gas Price: ${ethers.formatUnits(options.gasPrice, 'gwei')} gwei`);

    if (type === 'erc20') {
        const _contract = new ethers.Contract(options.contract, ERC20_ABI, provider);
        const symbol = await _contract.symbol();

        // if gas limit is not provided, estimate gas
        if (options.gasLimit === undefined || options.gasLimit === null) {
            options.gasLimit = await _EstimateGasERC20Transfer(provider, options, wallet);
        } else {
            options.gasLimit = BigInt(options.gasLimit);
        }

        console.log(`Gas Limit: ${options.gasLimit}`);
        console.log(`Total GAS: ${ethers.formatUnits(options.gasPrice * options.gasLimit, 'ether')} ETH`);

        if (gasOnly) {
            return;
        }
        if (!options.yes) {
            console.log(`Transfer ${options.amount} ${symbol} to ${options.to} `);
            console.log('Are you sure to do the tranfer ?');
            const yes = prompt()('Continue? [y/N] ');
            if (yes !== 'y') {
                return;
            }
        }
        await _TransferERC20(provider,wallet, options);

    } else if (type === 'nft') {

        // if gas limit is not provided, estimate gas
        if (options.gasLimit === undefined || options.gasLimit === null) {
            options.gasLimit = await _EstimateGasNFTTransfer(provider, options, wallet);
        } else {
            options.gasLimit = BigInt(options.gasLimit);
        }

        console.log(`Gas Limit: ${options.gasLimit}`);
        console.log(`Total GAS: ${ethers.formatUnits(options.gasPrice * options.gasLimit, 'ether')} ETH`);

        if (gasOnly) {
            return;
        }
        if (!options.yes) {
            console.log(`Transfer NFT ${options.id} to ${options.to} `);
            console.log('Are you sure to do the tranfer ?');
            const yes = prompt()('Continue? [y/N] ');
            if (yes !== 'y') {
                return;
            }
        }
        await _TransferNFT(provider, wallet, options);

    } else {
        // if gas limit is not provided, estimate gas
        if (options.gasLimit === undefined || options.gasLimit === null) {
            options.gasLimit = await _EstimateGasEtherTransfer(provider, options, wallet);
        } else {
            options.gasLimit = BigInt(options.gasLimit);
        }

        console.log(`Gas Limit: ${options.gasLimit}`);
        console.log(`Total GAS: ${ethers.formatUnits(options.gasPrice * options.gasLimit, 'ether')} ETH`);
        // ethers
        if (gasOnly) {
            return;
        }
        // yes
        if (!options.yes) {
            console.log(`Transfer ${options.amount} ETH to ${options.to} `);
            console.log('Are you sure to do the tranfer ?');
            const yes = prompt()('Continue? [y/N] ');
            if (yes !== 'y') {
                return;
            }
        }
        await _TransferEther(provider, wallet, options);
    }
}

const _TransferERC20 = async (provider, wallet, options) => {
    const nonce = options.nonce ? parseInt(options.nonce) : await provider.getTransactionCount(wallet.address);
    const _contract = new ethers.Contract(options.contract, ERC20_ABI, wallet);
    const decimals = await _contract.decimals();
    const tx = await _contract.transfer(options.to, ethers.parseUnits(options.amount, decimals), { 
        nonce, 
        gasLimit: options.gasLimit, 
        gasPrice: options.gasPrice 
    });
    console.log('Transaction Hash:', tx.hash);
    if (!options.async) {
        await tx.wait();
    }
}


const _TransferEther = async (provider, wallet, options) => {
    const nonce = options.nonce ? parseInt(options.nonce) : await provider.getTransactionCount(wallet.address);
    const tx = await wallet.sendTransaction({
        to: options.to,
        value: ethers.parseEther(options.amount),
        nonce,
        gasLimit: options.gasLimit,
        gasPrice: options.gasPrice
    });
    console.log('Transaction Hash:', tx.hash);
    if (!options.async) {
        await tx.wait();
    }
}

const _TransferNFT = async (provider, wallet, options) => {
    const nonce = options.nonce ? parseInt(options.nonce) : await provider.getTransactionCount(wallet.address);
    const _contract = new ethers.Contract(options.contract, ERC721_ABI, wallet);
    const tx = await _contract.safeTransferFrom(wallet.address, options.to, options.id, { 
        nonce, 
        gasLimit: options.gasLimit, 
        gasPrice: options.gasPrice 
    });
    console.log('Transaction Hash:', tx.hash);
    if (!options.async) {
        await tx.wait();
    }
}

const _EstimateGasERC20Transfer = async (provider, options, wallet) => {
    const _contract = new ethers.Contract(options.contract, ERC20_ABI, wallet);
    const decimals = options.decimals || await _contract.decimals();
    const gasLimit = await _contract.transfer.estimateGas(options.to, ethers.parseUnits(options.amount, decimals));
    return gasLimit;
}

const _EstimateGasEtherTransfer = async (provider, options, wallet) => {
    const gasPrice = options.gasPrice;
    const gasLimit = await provider.estimateGas({
        from: wallet.address,
        to: options.to,
        value: ethers.parseEther(options.amount)
    });

    const totalGas = gasPrice * gasLimit;
    return gasLimit;
}

const _EstimateGasNFTTransfer = async (provider, options, wallet) => {
    const _contract = new ethers.Contract(options.contract, ERC721_ABI, wallet);
    const gasPrice = options.gasPrice;
    const gasLimit = await _contract.safeTransferFrom.estimateGas(wallet.address, options.to, options.id);
    const totalGas = gasPrice * gasLimit;
    return gasLimit;
}
