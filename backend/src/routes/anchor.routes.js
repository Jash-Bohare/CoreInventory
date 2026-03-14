const express = require("express")
const router = express.Router()

const {
  anchorBatch,
  verifyMovement
} = require("../controllers/anchor.controller")

router.post("/batch", anchorBatch)

router.get("/verify/:movementId", verifyMovement)

module.exports = router