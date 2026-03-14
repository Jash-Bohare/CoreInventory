const Product = require("../models/product.model")

exports.createProduct = async (req, res) => {
    try {

        const { name, sku, category, unit } = req.body

        const product = await Product.create({
            name,
            sku,
            category,
            unit
        })

        res.status(201).json(product)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


exports.getProducts = async (req, res) => {
    try {

        const products = await Product.find()

        res.json(products)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


exports.getProductById = async (req, res) => {
    try {

        const product = await Product.findById(req.params.id)

        res.json(product)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


exports.updateProduct = async (req, res) => {
    try {

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )

        res.json(product)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


exports.deleteProduct = async (req, res) => {
    try {

        await Product.findByIdAndDelete(req.params.id)

        res.json({ message: "Product deleted" })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}