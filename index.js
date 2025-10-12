const express = require('express')
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');

const { GroceryList, Item } = require('./models/modelSchemas');

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
    const items = await Item.find({})
    res.render('items/show', {items});
})

app.get('/items/:id/edit', async (req, res) => {
    const item = await Item.findById(req.params.id);
    res.render('items/edit', {item})
})

app.put('/items/:id', async (req, res) => {
    await Item.findByIdAndUpdate(
        req.params.id, 
        { name: req.body.item.name }
    );
    res.redirect(`/items`);
})

app.get('/categories', async (req, res) => {
    res.render('category');
});

app.listen(3000, () => {
    console.log('serving on port 3000');
})