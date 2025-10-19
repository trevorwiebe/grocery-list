const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroceryListSchema = new Schema({
    title: String,
    dateCreated: Date,
    items: [{ type: Schema.Types.ObjectId, ref: 'Item' }]
})
const GroceryList = mongoose.model('GroceryList', GroceryListSchema);

module.exports = GroceryList;