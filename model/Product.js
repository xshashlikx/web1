const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema({
    name: String,
    price: Number,
    imgFrot: String,
    imgBack: String,
    exclusive: Boolean
}, {
    timestamps: true
})

module.exports = Product = mongoose.model('product', productSchema)