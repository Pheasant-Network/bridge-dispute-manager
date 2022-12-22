require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  console.log(process.env.PROVIDER_MUMBAI);
  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    hardhat: {},
    polygon: {
      url: process.env.PROVIDER_POLYGON || "https://polygon-rpc.com",
      accounts: {mnemonic: process.env.MNEMONIC ||
          'myth like bonus scare over problem client lizard pioneer submit female collect', //dummy, do not use it!
      },
      gasPrice: 800000000000,
      chainId: 137,
    },
    mumbai: {
      url: process.env.PROVIDER_MUMBAI || 'https://rpc-mumbai.matic.today',
      chainId: 80001,
      gasPrice: 10000000000,
      accounts: {
        mnemonic:
          process.env.MNEMONIC ||
          'myth like bonus scare over problem client lizard pioneer submit female collect', //dummy, do not use it!
      },
    },
    optimismGoerli: {
      url: process.env.PROVIDER_OPTIMISM_GOERLI,
      chainId: 420,
      //gasPrice: 30000000000,
      accounts: { mnemonic: process.env.MNEMONIC }
    },
    optimism: {
      url: process.env.PROVIDER_OPTIMISM,
      chainId: 10,
      //gasPrice: 30000000000,
      accounts: { mnemonic: process.env.MNEMONIC }
    },

  },
  solidity: {
    compilers: [{ version: '0.8.9' }, { version: '0.6.12' }],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
