const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Item = require('./item');

const SubCategorySchema = new Schema({name: String})

SubCategorySchema.post('findOneAndDelete', async function (subCat){
    if (subCat) {
        await Item.deleteMany({ subCategory: subCat._id });
    }
})

const SubCategory = mongoose.model('SubCategory', SubCategorySchema);

module.exports = SubCategory;
