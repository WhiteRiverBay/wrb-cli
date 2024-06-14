import {ethers} from 'ethers';
import fs from 'fs';

export const GenerateEOA = async (options) => {
    const count = options.number;
    const output = options.output;

    const accounts = [];
    for (let i = 0; i < count; i++) {
        const wallet = ethers.Wallet.createRandom();
        accounts.push({
            address: wallet.address,
            privateKey: wallet.privateKey
        });
    }

    const content = accounts.map(account => `${account.address} ${account.privateKey}`).join('\n');
    if (options.output) {
        fs.writeFileSync(output, content + '\n', 'utf-8');
    } else {
        console.log(content);
    }
}