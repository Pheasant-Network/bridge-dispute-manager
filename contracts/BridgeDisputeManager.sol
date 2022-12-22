// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import {SolRLPDecoder} from "./SolRLPDecoder.sol";
import "hardhat/console.sol";

interface CheckPointManagerInterface{
  function getBlockHash(uint _blockNumber) external view returns(bytes32);
}

contract BridgeDisputeManager {
  constructor(address _checkPointManager) {
      checkPointManager = CheckPointManagerInterface(_checkPointManager);
  }

  CheckPointManagerInterface internal checkPointManager;
  bytes constant TX_TYPE2 = hex"02";
  uint constant ACCESSLIST = 8;
  uint256 constant TRANSACTION_TO_INDEX = 5;
  uint256 constant TRANSACTION_VALUE_INDEX = 6;


  function verifyBlockHeader(bytes32  blockHash, bytes[] calldata blockHeaderRaw) public pure returns (bool){
      return blockHash == keccak256(rlpEncode(blockHeaderRaw, false));
  }

   function composeTx(bytes[] memory item) public pure returns(bytes memory){
       bytes memory encodedTx = rlpEncode(item, true);
       return bytes.concat(TX_TYPE2, encodedTx);
   }

   function verifyRawTx(bytes memory transaction, bytes[] calldata txRaw) public pure returns(bool){
       return keccak256(transaction) == keccak256(composeTx(txRaw));
   }


  function encodeBytes(bytes memory self) internal pure returns (bytes memory) {
      bytes memory encoded;
      if (self.length == 1 && uint8(self[0]) <= 128) {
          encoded = self;
      } else {
          encoded = bytes.concat(encodeLength(self.length, 128), self);
      }
      return encoded;
  }


  function encodeLength(uint len, uint offset) internal pure returns (bytes memory) {
      bytes memory encoded;
      if (len < 56) {
          encoded = new bytes(1);
          encoded[0] = bytes32(len + offset)[31];
      } else {
          uint lenLen;
          uint i = 1;
          while (len / i != 0) {
              lenLen++;
              i *= 256;
          }

          encoded = new bytes(lenLen + 1);
          encoded[0] = bytes32(lenLen + offset + 55)[31];
          for(i = 1; i <= lenLen; i++) {
              encoded[i] = bytes32((len / (256**(lenLen-i))) % 256)[31];
          }
      }
      return encoded;
  }

   function verifyBlockHash(bytes32  _blockHash, uint _blockNumber) public view returns (bool){
      require(checkPointManager.getBlockHash(_blockNumber) != bytes32(0), "Relay blockhash first!");
      return checkPointManager.getBlockHash(_blockNumber) == _blockHash;
   }

   function verifyTxSignature(address from, bytes[] calldata txRaw) public pure returns(bool){
      uint length = txRaw.length - 3;
       bytes[] memory unsignedRawTx = new bytes[](length);
       for(uint i = 0; i < length; i++) {
           unsignedRawTx[i] = txRaw[i];
       }
       bytes memory composedUnsignedTx = composeTx(unsignedRawTx);
       bytes32 message = keccak256(composedUnsignedTx);

       bytes32 r;
       bytes memory tmpR = txRaw[10];
       assembly {
         r := mload(add(tmpR, 32))
       }

       bytes32 s;
       bytes memory tmpS = txRaw[11];
       assembly {
         s := mload(add(tmpS, 32))
       }

       uint8 v = 0;
       if(keccak256(txRaw[9]) == keccak256(hex"01")) {
           v = 28;
       } else {
           v = 27;
       }

       return from == ecrecover(message, v, r, s);
   }

   function rlpEncode(bytes[] memory item, bool isTxEncode) public pure returns(bytes memory){
      uint length = item.length;
      bytes memory result;
      for(uint i = 0; i < length ;i++) {
          if(i == ACCESSLIST && isTxEncode) {
              result = bytes.concat(result, hex"c0"); //empty accessList
          } else {
              result = bytes.concat(result, encodeBytes(item[i]));
          }
      }
      bytes memory prefix = encodeLength(result.length, 192);
      return bytes.concat(prefix, result);
  }

  function verifyProof(bytes32 txHash, bytes[] memory proof, bytes memory bytesRoot, uint8[] memory path) public pure returns (bool){
      bytes32 root;
      bytes memory tmpRoot = bytesRoot;
      assembly {
        root := mload(add(tmpRoot, 32))
      }

      uint length = proof.length;
      uint pathIndex = 0;
      bytes32 next;
      bytes memory encodedResult;
      if(root != keccak256(proof[0])) return false; // Invalid Tx Root
      for(uint i = 0; i < length; i++) {
          bytes[] memory result = decodeNode(proof[i]);
          if(i != 0) {
              if (keccak256(proof[i]) != next) return false; // Invalid Proof
          }
          if(result.length == 17) {
              if(i == length - 1) {
                  encodedResult = result[16];
              } else {
                  next = bytes32(result[path[pathIndex]]);
                  pathIndex++;
              }
          }else if(result.length == 2) {
              uint8[] memory nibble = bufferToNibble(result[0]);
              uint offset = 0;
              if (nibble[0] > 1) {
                  if(nibble[0] == 2) {
                      offset = 2;
                  }else if(nibble[0] == 3) {
                      offset = 1;
                  }
                  encodedResult = result[1];
              } else {
                  if(nibble[0] == 0) {
                      offset = 2;
                  }else if(nibble[0] == 1) {
                      offset = 1;
                  }
                  next = bytes32(result[1]);
              }
              for(uint j = offset; j < nibble.length; j++) {
                  if(path[pathIndex] != nibble[j]) return false; //Invalid Path
                  pathIndex++;
              }
          } else {
              revert();
          }
      }

      return txHash == keccak256(encodedResult);
  }

  function bufferToNibble(bytes memory buffer) internal pure returns(uint8[] memory){
      uint size = buffer.length;
      uint8[] memory nibbles = new uint8[](size * 2);
      for(uint i = 0;  i < buffer.length; i++ ){
          uint q = i * 2;
          nibbles[q] = uint8(buffer[i] >> 4);
          ++q;
          bytes1 tmp = buffer[i] << 4;
          nibbles[q] = uint8(tmp >> 4);
      }
      return nibbles;
  }

  function checkTransferTx(
      bytes calldata transaction,
      address recipient,
      uint256 amount
  ) public pure returns (bool) {
      bytes[] memory decodedTx = decodeNode(transaction[1:]);
      bytes memory value = decodedTx[TRANSACTION_VALUE_INDEX];
      bytes memory to = decodedTx[TRANSACTION_TO_INDEX];
      bytes memory prefix = new bytes(32 - value.length);
      return toAddress(to, 0) == recipient && toUint256(bytes.concat(prefix, value), 0) >= amount;
  }

  function toUint256(bytes memory _bytes, uint256 _start) internal pure returns (uint256) {
      require(_bytes.length >= _start + 32, "toUint256_outOfBounds");
      uint256 tempUint;

      assembly {
          tempUint := mload(add(add(_bytes, 0x20), _start))
      }

      return tempUint;
  }

  function toAddress(bytes memory _bytes, uint256 _start) internal pure returns (address) {
      require(_bytes.length >= _start + 20, "toAddress_outOfBounds");
      address tempAddress;

      assembly {
          tempAddress := div(mload(add(add(_bytes, 0x20), _start)), 0x1000000000000000000000000)
      }

      return tempAddress;
  }

  function decodeNode(bytes memory item) public pure returns (bytes[] memory ){
      return SolRLPDecoder.decode(item);
  }

}
