const hre = require("hardhat");
const utils = require('./utils')
const childCheckPointManagerAbi = require('../abi/PolygonChildCheckPointManager.json')
const optimismChildCheckPointManagerAbi = require('../abi/OptimismChildCheckPointManager.json')
const arbitrumChildCheckPointManagerAbi = require('../abi/ArbitrumChildCheckPointManager.json')
const mainContractPath = "../v1-contracts-polygon/";
const optimismMainContractPath = "../v1-contracts-optimism/";
const arbitrumMainContractPath = "../v1-contracts-arbitrum/";

async function main() {
  let contractAddressObj = utils.getContractAddresses()
  //let mainContractAddressObj = utils.getContractAddresses(mainContractPath)
  const accounts = await ethers.getSigners();
  console.log("Network name =", hre.network.name);
  let childCheckPointManagerAddress = "";
  //let optimismChildCheckPointManagerAddress = "";
  let provider = "";

  if (hre.network.name == "localhost") {
    const TestCheckPointManager = await hre.ethers.getContractFactory("TestCheckPointManager");
    const testCheckPointManager = await TestCheckPointManager.deploy();
    polygonChildCheckPointManagerAddress = testCheckPointManager.address;

  } else if (hre.network.name == "mumbai" || hre.network.name == "polygon") {
    let mainContractAddressObj = utils.getContractAddresses(mainContractPath)
    childCheckPointManagerAddress = mainContractAddressObj[hre.network.name].PolygonChildCheckPointManager;
    const polygonChildCheckPointManager = await hre.ethers.getContractAt(childCheckPointManagerAbi, childCheckPointManagerAddress);
    const rootTunnel = await polygonChildCheckPointManager.fxRootTunnel();
    if (rootTunnel == "0x0000000000000000000000000000000000000000") {
      console.log("CheckPointManager doesn't inilialize!! Set tunnels first!");
      return;
    }
    if (hre.network.name == "mumbai") {
      provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_MUMBAI);
    } else if (hre.network.name == "polygon") {
      provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_POLYGON);
    }
  } else if (hre.network.name == "optimismGoerli" || hre.network.name == "optimism") {
    let mainContractAddressObj = utils.getContractAddresses(optimismMainContractPath)
    childCheckPointManagerAddress = mainContractAddressObj[hre.network.name].OptimismChildCheckPointManager;
    const optimismChildCheckpointManager = await hre.ethers.getContractAt(optimismChildCheckPointManagerAbi, childCheckPointManagerAddress);
    const rootTunnel = await optimismChildCheckpointManager.rootCheckpointManager();
    if (rootTunnel == "0x0000000000000000000000000000000000000000") {
      console.log("CheckPointManager doesn't inilialize!! Set tunnels first!");
      return;
    }
    if (hre.network.name == "optimismGoerli") {
      provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_OPTIMISM_GOERLI);
    } else if (hre.network.name == "optimism") {
      provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_OPTIMISM);
    }

  } else if (hre.network.name == "arbitrumGoerli" || hre.network.name == "arbitrum") {
    let mainContractAddressObj = utils.getContractAddresses(arbitrumMainContractPath)
    childCheckPointManagerAddress = mainContractAddressObj[hre.network.name].ArbitrumChildCheckPointManager;
    const arbitrumChildCheckpointManager = await hre.ethers.getContractAt(arbitrumChildCheckPointManagerAbi, childCheckPointManagerAddress);
    const rootTunnel = await arbitrumChildCheckpointManager.rootCheckpointManager();
    if (rootTunnel == "0x0000000000000000000000000000000000000000") {
      console.log("CheckPointManager doesn't inilialize!! Set tunnels first!");
      return;
    }
    if (hre.network.name == "arbitrumGoerli") {
      provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_ARBITRUM_GOERLI);
    } else if (hre.network.name == "arbitrum") {
      provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_ARBITRUM);
    }

  }

  //const RLPDecoder = await hre.ethers.getContractFactory("RLPDecoder");
  const RLPDecoder = await hre.ethers.getContractFactory("SolRLPDecoder");
  const rlpDecoder = await RLPDecoder.deploy();
  const BridgeDisputeManager = await hre.ethers.getContractFactory("BridgeDisputeManager", {
    libraries: {
      SolRLPDecoder: rlpDecoder.address,
    },
  });

  const price = await provider.getGasPrice();
  console.log("gas price: ", price);
  const bridgeDisputeManager = await BridgeDisputeManager.connect(accounts[0]).deploy(childCheckPointManagerAddress, { gasPrice: price });
  console.log("BridgeDisputeManager TxHash:", bridgeDisputeManager.deployTransaction.hash);
  await bridgeDisputeManager.deployed();
  console.log("BridgeDisputeManager address:", bridgeDisputeManager.address);

  contractAddressObj[hre.network.name].BridgeDisputeManager = bridgeDisputeManager.address;
  utils.writeContractAddresses(contractAddressObj)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
