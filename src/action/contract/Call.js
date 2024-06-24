import { ethers } from 'ethers';
import fs from 'fs';
import { getProvider } from '../../util/web3util.js';

export const Call = async (options) => {
    
        const abiFile = options.abiFile;
        
        const provider = getProvider(options.rpc);
    
        if (abiFile) {
            const abiContent = fs.readFileSync(abiFile);
            const abi = JSON.parse(abiContent);
            const contract = new ethers.Contract(options.contract, abi, provider);
            
            const method = options.method;
            console.log('method:', method);
            const args = options.args ? options.args.split('|') : '';
            console.log('args:', args)
    
            const _args = [];
            for (let arg of args) {
                if (arg.startsWith('(')) {
                    // tuple
                    const _arg = arg.substring(1, arg.length - 1);
                    const _argsArr = _arg.split(',');
                    _args.push(_argsArr);
                } else if (arg.startsWith('[')) {
                    // array
                    const _arg = arg.substring(1, arg.length - 1);
                    const _argsArr = _arg.split(',');
                    _args.push(_argsArr);
                } else {
                    _args.push(arg);
                }
                    
            }
            // const data = options.args ? contract.interface.encodeFunctionData(method, _args)
            //     :contract.interface.encodeFunctionData(method);
            // console.log('contract:', contract);
            // console.log('method:', method);
            // console.log('data:', data);
            const result = options.args ? await contract[method](..._args)
                :await contract[method]();
            console.log('result:', result);
        } else {
            console.log('no abi file');
        }
    }