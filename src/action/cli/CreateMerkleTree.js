import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import keccak256 from '@ethersproject/keccak256';
import fs from "fs";

export const CreateMerkleTree = async (options) => {
    console.log('Creating merkle tree...');
    const file = options.file;
    // the file content is address and amount, each line is an address and amount, separated by a space
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");
    const elements = [];
    for (const line of lines) {
        if (line === "" || line === undefined || line === null) {
            continue;
        }
        const [address, amount] = line.split(" ");
        elements.push([address, amount]);
    }

    console.log('Elements length : ', elements.length);

    const tree = StandardMerkleTree.of(elements, ['address', 'uint256']);
    console.log('Root hash:', tree.root);

    fs.writeFileSync(options.output, JSON.stringify(tree.dump()));
    console.log('Merkle tree created, root hash:', tree.root, 'saved to', options.output); 
};


// (1)
// const tree = StandardMerkleTree.load(JSON.parse(fs.readFileSync("tree.json", "utf8")));

// (2)
// for (const [i, v] of tree.entries()) {
//   if (v[0] === '0x1111111111111111111111111111111111111111') {
//     // (3)
//     const proof = tree.getProof(i);
//     console.log('Value:', v);
//     console.log('Proof:', proof);
//   }
// }
