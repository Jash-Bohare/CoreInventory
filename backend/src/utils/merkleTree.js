const { MerkleTree } = require("merkletreejs")
const keccak256 = require("keccak256")

function buildMerkle(hashes) {
  const leaves = hashes.map(h => keccak256(h))
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
  const root = tree.getRoot().toString("hex")

  function getProofFor(hash) {
    const leaf = keccak256(hash)
    const proof = tree.getHexProof(leaf)
    return proof
  }

  return { tree, root, getProofFor }
}

module.exports = buildMerkle