const express = require("express")
const router = express.Router()

const {
createWarehouse,
getWarehouses,
updateWarehouse,
deleteWarehouse
} = require("../controllers/warehouse.controller")

router.post("/", createWarehouse)

router.get("/", getWarehouses)

router.put("/:id", updateWarehouse)

router.delete("/:id", deleteWarehouse)

module.exports = router