const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: String,
    subCategories: [{ type: Schema.Types.ObjectId, ref: 'SubCategory'}]
})
const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;