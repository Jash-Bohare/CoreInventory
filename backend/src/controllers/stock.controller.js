const mongoose = require("mongoose")
const Stock = require("../models/stock.model")

// GET /api/products/:id/stock
exports.getProductStock = async (req, res) => {
  try {
    const productId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" })
    }

    const stocks = await Stock.find({ productId })
      .populate("warehouseId")
      .select("qty warehouseId updatedAt")
      .sort({ qty: -1 })

    const totalQty = stocks.reduce((sum, s) => sum + (s.qty || 0), 0)

    res.json({
      productId,
      totalQty,
      locations: stocks.map(s => ({
        warehouseId: s.warehouseId?._id,
        warehouseName: s.warehouseId?.name,
        location: s.warehouseId?.location,
        qty: s.qty,
        updatedAt: s.updatedAt
      }))
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}