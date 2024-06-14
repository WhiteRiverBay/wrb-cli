# wrb-cli

## TODO

- Prompt for private key input if the -P option is not provided and it is required.

## Usage

### 1 Batch Generate EOA

USAGE:

```text
Usage: web3 generate-eoa [options]

Generate EOA

Options:
  -n, --number <number>  Number of EOA to generate 
  -o, --output <output>  Output file path
  -h, --help             display help for command
```

Example:

```base
bin/cli generate-eoa -n 100 -o /tmp/accounts.txt
```

OR

```base
bin/cli generate-eoa -n 100
```

### 2 Transfer Token / Coin

USAGE:

```text
Usage: web3 transfer [options]

Transfer erc20 tokens or ether or nft token to another address

Options:
  -t, --to <address>             Address to transfer
  -T, --type <type>              Type of token to transfer [erc20, ether, nft]
  -R, --rpc <rpc>                RPC URL
  -P, --privateKey <privateKey>  Private key
  -a, --amount <amount>          Amount of token to transfer(apply only for erc20 and ether)
  -c, --contract <contract>      Contract address of token(apply only for erc20 and nft)
  -i, --id <id>                  Token id of nft(apply only for nft)
  -d, --decimals <decimals>      Decimals of token(apply only for erc20)
  -s, --symbol <symbol>          Symbol of token(apply only for erc20)
  -G, --gasOnly                  Only get gas estimate (default: false)
  -g, --gasPrice <gasPrice>      specify gas price in gwei
  -l, --gasLimit <gasLimit>      specify gas limit
  -n, --nonce <nonce>            Nonce
  -A, --async                    Async transfer (default: false)
  -y, --yes                      Skip confirmation (default: false)
  -h, --help                     display help for command
```

Example of transfer ETH:

```base
PRIVATE_KEY="YOUR PRIVATE KEY"
RPC="https://your.rpc/"
TO="Your destination"

bin/cli transfer -P $PRIVATE_KEY -R $RPC \
    -t $TO -T ether -a 0.001 -y --async 
```

Example of transfer ERC20 Token:

```base
PRIVATE_KEY="YOUR PRIVATE KEY"
RPC="https://your.rpc/"
TO="Your destination"
ERC20="Your Contract"

bin/cli transfer -P $PRIVATE_KEY -R $RPC \
    -c $ERC20    \
    -t $TO -T erc20 -a 0.001 -y --async 
```

Example of transfer NFT:

```text
# TODO 

```

### 3 Airdrop Token / Coin

Usage:

```text
 Usage: web3 airdrop [options]

Airdrop erc20 tokens / ethers to multiple addresses

Options:
  -R, --rpc <rpc>                                      RPC URL
  -P, --privateKey <privateKey>                        Private key
  -f, --file <file>                                    File path of addresses and amount
  -b, --batchTransferContract <batchTransferContract>  Batch transfer contract address(apply only for erc20)
  -c, --contract <contract>                            Contract address of token(apply only for erc20)
  -G, --gasOnly                                        Only get gas estimate (default: false)
  -n, --nonce <nonce>                                  Nonce
  -y, --yes                                            Skip confirmation (default: false)
  -h, --help                                           display help for command
  ```

  Example of airdrop ETH:

```base
PRIVATE_KEY="YOUR PRIVATE KEY"
RPC="https://your.rpc/"
AIRDROP_CONTRACT="THE AIRDROP CONTRACT" # See https://github.com/WhiteRiverBay/wrb-airdrop-contract

bin/cli airdrop -R $RPC -P $PRIVATE_KEY -b 0x4342B60a8B15666E51AEe90955c95aB5A31d9E06 -f /tmp/airdrop_coins.txt

# The /tmp/airdrop_coins.txt File Formatted: 
# $ADDRESS1 $AMOUNT1_IN_WEI
# $ADDRESS2 $AMOUNT2_IN_WEI
```

