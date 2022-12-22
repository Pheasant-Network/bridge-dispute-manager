// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

library RLPDecoder {

  struct RLPItem {
      bytes data;
      uint length;
  }

  uint constant LIST_LENGTH = 20;

  //Nested Lists are not supported. 
  function decodeList(bytes calldata input) internal pure returns (bytes[] memory) {
    bytes1 firstByte = input[0];
    bytes memory innerRemainder;
    uint length = 0;
    if (firstByte <= hex"f7") {
      length = uint8(firstByte) - uint8(bytes1(hex"c0"));
      innerRemainder = slice(input, 1, length);
    } else {
      // a list  over 55 bytes long
      uint llength = uint8(firstByte) - uint8(bytes1(hex"f7"));
      length = toUintX(slice(input, 1, llength), 0);
      innerRemainder = slice(input, llength + 1, length);
      require(innerRemainder.length != 0);

    }
    uint listLength = 0;
    bytes[] memory decoded;
    uint index = 0;
    RLPItem memory result;
    while (innerRemainder.length > 0) {
      if(index == decoded.length) {
        bytes[] memory tmp = decoded;
        listLength += LIST_LENGTH;
        decoded = new bytes[](listLength);
        if(tmp.length != 0) {
          for(uint i = 0; i < tmp.length; i++ ){
            decoded[i] = tmp[i];
          }
        }
      }

      result = decodeBytes(innerRemainder);
      innerRemainder = slice(innerRemainder, result.length, innerRemainder.length - result.length);
      decoded[index] = result.data;
      index++;
    }

    bytes[] memory decodedList = new bytes[](index);
    for(uint i = 0; i < index; i++ ){
        decodedList[i] = decoded[i];
    }

   return decodedList;


  }

  function decodeBytes(bytes memory input) internal pure returns (RLPItem memory item) {
    bytes1 firstByte = input[0];
    if (firstByte <= hex"7f") {
      return RLPItem(bytes(slice(input, 0,1)), 1);
    }
    else if (firstByte <= hex"b7") {
      uint length = uint8(firstByte) - uint8(bytes1(hex"7f"));
      bytes memory data;
      if (firstByte == hex"80") {
          data = bytes("");
          item = RLPItem(data, 1);
      }
      else { 
          data = bytes(slice(input, 1, length - 1));
          item = RLPItem(data, length);
      }
      require(length != 2 || data[0] > hex"80");
      return item;
    }
    else if (firstByte <= hex"bf") {
      // string is greater than 55 bytes long. A single byte with the value (0xb7 plus the length of the length),
      // followed by the length, followed by the string
      uint llength = uint8(firstByte) - uint8(bytes1(hex"b7"));
      require(input.length > llength);
      uint length = toUintX(slice(input, 1, llength), 0);
      require(length > 55);
      item = RLPItem(slice(input, llength + 1, length), length + 2);
      return item;
    } else if (firstByte == hex"c0") { //accesslist not support
      bytes memory data;
      data = bytes("");
      item = RLPItem(data, 2);
      return item;
    }

  }

  function decode(bytes calldata input) public pure returns (bytes[] memory) {
    bytes1 firstByte = input[0];
    if (firstByte > hex"bf") {
        return decodeList(input);
    } else  {
        bytes[] memory data = new bytes[](1);
        data[0] = decodeBytes(input).data;
        return data;
    }
 
  }

  function toUintX(bytes memory _bytes, uint256 _start) public pure returns (uint) {

      require(_bytes.length > 0 && _bytes.length <= 8);
      if(_bytes.length == 1) {
          return toUint8(_bytes, _start);
      } else if(_bytes.length == 2) {
          return toUint16(_bytes, _start);
      } else if(_bytes.length == 3) {
          return toUint24(_bytes, _start);
      } else if(_bytes.length == 4) {
          return toUint32(_bytes, _start);
      } else if(_bytes.length == 5) {
          return toUint40(_bytes, _start);
      } else if(_bytes.length == 6) {
          return toUint48(_bytes, _start);
      } else if(_bytes.length == 7) {
          return toUint56(_bytes, _start);
      } else if(_bytes.length == 8) {
          return toUint64(_bytes, _start);
      }

      return toUint64(_bytes, _start);
  }


  function toUint24(bytes memory _bytes, uint256 _start) internal pure returns (uint24) {
    require(_bytes.length >= _start + 3, "toUint24_outOfBounds");
    uint24 tempUint;

    assembly {
        tempUint := mload(add(add(_bytes, 0x3), _start))
    }

    return tempUint;
  }

  function toUint40(bytes memory _bytes, uint256 _start) internal pure returns (uint40) {
    require(_bytes.length >= _start + 5, "toUint40_outOfBounds");
    uint40 tempUint;

    assembly {
        tempUint := mload(add(add(_bytes, 0x5), _start))
    }

    return tempUint;
  }

  function toUint48(bytes memory _bytes, uint256 _start) internal pure returns (uint48) {
    require(_bytes.length >= _start + 6, "toUint48_outOfBounds");
    uint48 tempUint;

    assembly {
        tempUint := mload(add(add(_bytes, 0x6), _start))
    }

    return tempUint;
  }

  function toUint56(bytes memory _bytes, uint256 _start) internal pure returns (uint56) {
    require(_bytes.length >= _start + 7, "toUint56_outOfBounds");
    uint56 tempUint;

    assembly {
        tempUint := mload(add(add(_bytes, 0x7), _start))
    }

    return tempUint;
  }

    function toUint8(bytes memory _bytes, uint256 _start) internal pure returns (uint8) {
        require(_bytes.length >= _start + 1 , "toUint8_outOfBounds");
        uint8 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x1), _start))
        }

        return tempUint;
    }

    function toUint16(bytes memory _bytes, uint256 _start) internal pure returns (uint16) {
        require(_bytes.length >= _start + 2, "toUint16_outOfBounds");
        uint16 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x2), _start))
        }

        return tempUint;
    }

    function toUint32(bytes memory _bytes, uint256 _start) internal pure returns (uint32) {
        require(_bytes.length >= _start + 4, "toUint32_outOfBounds");
        uint32 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x4), _start))
        }

        return tempUint;
    }

    function toUint64(bytes memory _bytes, uint256 _start) internal pure returns (uint64) {
        require(_bytes.length >= _start + 8, "toUint64_outOfBounds");
        uint64 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x8), _start))
        }

        return tempUint;
    }

    //solidity-bytes-utils/contracts/BytesLib.sol
    function slice(
        bytes memory _bytes,
        uint256 _start,
        uint256 _length
    )
        internal
        pure
        returns (bytes memory)
    {
        require(_length + 31 >= _length, "slice_overflow");
        require(_bytes.length >= _start + _length, "slice_outOfBounds");

        bytes memory tempBytes;

        assembly {
            switch iszero(_length)
            case 0 {
                // Get a location of some free memory and store it in tempBytes as
                // Solidity does for memory variables.
                tempBytes := mload(0x40)

                // The first word of the slice result is potentially a partial
                // word read from the original array. To read it, we calculate
                // the length of that partial word and start copying that many
                // bytes into the array. The first word we copy will start with
                // data we don't care about, but the last `lengthmod` bytes will
                // land at the beginning of the contents of the new array. When
                // we're done copying, we overwrite the full first word with
                // the actual length of the slice.
                let lengthmod := and(_length, 31)

                // The multiplication in the next line is necessary
                // because when slicing multiples of 32 bytes (lengthmod == 0)
                // the following copy loop was copying the origin's length
                // and then ending prematurely not copying everything it should.
                let mc := add(add(tempBytes, lengthmod), mul(0x20, iszero(lengthmod)))
                let end := add(mc, _length)

                for {
                    // The multiplication in the next line has the same exact purpose
                    // as the one above.
                    let cc := add(add(add(_bytes, lengthmod), mul(0x20, iszero(lengthmod))), _start)
                } lt(mc, end) {
                    mc := add(mc, 0x20)
                    cc := add(cc, 0x20)
                } {
                    mstore(mc, mload(cc))
                }

                mstore(tempBytes, _length)

                //update free-memory pointer
                //allocating the array padded to 32 bytes like the compiler does now
                mstore(0x40, and(add(mc, 31), not(31)))
            }
            //if we want a zero-length slice let's just return a zero-length array
            default {
                tempBytes := mload(0x40)
                //zero out the 32 bytes slice we are about to return
                //we need to do it because Solidity does not garbage collect
                mstore(tempBytes, 0)

                mstore(0x40, add(tempBytes, 0x20))
            }
        }

        return tempBytes;
    }
}
