// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "./BridgeDisputeManager.sol";

contract DisputeHelper is BridgeDisputeManager{
  constructor(address _checkPointManager) BridgeDisputeManager(_checkPointManager) {
  }

  function helperBufferToNibble(bytes memory buffer) public pure returns(uint8[] memory){
      return super.bufferToNibble(buffer);
  }


}
