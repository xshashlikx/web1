const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderSchema = new Schema({
    name: String,
    hostel: String,
    roomNo: String,
    phone: String,
    size: String,
    success: false,
    amount: Number,
    orderId: String,
    paymentMode: String,
    custId: String,
    transactionDate: Date,
    status: String,
    transactionId: String,
    gatewayCode: String,
    bankTXNID: String,
    bankName: String,
    productName: String,
    responseMessage: String,
    checkhash: String,
    productStatus: {
        type: String,
        default: 'We working on your order. We will let you know soon'
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'product'
    }
}, {
    timestamps: true
})
module.exports = Order = mongoose.model('orders', orderSchema)