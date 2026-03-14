/** @type import('hardhat/config').HardhatUserConfig */
// require("@nomiclabs/hardhat-waffle") 
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("dotenv").config()

module.exports = {
  solidity: "0.8.20",

  networks: {

    hardhat: {},

    sepolia: {
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }

  }
}
