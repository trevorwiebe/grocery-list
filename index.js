const express = require('express')
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const AppError = require('./utils/AppError')

const { GroceryList, Item, Category } = require('./models/modelSchemas');

mongoose.connect('mongodb://localhost:27017/grocery-list')
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.engine('ejs', ejsMate);

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/lists', async(req, res) => {
    const lists = await GroceryList.find({}).populate('items');
    res.render('list', {lists});
})

app.get('/items', async (req, res) => {
    const items = await Item.find({});
    res.render('items/show', {items});
})

app.get('/items/new', async(req, res) => {
    res.render('items/new');
})

app.post('/items', async(req, res) => {
    const { item } = req.body;
    const newItem = new Item({
        name: item.name,
        order: item.order
    })
    newItem.save()
    res.redirect('items');
})

app.get('/items/:id/edit', async (req, res) => {
    const item = await Item.findById(req.params.id);
    res.render('items/edit', {item});
})

app.put('/items/:id', async (req, res) => {
    const {item} = req.body;
    await Item.findByIdAndUpdate(
        req.params.id, 
        { name: item.name, order: item.order },
        { runValidators: true }
    );
    res.redirect('/items');
})

app.delete('/items/:id', async (req, res) => {
    await Item.findByIdAndDelete(req.params.id);
    res.redirect('/items');
})

app.get('/categories', async (req, res) => {
    const categories = await Category.find({});
    res.render('categories/show', {categories});
});

app.get('/categories/:id/edit', async(req, res) => {
    const category = await Category.findById(req.params.id);
    res.render('categories/edit', {category});
})

app.put('/categories/:id', async (req, res) => {
    const {category} = req.body;
    console.log(category);
    await Category.findByIdAndUpdate(
        req.params.id,
        { name: category.name },
        { runValidators: true }
    );
    res.redirect('/categories');
})

app.delete('/categories/:id', async(req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.redirect('/categories');
})

app.all(/(.*)/, (req, res, next) => {
    next(new AppError("Page Not Found", 404))
})

app.use((err, req, res, next) => {
    if(!err.message) err.message = "Something went wrong";
    if(!err.statusCode) err.statusCode = 500;
    res.render('error', {err});
})

app.listen(3000, () => {
    console.log('serving on port 3000');
})