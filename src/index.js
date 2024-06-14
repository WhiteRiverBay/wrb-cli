import { Command } from 'commander';
import { Info } from './action/cli/Info.js';
import { GenerateEOA } from './action/cli/GenerateEOA.js';
import { CreateMerkleTree } from './action/cli/CreateMerkleTree.js';
import { GetMerkleTreeProof } from './action/cli/GetMerkleTreeProof.js';
import { Transfer } from './action/cli/Transfer.js';
import { CliSignature } from './action/cli/CliSignature.js';
import { SwapV2 } from './action/cli/SwapV2.js';
import { ERC20Allowance } from './action/cli/ERC20Allowance.js';
import { ERC20Approve } from './action/cli/ERC20Approve.js';
import { Airdrop } from './action/cli/Airdrop.js';
import { SwapV3 } from './action/cli/SwapV3.js';
import { Invoke } from './action/contract/Invoke.js';

const program = new Command();

function main() {
    program.name('web3')
        .version('0.0.1')
        .description('Web3 CLI');

    //[tested] transfer command
    program
        .command('transfer')
        .description('Transfer erc20 tokens or ether or nft token to another address')
        .requiredOption('-t, --to <address>', 'Address to transfer')
        .requiredOption('-T, --type <type>', 'Type of token to transfer [erc20, ether, nft]')
        // -R, --rpc
        .requiredOption('-R, --rpc <rpc>', 'RPC URL')
        // -P, --privateKey
        .requiredOption('-P, --privateKey <privateKey>', 'Private key')

        .option('-a, --amount <amount>', 'Amount of token to transfer(apply only for erc20 and ether)')
        // contract
        .option('-c, --contract <contract>', 'Contract address of token(apply only for erc20 and nft)')
        // token id
        .option('-i, --id <id>', 'Token id of nft(apply only for nft)')
        // decimals
        .option('-d, --decimals <decimals>', 'Decimals of token(apply only for erc20)')
        // symbol
        .option('-s, --symbol <symbol>', 'Symbol of token(apply only for erc20)')
        // gasOnly
        .option('-G, --gasOnly', 'Only get gas estimate', false)
        // gasPrice
        .option('-g, --gasPrice <gasPrice>', 'specify gas price in gwei')
        // gasLimit
        .option('-l, --gasLimit <gasLimit>', 'specify gas limit')
        // spec nonce
        .option('-n, --nonce <nonce>', 'Nonce')
        // async
        .option('-A, --async', 'Async transfer', false)
        // -y, --yes
        .option('-y, --yes', 'Skip confirmation', false)

        .action(async (options) => {
            await Transfer(options);
        });

    // [tested] airdrop
    program
        .command('airdrop')
        .description('Airdrop erc20 tokens / ethers to multiple addresses')
        .requiredOption('-R, --rpc <rpc>', 'RPC URL')
        .requiredOption('-P, --privateKey <privateKey>', 'Private key')
        .requiredOption('-f, --file <file>', 'File path of addresses and amount')
        .requiredOption('-b, --batchTransferContract <batchTransferContract>', 'Batch transfer contract address(apply only for erc20)')
        .option('-c, --contract <contract>', 'Contract address of token(apply only for erc20)')
        // gasOnly
        .option('-G, --gasOnly', 'Only get gas estimate', false)
        .option('-n, --nonce <nonce>', 'Nonce')
        .option('-y, --yes', 'Skip confirmation', false)
        .action(async (options) => {
            await Airdrop(options);
        });

    //[] info
    program
        .command('info')
        .description('Get information of token or address')
        .requiredOption('-R, --rpc <rpc>', 'RPC URL')
        // type
        .requiredOption('-T, --type <type>', 'Type of information to get [address, erc20, nft]')

        .option('-a, --address <address>', 'Address to get information')
        .option('-c, --contract <contract>', 'Contract address of token')
        .option('-i, --id <id>', 'Token id of nft (apply only for nft)')

        // with uri
        .option('-u, --uri', 'Get URI of nft token (apply only for nft )', true)
        // original
        .option('-ori, --original', 'Get original of nft token (apply only for nft)', false)

        .action(async (options) => {
            await Info(options);
        });

    // [tested] generate eoa
    program
        .command('generate-eoa')
        .description('Generate EOA')
        // -n
        .requiredOption('-n, --number <number>', 'Number of EOA to generate', 1)
        .option('-o, --output <output>', 'Output file path')
        .action(async (options) => {
            await GenerateEOA(options);
        });

    // [tested] swap v2
    program
        .command('swapv2')
        .description('Swap tokens using uniswap v2')
        // version
        .requiredOption('-R, --rpc <rpc>', 'RPC URL')
        // weth
        .option('-w, --weth <weth>', 'WETH address')
        // amount0
        .option('-a0, --amount0 <amount0>', 'Amount of token0')
        // amount1
        .option('-a1, --amount1 <amount1>', 'Amount of token1')
        // ethin
        .option('-ei, --ethIn', 'ETH in', false)
        // ethout
        .option('-eo, --ethOut', 'ETH out', false)
        // slippage
        .option('-s, --slippage <slippage>', 'Slippage', 0.005)
        // router
        .option('-r, --router <router>', 'Router address')
        // -P, --privateKey
        .option('-P, --privateKey <privateKey>', 'Private key')
        //  price only
        .option('-q, --quoteOnly', 'quote  ', false)
        // gasOnly
        .option('-G, --gasOnly', 'Only get gas estimate', false)
        // gasPrice
        .option('-g, --gasPrice <gasPrice>', 'Gas price in gwei')
        // path
        .requiredOption('-pt, --path <path>', 'Path of token to swap, for example: token0,token1,token2, default is token0,token1')
        // spec nonce
        .option('-n, --nonce <nonce>', 'Nonce')
        // -y, --yes
        .option('-y, --yes', 'Skip confirmation', false)
        // format
        .option('-f, --format <format>', 'Format of output', true)
        // async 
        .option('-A, --async', 'Async transfer', false)
        .action(async (options) => {
            await SwapV2(options);
        });

    // swap v3
    /* program
        .command('swapv3')
        .description('Swap tokens using uniswap v3')
        .requiredOption('-R, --rpc <rpc>', 'RPC URL')
        // quoteContract
        .option('-Q, --quoteContract <quoteContract>', 'quote contract address')
        // quoteOnly
        .option('-q, --quoteOnly', 'quote', false)
        // path
        .requiredOption('-pt, --path <path>', 'Path of token to swap, for example: token0,token1,token2, default is token0,token1')
        // amount0
        .option('-a0, --amount0 <amount0>', 'Amount of token0')
        // amount1
        .option('-a1, --amount1 <amount1>', 'Amount of token1')
        // ethIn
        .option('-ei, --ethIn', 'ETH in', false)
        // ethOut
        .option('-eo, --ethOut', 'ETH out', false)
        // slippage
        .option('-s, --slippage <slippage>', 'Slippage', 0.005)
        // router
        .option('-r, --router <router>', 'Router address')
        // privateKey
        .option('-P, --privateKey <privateKey>', 'Private key')
        .option('-n, --nonce <nonce>', 'Nonce')
        .option('-g, --gasPrice <gasPrice>', 'Gas price in gwei')
        .option('-l, --gasLimit <gasLimit>', 'Gas limit')
        .option('-y, --yes', 'Skip confirmation', false)
        .action(async (options) => {
            await SwapV3(options);
        });
    */

    //[tested] signature
    program
        .command('sign')
        .description('Sign message by private key or verify signature')
        .option('-P, --privateKey <privateKey>', 'Private key')
        .option('-m, --message <message>', 'Message to sign')
        // --file
        .option('-f, --file <file>', 'File path of message, if file is provided, message will be read from file')
        // data
        .option('-s, --sign <sign>', 'signature of message')
        .option('-H, --hex', 'Message is hex, if this option is not provided, message will be treated automatically as hex or string (depend on the message starts with 0x or not)')
        // --publicKey
        .option('-p, --publicKey <publicKey>', 'Check public key (apply only if the mode is verify)')
        // mode
        .option('-M, --mode <mode>', 'Mode of signature [sign, verify]')
        .action(async (options) => {
            if (options.mode === 'sign' || options.mode === 'verify') {
                // signature
                await CliSignature(options);
            } else {
                console.log('Unsupported mode');
            }
        });

    // [tested] create-merkle-tree
    program
        .command('create-merkle-tree')
        .description('Generate merkle tree')
        .requiredOption('-f, --file <file>', 'File path of addresses and amount')
        // output
        .option('-o, --output <output>', 'Output file path', 'merkle-tree.json')
        .action(async (options) => {
            await CreateMerkleTree(options);
        });

    // [tested] get-merkle-proof
    program
        .command('get-merkle-proof')
        .description('Get merkle proof')
        .requiredOption('-f, --file <file>', 'Tree file path')
        .requiredOption('-a, --address <address>', 'Address to get proof')
        // output
        .action(async (options) => {
            await GetMerkleTreeProof(options);
        });

    // [tested] approve
    program
        .command('approve')
        .description('Approve token')
        .requiredOption('-R, --rpc <rpc>', 'RPC URL')
        .requiredOption('-c, --contract <contract>', 'Contract address of token')
        .option('-a, --amount <amount>', 'Amount to approve')
        .requiredOption('-t, --to <to>', 'Address to approve')
        .requiredOption('-P, --privateKey <privateKey>', 'Private key')
        .option('-y, --yes', 'Skip confirmation', false)
        // async
        .option('-A, --async', 'Async transfer', false)
        .action(async (options) => {
            await ERC20Approve(options);
        });

    // [tested] allowance
    program
        .command('allowance')
        .description('Get allowance of token')
        .requiredOption('-R, --rpc <rpc>', 'RPC URL')
        .requiredOption('-c, --contract <contract>', 'Contract address of token')
        // address
        .requiredOption('-a, --address <address>', 'Address to check allowance')
        // to
        .requiredOption('-t, --to <to>', 'Address to check allowance')
        .action(async (options) => {
            await ERC20Allowance(options);
        });

    // invoke method
    program
        .command('invoke')
        .description('Call contract method')
        .requiredOption('-R, --rpc <rpc>', 'RPC URL')
        .requiredOption('-c, --contract <contract>', 'Contract address')
        .requiredOption('-m, --method <method>', 'Method name')
        .option('-a, --args <args>', 'Arguments of method')
        .option('-P, --privateKey <privateKey>', 'Private key')
        .option('-n, --nonce <nonce>', 'Nonce')
        .option('-g, --gasPrice <gasPrice>', 'Gas price in gwei')
        .option('-l, --gasLimit <gasLimit>', 'Gas limit')
        .option('-G, --gasOnly', 'Only get gas estimate', false)
        .option('-y, --yes', 'Skip confirmation', false)
        // abi file
        .option('-b, --abiFile <abiFile>', 'ABI file path')
        // async
        .option('-A, --async', 'Async transfer', false)
        .action(async (options) => {
            await Invoke(options);
        });

    // call
    program
        .command('call')
        .description('Call contract method')
        .requiredOption('-R, --rpc <rpc>', 'RPC URL')
        .requiredOption('-c, --contract <contract>', 'Contract address')
        .requiredOption('-m, --method <method>', 'Method name')
        .option('-a, --args <args>', 'Arguments of method')
        .action(async (options) => {
            await CallMethod(options);
        });

    program.command('help')
        .description('Help')
        .action(async () => {
            program.help();
        })

    // default is help
    program.action(async () => {
        program.help();
    })
    const argv = program.opts();
    program.parseAsync(process.argv);

}

main();