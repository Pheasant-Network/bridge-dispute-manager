// SPDX-License-Identifier: MIT
pragma solidity <0.9.0;
pragma experimental ABIEncoderV2;
//import "solidity-rlp/contracts/RLPReader.sol";
import "./RLPReader.sol";

library SolRLPDecoder {
    using RLPReader for RLPReader.RLPItem;
    using RLPReader for bytes;

    function decode(bytes calldata input) public pure returns (bytes[] memory) {
        RLPReader.RLPItem memory item = input.toRlpItem();

        if (RLPReader.isList(item)) {
            RLPReader.RLPItem[] memory list = item.toList();
            bytes[] memory data = new bytes[](list.length);
            for (uint256 i = 0; i < list.length; i++) {
                data[i] = list[i].toBytes();
            }
            return data;
        } else {
            bytes[] memory data = new bytes[](1);
            data[0] = item.toBytes();
            return data;
        }
    }
}
