const express = require("express")
const router = express.Router()

const {
  getSummary,
  getRecentMovements,
  getLowStock
} = require("../controllers/dashboard.controller")

router.get("/summary", getSummary)

router.get("/recent-movements", getRecentMovements)

router.get("/low-stock", getLowStock)

module.exports = router