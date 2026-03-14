const { ethers } = require("hardhat")

async function main() {

  const Anchor = await ethers.getContractFactory("AnchorRoot")

  const anchor = await Anchor.deploy()

  await anchor.deployed()

  console.log("AnchorRoot deployed to:", anchor.address)

}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})