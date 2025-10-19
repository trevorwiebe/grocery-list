const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        required: true
    },
    category: {type: Schema.Types.ObjectId, ref: 'Category'},
    subCategory: {type: Schema.Types.ObjectId, ref: 'SubCategory'}
})
const Item = mongoose.model('Item', ItemSchema);

module.exports = Item;