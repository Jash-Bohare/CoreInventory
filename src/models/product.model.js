const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true
    },

    sku: {
        type: String,
        required: true,
        unique: true
    },

    category: {
        type: String
    },

    unit: {
        type: String,
        default: "units"
    }

},
{
    timestamps: true
})

module.exports = mongoose.model("Product", productSchema)