### 4 Allowance / Approve

Allowance USAGE:

```text
Usage: web3 allowance [options]

Get allowance of token

Options:
  -R, --rpc <rpc>            RPC URL
  -c, --contract <contract>  Contract address of token
  -a, --address <address>    Address to check allowance
  -t, --to <to>              Address to check allowance
  -h, --help                 display help for command
```

Example:

```bash
bin/cli allowance -R $RPC -c $ERC20 -a $ADDRESS -t $SPENDER
```

Approve USAGE:

```text
Usage: web3 approve [options]

Approve token

Options:
  -R, --rpc <rpc>                RPC URL
  -c, --contract <contract>      Contract address of token
  -a, --amount <amount>          Amount to approve
  -t, --to <to>                  Address to approve
  -P, --privateKey <privateKey>  Private key
  -y, --yes                      Skip confirmation (default: false)
  -A, --async                    Async transfer (default: false)
  -h, --help                     display help for command
```

Example:

```bash
bin/cli approve -R $RPC -c $ERC20 -a $AMOUNT_IN_ETHERS -P $PRIVATE_KEY -y -A

# OR UNLIMIT AMOUNT
bin/cli approve -R $RPC -c $ERC20 -P $PRIVATE_KEY -y -A
```

### 5 Swap With Uniswap V2 Contract

USAGE:

```text
Usage: web3 swapv2 [options]

Swap tokens using uniswap v2

Options:
  -R, --rpc <rpc>                RPC URL
  -w, --weth <weth>              WETH address
  -a0, --amount0 <amount0>       Amount of token0
  -a1, --amount1 <amount1>       Amount of token1
  -ei, --ethIn                   ETH in (default: false)
  -eo, --ethOut                  ETH out (default: false)
  -s, --slippage <slippage>      Slippage (default: 0.005)
  -r, --router <router>          Router address
  -P, --privateKey <privateKey>  Private key
  -q, --quoteOnly                quote   (default: false)
  -G, --gasOnly                  Only get gas estimate (default: false)
  -g, --gasPrice <gasPrice>      Gas price in gwei
  -pt, --path <path>             Path of token to swap, for example: token0,token1,token2, default is token0,token1
  -n, --nonce <nonce>            Nonce
  -y, --yes                      Skip confirmation (default: false)
  -f, --format <format>          Format of output (default: true)
  -A, --async                    Async transfer (default: false)
  -h, --help                     display help for command
```

1 Only Quote

```bash
# for exact output 
bin/cli swapv2 -a1 1 -s 0.01 -r $ROUTER_ADDRESS -pt $TOKEN0,$TOKEN1,$TOKEN2 -R $RPC -q

# for exact input
bin/cli swapv2 -a0 1 -s 0.01 -r $ROUTER_ADDRESS -pt $TOKEN0,$TOKEN1,$TOKEN2 -R $RPC -q
```

2 DO SWAP

```bash
#1 swapExactTokensForETH  
bin/cli swap -v v2 -a0 100 -r $ROUTER -pt $TOKEN0,$TOKEN1 -R $RPC -P $PRIVATE_KEY -eo

#2 swapTokensForExactETH 
# 0.002 eth
bin/cli swapv2 -a1 0.002 -r $ROUTER -pt $TOKEN0,$TOKEN1 -R $RPC -P $PRIVATE_KEY -eo

#3 swapExactETHForTokens 
bin/cli swapv2 -a0 0.002 -r $ROUTER -pt $TOKEN0,$TOKEN1 -R $RPC -P $PRIVATE_KEY -ei

#4 swapETHForExactTokens 
bin/cli swapv2 -a1 50 -r $ROUTER -pt $TOKEN0,$TOKEN1 -R $RPC -P $PRIVATE_KEY -ei

#5 swapExactTokensForTokens 
bin/cli swapv2 -a0 100 -r $ROUTER -pt $TOKEN0,$TOKEN1,$TOKEN1 -R $RPC -P $PRIVATE_KEY

#6 swapTokensForExactTokens
bin/cli swapv2 -a1 1 -r $ROUTER -pt $TOKEN0,$TOKEN1,$TOKEN1 -R $RPC -P $PRIVATE_KEY
```

