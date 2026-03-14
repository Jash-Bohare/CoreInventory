const crypto = require("crypto")

const extractId = (val) => {
    if (!val) return null;
    return val._id ? val._id.toString() : val.toString();
}

const hashMovement = (movement) => {
    const canonical = JSON.stringify({
        type: movement.type,
        productId: extractId(movement.productId),
        qty: parseFloat(movement.qty), // force float comparison logic just in case DB changes type
        from: extractId(movement.fromWarehouseId || movement.from),
        to: extractId(movement.toWarehouseId || movement.to)
    })

    return crypto.createHash("sha256").update(canonical).digest("hex")
}

module.exports = hashMovement