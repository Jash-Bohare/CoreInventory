const contract = require("./src/utils/blockchain")

async function test() {

  const root = "0x" + "1".repeat(64)

  const tx = await contract.anchor(root)

  console.log("tx sent:", tx.hash)

  const receipt = await tx.wait()

  console.log("confirmed:", receipt.blockNumber)

}

test()