// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken  is ERC20{
  constructor(address owner) ERC20("TestToken", "TST") {
    _mint(owner, 1000000000000000000000000000);
  }


}
