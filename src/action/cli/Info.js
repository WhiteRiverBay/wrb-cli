import { ethers } from 'ethers';
import { getProvider } from '../../util/web3util.js';
import { ERC20_ABI, ERC721_ABI } from '../../util/abi.js';

export const Info = async (options) => {
    const { rpc, type, address, contract, id, uri, original, nonce, balance } = options;
    const provider = getProvider(rpc);

    if (type === 'address') {
        _AddressInfo(provider, options);
    } else if (type === 'erc20') {
        _ERC20Info(provider, options);
    } else if (type === 'nft') {
        _NFTInfo(provider, options);
    }
}

const _ERC20Info = async (provider, options) => {
    // token name
    const _contract = new ethers.Contract(options.contract, ERC20_ABI, provider);
    const out = {}
    
    // symbol
    out.symbol = await _contract.symbol();
    out.decimals = await _contract.decimals();
    // total supply
    const totalSupply = await _contract.totalSupply();
    out.totalSupply = ethers.formatUnits(totalSupply, await _contract.decimals());
    // balance of address (if address is provided)
    if (options.address) {
        const tokenBalance = await _contract.balanceOf(options.address);
        out.tokenBalance = ethers.formatUnits(tokenBalance, out.decimals) + ' ' + out.symbol;
        
        const balance = await provider.getBalance(options.address);
        out.balance = ethers.formatEther(balance) + ' ETH';
    }

    if (options.format === 'json') {
        console.log(JSON.stringify(out));
    } else {
        console.table(out);
    }
}

const _AddressInfo = async (provider, options) => {
    // balance
    const out = {};
    const balance = await provider.getBalance(options.address);
    out.balance = ethers.formatEther(balance) + ' ETH';
    // nonce
    out.nonce = await provider.getTransactionCount(options.address);
    // token balance if contract address is provided
    if (options.contract) {
        const _contract = new ethers.Contract(options.contract, ERC20_ABI, provider);
        const tokenBalance = await _contract.balanceOf(options.address);
        out.tokenBalance = ethers.formatUnits(tokenBalance, await _contract.decimals()) + ' ' + await _contract.symbol();
        
    }
    // is it contract
    const code = await provider.getCode(options.address);
    out.isContract = code.length > 2;
    // if contract, get contract name and symbol
    if (out.isContract) {
        const _contract = new ethers.Contract(options.address, ERC20_ABI, provider);
        out.symbol = await _contract.symbol();
        out.name = await _contract.name();
    }

    if (options.format === 'json') {
        console.log(JSON.stringify(out, null, 2));
    } else {
        console.table(out);
    }
}

const _NFTInfo = async (provider, options) => {
    // name
    const out = {};
    const _contract = new ethers.Contract(options.contract, ERC721_ABI, provider);
    out.symbol = await _contract.symbol();
    out.totalSupply = await _contract.totalSupply();
    if (options.id) {
        out.owner = await _contract.ownerOf(options.id);
        const tokenUri = await _contract.tokenURI(options.id);
        if (options.uri) {
            // TODO is base64 ? decode
            out.uri = tokenUri
        }
        if (options.original) {
            out.original = tokenUri;
        }
    } else {
        // if only address and contract is provided, it will get balance of address, and iterate through all nft tokens
        if (options.address) {
            // for 
            const balance = await _contract.balanceOf(options.address);
            out.balance = balance;
            if (balance > 0) {
                const tokens = [];
                for (let i = 0; i < balance; i++) {
                    const id = await _contract.tokenOfOwnerByIndex(options.address, i);
                    tokens.push(id);
                }
                // sort tokens
                out.tokens = tokens.join(',');
            }
        }
    }

    if (options.format === 'json') {
        console.log(JSON.stringify(out, null, 2));
    } else {
        console.table(out);
    }

}

// export {
//     Info
// };