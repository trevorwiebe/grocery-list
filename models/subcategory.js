const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubCategorySchema = new Schema({name: String})
const SubCategory = mongoose.model('SubCategory', SubCategorySchema);

module.exports = SubCategory;
