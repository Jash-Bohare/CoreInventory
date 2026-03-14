const express = require("express")
const cors = require("cors")

const authRoutes = require("./routes/auth.routes")
const productRoutes = require("./routes/product.routes")
const warehouseRoutes = require("./routes/warehouse.routes")
const movementRoutes = require("./routes/movement.routes")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/warehouses", warehouseRoutes)
app.use("/api/movements", movementRoutes)

module.exports = app