const express = require("express")
const router = express.Router()

const {
createReceipt,
createDelivery,
createTransfer,
createAdjustment
} = require("../controllers/movement.controller")
const { getMovements } = require("../controllers/movement.controller")

router.get("/", getMovements)

router.post("/receipt", createReceipt)

router.post("/delivery", createDelivery)

router.post("/transfer", createTransfer)

router.post("/adjustment", createAdjustment)

module.exports = router