### 6 Create Merkle Tree / Get Proof

Create Merkle Tree:

USAGE:

```text
Usage: web3 create-merkle-tree [options]

Generate merkle tree

Options:
  -f, --file <file>      File path of addresses and amount
  -o, --output <output>  Output file path (default: "merkle-tree.json")
  -h, --help             display help for command
```

Example:

```bash
# the file -f spec formatted: $ADDRESS $AMOUNT each line
bin/cli create-merkle-tree -f /tmp/account_and_balance.txt -o /tmp/tree.json
```

Get Proof:

```text
Usage: web3 get-merkle-proof [options]

Get merkle proof

Options:
  -f, --file <file>        Tree file path
  -a, --address <address>  Address to get proof
  -h, --help               display help for command
```

Example:

```bash
bin/cli get-merkle-proof -f $JSON_FILE_GENERATED_BY_CREATE -a $ADDRESS_YOU_WANT_PROOF
```

Verify in Solidity:

```solidity
// ...
// @see https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/MerkleProof.sol

// ...
import "./support/cryptography/MerkleProof.sol";
// ...

bytes32 public root;

function isValid(
    bytes32[] memory proof,
    address addr,
    uint256 amount
) public view returns (bool) {
    bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(addr, amount))));
    return MerkleProof.verify(proof, root, leaf);
}
```

### 7 Sign a message by private key

Usage:

```text
Usage: web3 sign [options]

Sign message by private key or verify signature

Options:
  -P, --privateKey <privateKey>  Private key
  -m, --message <message>        Message to sign
  -f, --file <file>              File path of message, if file is provided, message will be read from file
  -s, --sign <sign>              signature of message
  -H, --hex                      Message is hex, if this option is not provided, message will be treated automatically as hex or string
                                 (depend on the message starts with 0x or not)
  -p, --publicKey <publicKey>    Check public key (apply only if the mode is verify)
  -M, --mode <mode>              Mode of signature [sign, verify]
  -h, --help                     display help for command
```

Example Of Sign:

```bash
# SIGN TEXT:
bin/cli sign -P $PRIVATE_KEY -m $MESSAGE -M sign

# SIGN HEX: 
bin/cli sign -P $PRIVATE_KEY -m $MESSAGE -M sign -H
```

Example Of Verify

```bash
# VERIFY TEXT:
bin/cli sign -m $MESSAGE -M verify --sign $SIGNATURE

# VERIFY HEX: 
bin/cli sign -m $MESSAGE -M verify --sign $SIGNATURE -H
```

### 8 Contract - Invoke

USAGE:

```text
Usage: web3 invoke [options]

Call contract method

Options:
  -R, --rpc <rpc>                RPC URL
  -c, --contract <contract>      Contract address
  -m, --method <method>          Method name
  -a, --args <ags>              Arguments of method
  -P, --privateKey <privateKey>  Private key
  -n, --nonce <nonce>            Nonce
  -g, --gasPrice <gasPrice>      Gas price in gwei
  -l, --gasLimit <gasLimit>      Gas limit
  -G, --gasOnly                  Only get gas estimate (default: false)
  -y, --yes                      Skip confirmation (default: false)
  -b, --abiFile <abiFile>        ABI file path
  -A, --async                    Async transfer (default: false)
  -h, --help                     display help for command
```

example:

```bash
bin/cli invoke -R $RPC \
    -c $CONTRACT \
    -m $METHOD_NAME \
    -P $PRIVATE_KEY \
    --abiFile $ABI_FILE \
    -a "$ARGS"
```

### 9 Contract - Static Call

To be continued
