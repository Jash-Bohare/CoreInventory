const Product = require("../models/product.model")
const Stock = require("../models/stock.model")
const StockMovement = require("../models/stockMovement.model")

// GET /api/dashboard/summary
exports.getSummary = async (req, res) => {

  try {

    // total unique products
    const totalProducts = await Product.countDocuments()

    // low stock items (qty <= 10 for MVP)
    const lowStock = await Stock.countDocuments({
      qty: { $lte: 10 }
    })

    // total receipts
    const pendingReceipts = await StockMovement.countDocuments({
      type: "receipt"
    })

    // total deliveries
    const pendingDeliveries = await StockMovement.countDocuments({
      type: "delivery"
    })

    // total transfers
    const transfersScheduled = await StockMovement.countDocuments({
      type: "transfer"
    })

    res.json({
      totalProducts,
      lowStock,
      pendingReceipts,
      pendingDeliveries,
      transfersScheduled
    })

  } catch (error) {

    res.status(500).json({ message: error.message })

  }

}


// GET /api/dashboard/recent-movements
exports.getRecentMovements = async (req, res) => {

  try {

    const limit = parseInt(req.query.limit || "10")

    const movements = await StockMovement.find()
      .populate("productId")
      .populate("fromWarehouseId")
      .populate("toWarehouseId")
      .sort({ createdAt: -1 })
      .limit(limit)

    const hashMovement = require("../utils/hashMovement");
    const data = movements.map(m => {
        const obj = m.toJSON();
        if (obj.canonicalHash) {
            obj.tampered = hashMovement(m) !== obj.canonicalHash;
        }
        return obj;
    });

    res.json(data)

  } catch (error) {

    res.status(500).json({ message: error.message })

  }

}


// GET /api/dashboard/low-stock?threshold=10&limit=20
exports.getLowStock = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold || "10")
    const limit = parseInt(req.query.limit || "20")

    const items = await Stock.find({ qty: { $lte: threshold } })
      .populate("productId")
      .populate("warehouseId")
      .sort({ qty: 1 })
      .limit(limit)

    const results = items.map(s => ({
      productId: s.productId?._id,
      productName: s.productId?.name,
      sku: s.productId?.sku,
      warehouseId: s.warehouseId?._id,
      warehouseName: s.warehouseId?.name,
      location: s.warehouseId?.location,
      qty: s.qty,
      threshold
    }))

    res.json({
      count: results.length,
      threshold,
      data: results
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}