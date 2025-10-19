const mongoose = require('mongoose');
const { 
    GroceryList,
    Item,
    Category,
    SubCategory
 } = require('./models/modelSchemas')

mongoose.connect('mongodb://localhost:27017/grocery-list')
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const itemList = [
    "Eggs", "Peaches"
]

const seedDB = async () => {

    // Clear the exisisting data
    await GroceryList.deleteMany({});
    await Item.deleteMany({});
    await Category.deleteMany({});
    await SubCategory.deleteMany({});

    // Add new category
    const subCategory = new SubCategory({
        name: "Meat and cheese drawer"
    })
    const category = new Category({
        name: "Fridge"
    })
    category.subCategories.push(subCategory);
    await category.save();
    await subCategory.save();

    // Add items
    for(let i in itemList){
        const item = new Item({
            name: itemList[i],
            order: i,
            category: category,
            subCategory: subCategory
        })

        await item.save();
    }

    // Add new list
    const list = new GroceryList({
        title: "Wal-Mart",
        dateCreated: new Date()
    })
    const item = await Item.findOne({name: "Eggs"})
    list.items.push(item)
    await list.save()

    db.close()
    
}

seedDB();