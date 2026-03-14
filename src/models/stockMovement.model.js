const mongoose = require("mongoose")

const stockMovementSchema = new mongoose.Schema(
{
    type: {
        type: String,
        enum: ["receipt", "delivery", "transfer", "adjustment"],
        required: true
    },

    status: {
        type: String,
        enum: ["draft", "validated"],
        default: "validated"
    },

    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    qty: {
        type: Number,
        required: true
    },

    fromWarehouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Warehouse"
    },

    toWarehouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Warehouse"
    },

    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    canonicalHash: {
        type: String
    }

},
{
    timestamps: true
})

stockMovementSchema.index({ createdAt: -1 })
stockMovementSchema.index({ productId: 1 })
stockMovementSchema.index({ fromWarehouseId: 1 })
stockMovementSchema.index({ toWarehouseId: 1 })
stockMovementSchema.index({ type: 1 })
stockMovementSchema.index({ status: 1 })

module.exports = mongoose.model("StockMovement", stockMovementSchema)