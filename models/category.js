const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Item = require('./item');
const SubCategory = require('./subcategory');

const CategorySchema = new Schema({
    name: String,
    subCategories: [{ type: Schema.Types.ObjectId, ref: 'SubCategory'}]
})

CategorySchema.post('findOneAndDelete', async function (cat){
    if (cat) {
        await Item.deleteMany({ category: cat._id });
        await SubCategory.deleteMany({_id: { $in: cat.subCategories }})
    }
})

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;