const crypto = require("crypto")

const hashMovement = (movement) => {

    const canonical = JSON.stringify({
        type: movement.type,
        productId: movement.productId,
        qty: movement.qty,
        from: movement.fromWarehouseId || null,
        to: movement.toWarehouseId || null,
        timestamp: new Date().toISOString()
    })

    return crypto.createHash("sha256").update(canonical).digest("hex")
}

module.exports = hashMovement