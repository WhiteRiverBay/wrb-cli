import { ethers } from 'ethers';
import { getProvider } from '../../util/web3util.js';
// ABI_UNISWAP_V2_ROUTER
import { ABI_UNISWAP_V2_ROUTER, ERC20_ABI } from '../../util/abi.js';
import prompt from 'prompt-sync';

export const SwapV2 = async (options) => {
    const provider = getProvider(options.rpc);


    if (options.weth) {
        _GetWETH(provider, options);
        return;
    }

    if (options.quoteOnly) {
        _DisplayPrice(provider, options);
        return;
    }

    // privateKey is required
    if (!options.privateKey) {
        console.log('Private key is required');
        return;
    }

    const wallet = new ethers.Wallet(options.privateKey, provider);

    const gasPrice = options.gasPrice ? ethers.parseUnits(options.gasPrice, 'gwei')
        : await provider.getFeeData().then(feeData => feeData.gasPrice);
    const gasLimit = options.gasLimit ? BigInt(options.gasLimit)
        : await _EstimateGasSwap(provider, options, wallet);

    console.log(`Gas Price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
    console.log(`Gas Limit: ${gasLimit}`);
    console.log(`Total GAS: ${ethers.formatUnits(gasPrice * gasLimit, 'ether')} ETH`);

    if (options.gasOnly) {
        return;
    }

    // yes
    if (!options.yes) {
        console.log('Are you sure to do the swap?');
        const yes = prompt()('Continue? [y/N] ');
        if (yes !== 'y') {
            return;
        }
    }
    const tx = await _DoSwap(provider, options, wallet);
    console.log('Transaction hash:', tx.hash);
    if (!options.async) {
        await tx.wait();
        console.log('Transaction confirmed');
    }
}

const _DoSwap = async (provider, options, wallet, gasPrice, gasLimit) => {
    const amount0 = options.amount0 ? ethers.parseUnits(options.amount0, 'ether') : null;
    const amount1 = options.amount1 ? ethers.parseUnits(options.amount1, 'ether') : null;
    const path = options.path.split(',');

    const _router = new ethers.Contract(options.router, ABI_UNISWAP_V2_ROUTER, wallet);
    if (options.ethOut) {
        const weth = await _GetWETH(provider, options);
        // path last token is WETH
        if (path[path.length - 1].toLowerCase() !== weth.toLowerCase()) {
            path.push(weth);
        }

        const price = await _GetPrice(provider, options, path, amount0, amount1);
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
        // 1, token 换 eth
        if (amount0) {
            // 1.1 exact token -> eth - swapExactTokensForETH
            const tx = await _router.swapExactTokensForETH(
                amount0,
                price.amountOutMin,
                path,
                wallet.address,
                deadline,
                { gasPrice, gasLimit }
            );
            return tx;
        } else if (amount1) {
            // 1.2 token -> exact eth - swapTokensForExactETH
            const tx = await _router.swapTokensForExactETH(
                amount1,
                price.amountInMax,
                path,
                wallet.address,
                deadline,
                { gasPrice, gasLimit }
            );
            return tx;
        }
    } else if (options.ethIn) {
        const weth = await _GetWETH(provider, options);
        // path first token is WETH
        if (path[0].toLowerCase() !== weth.toLowerCase()) {
            path.unshift(weth);
        }

        const price = await _GetPrice(provider, options, path, amount0, amount1);
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

        // 2, eth  token
        if (amount0) {
            // 2.1 exact eth -> token - swapExactETHForTokens
            const tx = await _router.swapExactETHForTokens(
                price.amountOutMin,
                path,
                wallet.address,
                deadline,
                { value: amount0, gasPrice, gasLimit }
            );
            return tx;
        } else if (amount1) {
            // 2.2 eth -> exact token - swapETHForExactTokens
            const tx = await _router.swapETHForExactTokens(
                amount1,
                path,
                wallet.address,
                deadline,
                { value: price.amountInMax, gasPrice, gasLimit }
            );
            return tx;
        }
    } else {
        // 3, token  token
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
        const price = await _GetPrice(provider, options, path, amount0, amount1);

        if (amount0) {
            // 3.1 exact token -> token - swapExactTokensForTokens
            const tx = await _router.swapExactTokensForTokens(
                amount0,
                price.amountOutMin,
                path,
                wallet.address,
                deadline,
                { gasPrice, gasLimit }
            );
            return tx;
        } else if (amount1) {
            // 3.2 token -> exact token - swapTokensForExactTokens
            const tx = await _router.swapTokensForExactTokens(
                amount1,
                price.amountInMax,
                path,
                wallet.address,
                deadline,
                { gasPrice, gasLimit }
            );
            return tx;
        }
    }
}

const _EstimateGasSwap = async (provider, options, wallet) => {
    const amount0 = options.amount0 ? ethers.parseUnits(options.amount0, 'ether') : null;
    const amount1 = options.amount1 ? ethers.parseUnits(options.amount1, 'ether') : null;
    const path = options.path.split(',');

    const _router = new ethers.Contract(options.router, ABI_UNISWAP_V2_ROUTER, wallet);

    // console amount0
    console.log('Amount0:', amount0);
    // console amount1
    console.log('Amount1:', amount1);
    // console path
    console.log('Path:', path);

    if (options.ethOut) {
        const weth = await _GetWETH(provider, options);
        // path last token is WETH
        if (path[path.length - 1].toLowerCase() !== weth.toLowerCase()) {
            path.push(weth);
        }

        // token input allowance
        // const allowance = await _GetAllowance(options, wallet, path[0]);
        // console.log('Allowance:', allowance.toString());
        // if (allowance < amount0) {
        //     console.log('Insufficient allowance');
        // }

        const price = await _GetPrice(provider, options, path, amount0, amount1);
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
        // 1, token 换 eth
        if (amount0) {
            // 1.1 exact token -> eth - swapExactTokensForETH
            const gasLimit = await _router.swapExactTokensForETH.estimateGas(
                amount0,
                price.amountOutMin,
                path,
                wallet.address,
                deadline
            );
            return gasLimit;
        } else if (amount1) {
            // 1.2 token -> exact eth - swapTokensForExactETH
            const gasLimit = await _router.swapTokensForExactETH.estimateGas(
                amount1,
                price.amountInMax,
                path,
                wallet.address,
                deadline
            );
            return gasLimit;
        } else {
            console.log('Invalid options');
            throw new Error('Invalid options');
        }
    } else if (options.ethIn) {
        const weth = await _GetWETH(provider, options);
        // path first token is WETH
        if (path[0].toLowerCase() !== weth.toLowerCase()) {
            path.unshift(weth);
        }

        const price = await _GetPrice(provider, options, path, amount0, amount1);
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
        console.table(price);
        // 2, eth 换 token
        if (amount0) {
            // 2.1 exact eth -> token - swapExactETHForTokens
            const gasLimit = await _router.swapExactETHForTokens.estimateGas(
                price.amountOutMin,
                path,
                wallet.address,
                deadline,
                { value: amount0 }
            );
            return gasLimit;

        } else if (amount1) {
            // 2.2 eth -> exact token - swapETHForExactTokens
            const gasLimit = await _router.swapETHForExactTokens.estimateGas(
                amount1,
                path,
                wallet.address,
                deadline,
                { value: price.amountInMax }
            );
            return gasLimit;
        } else {
            console.log('Invalid options');
            throw new Error('Invalid options');
        }
    } else {
        // 3, token 换 token
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
        const price = await _GetPrice(provider, options, path, amount0, amount1);

        if (amount0) {
            // 3.1 exact token -> token - swapExactTokensForTokens
            const gasLimit = await _router.swapExactTokensForTokens.estimateGas(
                amount0,
                price.amountOutMin,
                path,
                wallet.address,
                deadline
            );
            return gasLimit;
        } else if (amount1) {
            // 3.2 token -> exact token - swapTokensForExactTokens
            const gasLimit = await _router.swapTokensForExactTokens.estimateGas(
                amount1,
                price.amountInMax,
                path,
                wallet.address,
                deadline
            );
            return gasLimit;
        } else {
            console.log('Invalid options');
            throw new Error('Invalid options');
        }
    }
}

const _GetWETH = async (provider, options) => {
    if (!options.router) {
        console.log('Router address is required');
        return;
    }
    // get weth address
    const _router = new ethers.Contract(options.router, ABI_UNISWAP_V2_ROUTER, provider);
    const weth = await _router.WETH();
    return weth;
}

const _DisplayPrice = async (provider, options) => {
    if (!options.router) {
        console.log('Router address is required');
        return;
    }

    if (!options.path) {
        console.log('Path is required');
        return;
    }
    // amount0 and amount1 cannot be provided at the same time
    if (options.amount0 && options.amount1) {
        console.log('amount0 and amount1 cannot be provided at the same time');
        return;
    }
    // amount0 or amount1 must be provided
    if (!options.amount0 && !options.amount1) {
        console.log('amount0 or amount1 must be provided');
        return;
    }

    const path = options.path.split(',');
    if (path.length < 2) {
        // if is amount in 
        const _router = new ethers.Contract(options.router, ABI_UNISWAP_V2_ROUTER, provider);
        const weth = await _router.WETH();

        if (options.amount0) {
            path.push(weth);
        } else if (options.amount1) {
            path.unshift(weth);
        } else {
            console.log('Invalid path');
            return;
        }
    }
    // get price only
    const amount0 = options.amount0 ? ethers.parseUnits(options.amount0, 'ether') : null;
    const amount1 = options.amount1 ? ethers.parseUnits(options.amount1, 'ether') : null;
    const price = await _GetPrice(provider, options, path, amount0, amount1);
    if (!options.format) {
        console.table(price);
    } else {
        const token0contract = new ethers.Contract(path[0], ERC20_ABI, provider);
        const token1contract = new ethers.Contract(path[path.length - 1], ERC20_ABI, provider);
        const token0symbol = await token0contract.symbol();
        const token1symbol = await token1contract.symbol();
        const decimals0 = await token0contract.decimals();
        const decimals1 = await token1contract.decimals();
        // if (amount0) {
        //     if (options.slippage > 0) {
        //         console.log(`${token0symbol} -> ${token1symbol}: ${ethers.formatUnits(price.amountOutMin, decimals1)} - ${ethers.formatUnits(price.amountOut, decimals1)}`);
        //     } else {
        //         console.log(`${token0symbol} -> ${token1symbol}: ${ethers.formatUnits(price.amountOut, decimals1)}`);
        //     }
        // } else if (amount1) {
        //     if (options.slippage > 0) {
        //         console.log(`${token1symbol} required ${token0symbol}:  ${ethers.formatUnits(price.amountIn, decimals0)} - ${ethers.formatUnits(price.amountInMax, decimals0)}`);
        //     } else {
        //         console.log(`${token1symbol} required ${token0symbol}:  ${ethers.formatUnits(price.amountIn, decimals0)}`);
        //     }
        // }
        console.log(`${token0symbol} -> ${token1symbol}`)
        
        if (amount0) {
            if (options.slippage > 0) {
                console.log(`${ethers.formatUnits(amount0, decimals0)} ${token0symbol} -> ${ethers.formatUnits(price.amountOutMin, decimals1)} ~ ${ethers.formatUnits(price.amountOut, decimals1)} ${token1symbol} `);
            } else {
                console.log(`${ethers.formatUnits(amount0, decimals0)}  ${token0symbol} -> ${ethers.formatUnits(price.amountOut, decimals1)} ${token1symbol} `);
            }
        } else if (amount1) {
            if (options.slippage > 0) {
                console.log(`${ethers.formatUnits(price.amountIn, decimals0)} ~ ${ethers.formatUnits(price.amountInMax, decimals0)} ${token0symbol} -> ${ethers.formatUnits(amount1, decimals1)} ${token1symbol} `);
            } else {
                console.log(`${ethers.formatUnits(price.amountIn, decimals0)} ${token0symbol} -> ${ethers.formatUnits(amount1, decimals1)} ${token1symbol} `);
            }
        }
        return;
    }
}

const _GetPrice = async (provider, options, path, amount0, amount1) => {
    const { router, } = options;
    const slippage = options.slippage || 0;
    const _router = new ethers.Contract(router, ABI_UNISWAP_V2_ROUTER, provider);

    if (amount0) {
        // getAmountsOut
        const amounts = await _router.getAmountsOut(amount0, path);
        const amountOut = amounts[amounts.length - 1];
        const amountOutMin = amountOut * (BigInt(10000) - BigInt(slippage * 10000)) / BigInt(10000);
        return {
            amountOutMin,
            amountOut
        }
    } else if (amount1) {
        // getAmountsIn
        const amounts = await _router.getAmountsIn(amount1, path);
        const amountIn = amounts[0];
        const amountInMax = amountIn * (BigInt(10000) + BigInt(slippage * 10000)) / BigInt(10000);
        return {
            amountInMax,
            amountIn
        }
    } else {
        // assume sell 1 unit of token0, getAmountsOut token0
        // assume buy 1 unit of token1, getAmountsIn token1
        // error
        throw new Error('Invalid options, either amount0 or amount1 must be provided');
    }
}