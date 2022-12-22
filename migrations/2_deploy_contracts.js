const TestToken = artifacts.require("TestToken");
const TestCheckPointManager = artifacts.require("TestCheckPointManager");
const BridgeDisputeManager = artifacts.require("BridgeDisputeManager");
const DisputeHelper = artifacts.require("DisputeHelper");
const RLPDecoder = artifacts.require("RLPDecoder");
const DecoderHelper = artifacts.require("DecoderHelper");
const utils = require('../script/utils')
const mainContractPath = "../v1-contracts/";

module.exports = function(deployer, network, accounts) {

  let contractAddressObj = utils.getContractAddresses()
  let mainContractAddressObj = utils.getContractAddresses(mainContractPath)
  deployer.then(async() => {
    if (network == "development") {
      await deployer.deploy(RLPDecoder);
      await deployer.deploy(TestCheckPointManager);
      await deployer.link(RLPDecoder, BridgeDisputeManager);
      await deployer.link(RLPDecoder, DisputeHelper);
      await deployer.deploy(TestToken, accounts[0]);
      await deployer.link(RLPDecoder, DecoderHelper);
      await deployer.deploy(DecoderHelper);


      const testCheckPointManager = await TestCheckPointManager.deployed();
      await deployer.deploy(BridgeDisputeManager, testCheckPointManager.address);
      await deployer.deploy(DisputeHelper, testCheckPointManager.address);

    } else if(network == "mumbai" || network == "polygon") {
      await deployer.deploy(RLPDecoder);
      await deployer.link(RLPDecoder, BridgeDisputeManager);
      await deployer.deploy(BridgeDisputeManager, mainContractAddressObj[network].PolygonChildCheckPointManager);
    }

    if(contractAddressObj[network] == undefined) {
      contractAddressObj[network] = {}
    }
    contractAddressObj[network].BridgeDisputeManager = BridgeDisputeManager.address;
    utils.writeContractAddresses(contractAddressObj)


  });
};
