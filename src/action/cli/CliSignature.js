import { ethers } from 'ethers';
import fs from 'fs';

export const CliSignature = async (options) => {
    const { message, hex, publicKey, mode } = options;
    let _message = message;

    if (options.file) {
        // if file is provided, read the file first
        _message = fs.readFileSync(options.file).toString();
    }

    const _hex = hex === true ? true : (_message.startsWith('0x') ? true : false);

    if (mode === 'sign') {
        const wallet = new ethers.Wallet(options.privateKey,);
        if (_hex) {
            // 0x0000 to Unit8Array
            const data = ethers.getBytes(_message);
            const signature = await wallet.signMessage();
            console.log('Signature:', signature);
        } else {
            const signature = await wallet.signMessage(_message);
            console.log('Signature:', signature);
        }
    } else if (mode === 'verify') {
        const _data = _message
        const _sign = options.sign;
        const address = ethers.verifyMessage(_data, _sign );
        if (publicKey) {
            console.log(publicKey.toLowerCase() === address.toLowerCase());
        } else {
            console.log('Address:', address);
        }
    }
}

