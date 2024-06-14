import { ethers } from "ethers";
import { ABI_IV3SwapRouter, ERC20_ABI } from "../../util/abi.js";
import { getProvider } from "../../util/web3util.js";
import prompt from "prompt-sync";
import { Token } from "@uniswap/sdk-core";
import { computePoolAddress } from "@uniswap/v3-sdk";
import { QUOTE_ABI } from "../../util/quote_abi.js";

// still in progress
// implements with uniswap v3 sdk
/**
 * 1, quote
 *      special params: quoteContract
 * 2, swap
 * 3, gas estimation
 * @param {*} options 
 */
export const SwapV3 = async (options) => {
    const provider = getProvider(options.rpc);
    const network = await provider.getNetwork();
    // const chainId = network.chainId;
    // amount0和amount1不能同时为空
    if (!options.amount0 && !options.amount1) {
        console.log('amount0 and amount1 can not be both empty');
        return;
    }
    // if --ethIn
    // -- exactInput
    // -- exactOutput
    // if --ethOut
    // -- exactInput
    // -- exactOutput
    // if token for token
    // -- exactInput
    // -- exactOutput

    const weth = await _WETH(provider, options);
    const path = options.path.split(',');
    if (options.ethIn) {
        if (path[0].toLowerCase() !== weth.toLowerCase()) {
            // path[0] must be weth
            path.unshift(weth);
        }
    } else if (options.ethOut) {
        if (path[path.length - 1].toLowerCase() !== weth.toLowerCase()) {
            // path[path.length - 1] must be weth
            path.push(weth);
        }
    }

    if (options.quoteOnly) {
        _DisplayQuote(provider, options, path);
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

const _DoSwap = async (provider, options, wallet) => {
    // TODO
}

const _EstimateGasSwap = async (provider, options, wallet) => {
    // TODO
}

const _DisplayQuote = async (provider, options, path) => {
    const token0 = path[0];
    const tokenContract = new ethers.Contract(
        token0,
        ERC20_ABI,
        provider
    );
    const decimals0 = await tokenContract.decimals();
    const token0symbol = await tokenContract.symbol();

    const token1 = path[path.length - 1];
    const tokenContract1 = new ethers.Contract(
        token1,
        ERC20_ABI,
        provider
    );
    const decimals1 = await tokenContract1.decimals();
    const token1symbol = await tokenContract1.symbol();

    console.log(`${token0symbol} -> ${token1symbol}`)
    const price = await _GetQuote(provider, options, path);

    const amount0 = options.amount0 ? ethers.parseUnits(options.amount0, decimals0) : null;
    const amount1 = options.amount1 ? ethers.parseUnits(options.amount1, decimals1) : null;

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
}

const _WETH = async (provider, options) => {
    if (options.weth) {
        return options.weth;
    }
    const contract = new ethers.Contract(
        options.router,
        ABI_IV3SwapRouter,
        provider
    );
    const weth = await contract.WETH9();
    return weth;
}
// const _GetQuota = async (provider, options, path) => {

// }
// const _GetQuotePair = async (provider, token0, token1, fee) => {
//     const amountIn = options.amount0;
//     const priceNext = (liq * q96 * sqrtp_cur) / (liq * q96 + amountIn * sqrtp_cur);

//     console.log("New price:", (Number(priceNext) / Number(q96)) ** 2);
//     console.log("New sqrtP:", priceNext.toString());
//     console.log("New tick:", priceToTick((Number(priceNext) / Number(q96)) ** 2));

//     const _amountIn = calcAmount0(liq, priceNext, sqrtp_cur);
//     const _amountOut = calcAmount1(liq, priceNext, sqrtp_cur);

//     console.log("Token0 in:", Number(_amountIn) / Number(eth));
//     console.log("Token1 out:", Number(_amountOut) / Number(eth));
// }


// Function to calculate price to tick (replace with actual function logic)
// function priceToTick(price) {
//     return Math.floor(Math.log(price) / Math.log(1.0001));
// }

// function calcAmount0(liq, price_next, sqrtp_cur) {
//     return (liq * (price_next - sqrtp_cur)) / (price_next * sqrtp_cur);
// }

// function calcAmount1(liq, price_next, sqrtp_cur) {
//     return liq * (sqrtp_cur - price_next);
// }


const _GetQuote = async (provider, options, path) => {
    // console.log('quote contract: ', options.quoteContract)
    const quoteContract = new ethers.Contract(options.quoteContract, QUOTE_ABI, provider);
    const slippage = options.slippage;

    if (options.amount0) {
        // quoteExactInput
        const firstToken = path[0];
        const tokenContract = new ethers.Contract(
            firstToken,
            ERC20_ABI,
            provider
        );
        const decimals = await tokenContract.decimals();
        const amountIn = ethers.parseUnits(options.amount0, decimals);

        // encodedPath 编码：20字节token地址 + 3字节费率池子长度 + 20字节token地址 + 3字节费率池子长度 + ...
        const encodedPath = parseOptionsPath(options.path);

        const quoteRes = await quoteContract.quoteExactInput.staticCall(
            encodedPath,
            amountIn
        );
        const quote = {
            amountOut: quoteRes[0],
            sqrtPriceX96After: quoteRes[1],
            amountOutMin: 0
        }
        // console.log(quote);
        const amountOutMin = quote.amountOut * (BigInt(10000) - BigInt(slippage * 10000)) / BigInt(10000);
        quote.amountOutMin = amountOutMin;

        return quote;
    } else if (options.amount1) {
        // quoteExactOutput
        const lastToken = path[path.length - 1];
        const tokenContract = new ethers.Contract(
            lastToken,
            ERC20_ABI,
            provider
        );
        const decimals = await tokenContract.decimals();
        const amountOut = ethers.parseUnits(options.amount1, decimals);

        // encodedPath 编码：20字节token地址 + 3字节费率池子长度 + 20字节token地址 + 3字节费率池子长度 + ...
        const encodedPath = parseOptionsPath(options.path);

        const quoteRes = await quoteContract.quoteExactOutput.staticCall(
            encodedPath,
            amountOut
        );
        const quote = {
            amountIn: quoteRes[0],
            sqrtPriceX96After: quoteRes[1],
            amountInMax: 0
        }
        // console.log(quote);
        const amountInMax = quote.amountIn * BigInt(10000) / BigInt(10000 - slippage * 10000);
        quote.amountInMax = amountInMax;

        return quote;
    } else {
        console.log('amountIn or amountOut must be provided');
        throw new Error('amountIn or amountOut must be provided');
    }
}

function parseOptionsPath(path) {
    // 从options输入的path为：token0,500,token1,3000,token2类似格式
    // 之后把token地址的0x去掉，转成小写，然后转成uint8array，拼接到主串
    // 20字节token地址 + 3字节费率池子长度 + 20字节token地址 + 3字节费率池子长度 + ...
    // 最后转为hex输出
    const pathArr = path.split(',');
    // pathArr一定是奇数
    if (pathArr.length % 2 === 0) {
        throw new Error('pathArr length must be odd number');
    }
    const ADDR_SIZE = 20;
    const FEE_SIZE = 3;

    const addressCounts = (pathArr.length + 1) / 2;

    const uint8array = new Uint8Array(addressCounts * ADDR_SIZE + (addressCounts - 1) * FEE_SIZE);

    let offset = 0;
    for (let i = 0; i < pathArr.length; i++) {
        if (i % 2 === 0) {
            // const token = pathArr[i].toLowerCase().replace('0x', '');
            const tokenBytes = ethers.getBytes(pathArr[i])
            // 这里正好20字节
            // console.log(tokenBytes);
            // 放入uint8array
            uint8array.set(tokenBytes, offset);
            offset += ADDR_SIZE;
        } else {
            const fee = parseInt(pathArr[i]);
            // 3字节
            const _feeBytes = ethers.toBeHex(fee, FEE_SIZE);
            const feeBytes = ethers.getBytes(_feeBytes);
            // console.log(feeBytes);
            // 放入uint8array
            uint8array.set(feeBytes, offset);
            offset += FEE_SIZE;
        }
    }
    return ethers.hexlify(uint8array);
}

// const a = parseOptionsPath('0x576e2bed8f7b46d34016198911cdf9886f78bea7,500,0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')
// console.log(a)
// function test() {
//     // const path = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc20001f4dac17f958d2ee523a2206206994597c13d831ec7000bb895ad61b0a150d79219dcf64e1e6cc01f0b64c4ce';
//     const path = '0x576e2bed8f7b46d34016198911cdf9886f78bea70001f4c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
//     const ADDR_SIZE = 20;
//     const FEE_SIZE = 3;
//     const NEXT_OFFSET = ADDR_SIZE + FEE_SIZE;
//     const POP_OFFSET = NEXT_OFFSET + ADDR_SIZE + FEE_SIZE;
//     const MULTIPLE_POOLS_MIN_LENGTH = POP_OFFSET + NEXT_OFFSET;

//     const uint8array = ethers.getBytes(path);

//     const pathArr = [];
//     for (let i = 0; i < uint8array.length; i += NEXT_OFFSET) {
//         const addr = ethers.hexlify(uint8array.slice(i, i + ADDR_SIZE));
//         const _fee = uint8array.slice(i + ADDR_SIZE, i + ADDR_SIZE + FEE_SIZE)
//         const fee = ethers.hexlify(_fee);
//         const feeDecimal = parseInt(fee);
//         pathArr.push(addr, feeDecimal);
//     }
//     console.log(pathArr);
// }
// test()