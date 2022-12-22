// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

contract TestCheckPointManager {
  mapping(uint => bytes32) public blockHashs;

  function getBlockHash(uint _blockNumber) external view returns(bytes32) {
    return blockHashs[_blockNumber];
  }

  function setBlockHash(uint _blockNumber, bytes32 _blockHash) public {
    blockHashs[_blockNumber] = _blockHash;
  }


}
