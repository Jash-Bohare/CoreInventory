const mongoose = require("mongoose")

const anchorSchema = new mongoose.Schema(
{
    merkleRoot: {
        type: String,
        required: true
    },

    movementIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StockMovement"
        }
    ],

    txHash: String,

    blockNumber: Number,

    chain: {
        type: String,
        default: "sepolia"
    }

},
{
    timestamps: true
})

module.exports = mongoose.model("Anchor", anchorSchema)