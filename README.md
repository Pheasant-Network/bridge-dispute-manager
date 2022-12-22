# BridgeDisputeManager
This is a transaction verification library for use in EVM compatible networks.
In order to verify block hashes across layers, a contract is needed to store the block hashes. That is different for each network and should be implemented individually.

## Installation
1. `npm install bridgeDisputeManager` in the project directory. Make sure to install through npm for prompt updates!
2. `import "bridgeDisputeManager/contracts/BridgeDisputeManager.sol"` in the desired smart contract.

## Usage
The contract provides several functions to validate transactions.

1. `verifyBlockHash(bytes32  blockHash, uint blockNumber) bool` : Verify a blockhash
2. `verifyTxSignature(address from, bytes[] calldata txRaw) bool` : Verifies if the transaction signature is correct
3. `verifyProof(bytes32 txHash, bytes[] memory proof, bytes memory bytesRoot, uint8[] memory path) bytes memory` : Verifies the mark-proofing of the transaction. The return value is an encoded transaction; EIP 1559 or later is supported.
4. `verifyBlockHeader(bytes32  blockHash, bytes[] calldata blockHeaderRaw) bool` : Validates block headers stored in an array; EIP 1559 or later is supported.
5. `verifyRawTx(bytes memory transaction, bytes[] calldata txRaw) bool` : Validates a transaction stored in the array.

## Tests
1. `git clone https://github.com/recruitcojp/BridgeDisputeManager && cd BridgeDisputeManager`
2. `npm install`
3. `npm install -g truffle ganache-cli` installed globally for the dev envirnoment
4. `ganache-cli` run in a background process or seperate terminal window.
5. `truffle compile && truffle test`

# License
The source code is licensed MIT.
