import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import fs from "fs";

export const GetMerkleTreeProof = async (options) => {
    console.log('Getting merkle proof...');
    const tree = StandardMerkleTree.load(JSON.parse(fs.readFileSync(options.file, "utf8")));
    const address = options.address;
    
    for (const [i, v] of tree.entries()) {
        if (v[0] === address) {
            const proof = tree.getProof(i);
            console.log('Value:', v);
            console.log('Proof:', proof);
        }
    }
}