const mongoose = require("mongoose")
const Stock = require("../models/stock.model")
const StockMovement = require("../models/stockMovement.model")
const hashMovement = require("../utils/hashMovement")

exports.createReceipt = async (req, res) => {

    const session = await mongoose.startSession()

    try {

        const { productId, warehouseId, qty } = req.body

        if (qty <= 0) {
            return res.status(400).json({ message: "Invalid quantity" })
        }

        session.startTransaction()

        let stock = await Stock.findOne({
            productId,
            warehouseId
        }).session(session)

        if (!stock) {
            stock = await Stock.create([{
                productId,
                warehouseId,
                qty: 0
            }], { session })

            stock = stock[0]
        }

        stock.qty += qty
        await stock.save({ session })

        const hash = hashMovement({
            type: "receipt",
            productId,
            qty,
            toWarehouseId: warehouseId
        })

        const movement = await StockMovement.create([{
            type: "receipt",
            productId,
            qty,
            toWarehouseId: warehouseId,
            canonicalHash: hash
        }], { session })

        await session.commitTransaction()

        res.json(movement)

    } catch (error) {

        await session.abortTransaction()

        res.status(500).json({ message: error.message })

    } finally {

        session.endSession()

    }

}

exports.createDelivery = async (req, res) => {

    const session = await mongoose.startSession()

    try {

        const { productId, warehouseId, qty } = req.body

        if (qty <= 0) {
            return res.status(400).json({ message: "Invalid quantity" })
        }

        session.startTransaction()

        const stock = await Stock.findOne({
            productId,
            warehouseId
        }).session(session)

        if (!stock || stock.qty < qty) {
            return res.status(400).json({ message: "Insufficient stock" })
        }

        stock.qty -= qty

        await stock.save({ session })

        const hash = hashMovement({
            type: "delivery",
            productId,
            qty,
            fromWarehouseId: warehouseId
        })

        const movement = await StockMovement.create([{
            type: "delivery",
            productId,
            qty,
            fromWarehouseId: warehouseId,
            canonicalHash: hash
        }], { session })

        await session.commitTransaction()

        res.json(movement)

    } catch (error) {

        await session.abortTransaction()

        res.status(500).json({ message: error.message })

    } finally {

        session.endSession()

    }

}

exports.createTransfer = async (req, res) => {

    const session = await mongoose.startSession()

    try {

        const { productId, fromWarehouseId, toWarehouseId, qty } = req.body

        session.startTransaction()

        const sourceStock = await Stock.findOne({
            productId,
            warehouseId: fromWarehouseId
        }).session(session)

        if (!sourceStock || sourceStock.qty < qty) {
            return res.status(400).json({ message: "Insufficient stock" })
        }

        sourceStock.qty -= qty
        await sourceStock.save({ session })

        let destStock = await Stock.findOne({
            productId,
            warehouseId: toWarehouseId
        }).session(session)

        if (!destStock) {
            destStock = await Stock.create([{
                productId,
                warehouseId: toWarehouseId,
                qty: 0
            }], { session })

            destStock = destStock[0]
        }

        destStock.qty += qty
        await destStock.save({ session })

        const hash = hashMovement({
            type: "transfer",
            productId,
            qty,
            fromWarehouseId,
            toWarehouseId
        })

        const movement = await StockMovement.create([{
            type: "transfer",
            productId,
            qty,
            fromWarehouseId,
            toWarehouseId,
            canonicalHash: hash
        }], { session })

        await session.commitTransaction()

        res.json(movement)

    } catch (error) {

        await session.abortTransaction()

        res.status(500).json({ message: error.message })

    } finally {

        session.endSession()

    }

}

exports.createAdjustment = async (req, res) => {

    const session = await mongoose.startSession()

    try {

        const { productId, warehouseId, countedQty } = req.body

        session.startTransaction()

        let stock = await Stock.findOne({
            productId,
            warehouseId
        }).session(session)

        if (!stock) {
            stock = await Stock.create([{
                productId,
                warehouseId,
                qty: 0
            }], { session })

            stock = stock[0]
        }

        const diff = countedQty - stock.qty

        stock.qty = countedQty

        await stock.save({ session })

        const hash = hashMovement({
            type: "adjustment",
            productId,
            qty: diff,
            toWarehouseId: warehouseId
        })

        const movement = await StockMovement.create([{
            type: "adjustment",
            productId,
            qty: diff,
            toWarehouseId: warehouseId,
            canonicalHash: hash
        }], { session })

        await session.commitTransaction()

        res.json(movement)

    } catch (error) {

        await session.abortTransaction()

        res.status(500).json({ message: error.message })

    } finally {

        session.endSession()

    }

}

exports.getMovements = async (req, res) => {

    try {

        const {
            type,
            status,
            productId,
            warehouseId,
            startDate,
            endDate,
            page = 1,
            limit = 10,
            sort = "desc"
        } = req.query

        const query = {}

        if (type) query.type = type

        if (status) query.status = status

        if (productId) query.productId = productId

        if (warehouseId) {
            query.$or = [
                { fromWarehouseId: warehouseId },
                { toWarehouseId: warehouseId }
            ]
        }

        if (startDate || endDate) {
            query.createdAt = {}

            if (startDate) query.createdAt.$gte = new Date(startDate)

            if (endDate) query.createdAt.$lte = new Date(endDate)
        }

        const skip = (page - 1) * limit

        const movements = await StockMovement.find(query)
            .populate("productId")
            .populate("fromWarehouseId")
            .populate("toWarehouseId")
            .sort({ createdAt: sort === "asc" ? 1 : -1 })
            .skip(skip)
            .limit(Number(limit))

        const hashMovement = require("../utils/hashMovement");
        const data = movements.map(m => {
            const obj = m.toJSON();
            if (obj.canonicalHash) {
                obj.tampered = hashMovement(m) !== obj.canonicalHash;
            }
            return obj;
        });

        const total = await StockMovement.countDocuments(query)

        res.json({
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data
        })

    } catch (error) {

        res.status(500).json({ message: error.message })

    }

}