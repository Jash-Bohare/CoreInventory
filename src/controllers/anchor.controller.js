const StockMovement = require("../models/stockMovement.model")
const Anchor = require("../models/anchor.model")
const buildMerkle = require("../utils/merkleTree")
const contract = require("../utils/blockchain")
const keccak256 = require("keccak256")

exports.anchorBatch = async (req, res) => {

    try {

        const limit = parseInt(req.query.limit || "20")

        const movements = await StockMovement.find({
            canonicalHash: { $ne: null },
            anchored: { $ne: true }
        })
        .sort({ createdAt: -1 })
        .limit(limit)

        if (movements.length === 0) {
            return res.json({ message: "No movements to anchor" })
        }

        const hashes = movements.map(m => m.canonicalHash)

        const { root } = buildMerkle(hashes)

        const tx = await contract.anchor("0x" + root)

        const receipt = await tx.wait()

        const movementIds = movements.map(m => m._id)

        const anchor = await Anchor.create({
            merkleRoot: root,
            movementIds,
            txHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber
        })

        await StockMovement.updateMany(
            { _id: { $in: movementIds } },
            {
                anchored: true,
                anchorId: anchor._id
            }
        )

        res.json({
            root,
            txHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            movementCount: movements.length
        })

    } catch (error) {

        res.status(500).json({ message: error.message })

    }

}

exports.verifyMovement = async (req, res) => {

    try {

        const { movementId } = req.params

        const movement = await StockMovement.findById(movementId)

        if (!movement) {
            return res.status(404).json({ message: "Movement not found" })
        }

        if (!movement.anchorId) {
            return res.status(400).json({ message: "Movement not anchored yet" })
        }

        const anchor = await Anchor.findById(movement.anchorId)

        const movements = await StockMovement.find({
            _id: { $in: anchor.movementIds }
        })

        const hashes = movements.map(m => m.canonicalHash)

        const { tree } = buildMerkle(hashes)

        const leaf = keccak256(movement.canonicalHash)

        const proof = tree.getHexProof(leaf)

        res.json({
            movementId,
            movementHash: movement.canonicalHash,
            merkleRoot: anchor.merkleRoot,
            merkleProof: proof,
            txHash: anchor.txHash,
            explorer: `https://sepolia.etherscan.io/tx/${anchor.txHash}`
        })

    } catch (error) {

        res.status(500).json({ message: error.message })

    }

}