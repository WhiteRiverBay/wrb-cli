import { ethers } from 'ethers';
import { getProvider } from '../../util/web3util.js';
import { BATCH_TRANSFER_ABI, ERC20_ABI } from '../../util/abi.js';
import prompt from 'prompt-sync';
import fs from 'fs';

const BATCH_COUNT = 200;

export const Airdrop = async (options) => {
    const { rpc, privateKey, file, contract, gasOnly, nonce, yes } = options;
    const provider = getProvider(rpc);
    const wallet = new ethers.Wallet(privateKey, provider);
    // log address
    console.log('From Address:', wallet.address);
    // address balance
    const balance = await provider.getBalance(wallet.address);
    console.log('Balance:', ethers.formatEther(balance) + ' ETH');

    let symbol = 'ETH'
    let decimals = 18
    let tokenBalance = BigInt(0)

    // if contract is provided, get token balance
    if (contract) {
        const _contract = new ethers.Contract(contract, ERC20_ABI, provider);
        tokenBalance = await _contract.balanceOf(wallet.address);

        symbol = await _contract.symbol();
        decimals = await _contract.decimals();

        console.log('Token Balance:', ethers.formatUnits(tokenBalance, decimals) + ' ' + symbol);
    }
    // count address amount
    const data = fs.readFileSync(file, 'utf8');
    const lines = data.split('\n');
    const addresses = [];
    const amounts = [];
    for (const line of lines) {
        const parts = line.split(/\s+/);
        if (parts.length !== 2) {
            continue;
        }
        addresses.push(parts[0].trim());
        amounts.push(ethers.parseUnits(parts[1].trim(), decimals));
    }
    // console total
    console.log('Total Addresses:', addresses.length);
    // total amount
    let _totalAmount = BigInt(0);
    for (let i = 0; i < amounts.length; i++) {
        _totalAmount += amounts[i];
    }

    console.log('Total Amount Required:', ethers.formatUnits(_totalAmount, decimals) + ' ' + symbol);

    // estimate gas
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice
    // gas price is
    console.log('Gas Price:', ethers.formatUnits(gasPrice, 'gwei') + ' gwei');

    const _addressInBatch = addresses.slice(0, BATCH_COUNT);
    const _amountInBatch = amounts.slice(0, BATCH_COUNT);

    const _contract = new ethers.Contract(options.batchTransferContract, BATCH_TRANSFER_ABI, wallet);


    const gasEstimate = contract ?
        await _contract.airdropToken.estimateGas(contract, _addressInBatch, _amountInBatch, { gasPrice })
        : await _contract.airdropCoin.estimateGas(_addressInBatch, _amountInBatch, { gasPrice, value: _totalAmount });

    console.log('Gas Estimate:', gasEstimate.toString());

    // total gas
    const eatchGas = gasEstimate * gasPrice;
    console.log('Each transaction cost Gas:', ethers.formatEther(eatchGas) + ' ETH');
    // total 
    const batches = Math.ceil(addresses.length / BATCH_COUNT);
    console.log(`Total transactions: ${batches}`)
    const totalGas = eatchGas * BigInt(batches);
    console.log('Total Gas:', ethers.formatEther(totalGas) + ' ETH');

    // if gasOnly is true, only get gas estimate, stop right here
    if (gasOnly) {
        return;
    }

    // if totalGas is more than balance
    if (totalGas > balance) {
        console.log('Insufficient balance to pay for gas');
        return;
    }

    // if nonce is provided
    const _nonce = nonce ? nonce : await provider.getTransactionCount(wallet.address);
    console.log('Nonce:', _nonce);

    // confirmation
    if (!options.yes) {
        console.log('Are you sure to do the Airdrop ?');
        const yes = prompt()('Continue? [y/N] ');
        if (yes !== 'y') {
            return;
        }
    }

    // batch transfer
    for (let i = 0; i < batches; i++) {
        const _addressInBatch = addresses.slice(i * BATCH_COUNT, (i + 1) * BATCH_COUNT);
        const _amountInBatch = amounts.slice(i * BATCH_COUNT, (i + 1) * BATCH_COUNT);
        const _theNonce = await provider.getTransactionCount(wallet.address);
        console.log('Batch:', i + 1, 'Addresses:', _addressInBatch.length);

        const _batchTotalAmount = _amountInBatch.reduce((a, b) => a + b, BigInt(0));
        console.log('Batch Total:', ethers.formatUnits(_batchTotalAmount, decimals) + ' ' + symbol);

        const _batchGasLimit = contract ?
            await _contract.airdropToken.estimateGas(contract, _addressInBatch, _amountInBatch, { gasPrice })
            : await _contract.airdropCoin.estimateGas(_addressInBatch, _amountInBatch, { gasPrice, value: _batchTotalAmount });

        if (contract) {
            const tx = await _contract.airdropToken(contract, _addressInBatch, _amountInBatch, {
                gasPrice,
                nonce: _theNonce,
                gasLimit: _batchGasLimit
            });
            console.log('Transaction Hash:', tx.hash);
            await tx.wait();
        } else {
            const tx = await _contract.airdropCoin(_addressInBatch, _amountInBatch, {
                gasPrice,
                nonce: _theNonce,
                gasLimit: _batchGasLimit,
                value: _batchTotalAmount
            });
            console.log('Transaction Hash:', tx.hash);
            await tx.wait();
        }
    }

    console.log('Done');
}
