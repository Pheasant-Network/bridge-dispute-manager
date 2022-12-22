// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "./SolRLPDecoder.sol";
pragma experimental ABIEncoderV2;

contract DecoderHelper {

    function decode(bytes calldata input) public pure returns (bytes[] memory) {
        return SolRLPDecoder.decode(input);
    }

}
