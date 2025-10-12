const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroceryListSchema = new Schema({
    title: String,
    dateCreated: Date,
    items: [{ type: Schema.Types.ObjectId, ref: 'Item' }]
})
const GroceryList = mongoose.model('GroceryList', GroceryListSchema);

const ItemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        required: true
    },
    subCategoryId: String
})
const Item = mongoose.model('Item', ItemSchema);

const CategorySchema = new Schema({
    name: String,
    subCategories: [{ type: Schema.Types.ObjectId, ref: 'SubCategory'}]
})
const Category = mongoose.model('Category', CategorySchema);

const SubCategorySchema = new Schema({
    name: String
})
const SubCategory = mongoose.model('SubCategory', SubCategorySchema);

module.exports = { 
    GroceryList,
    Item,
    Category,
    SubCategory
 };
