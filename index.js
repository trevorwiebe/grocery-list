const express = require('express')
const mongoose = require('mongoose');
const path = require('path');

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

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/categories', async (req, res) => {

});

app.get('/items', async (req, res) => {
    const items = await Item.find({})
    console.log(items);
    res.render('showItems', {items});
})

app.listen(3000, () => {
    console.log('serving on port 3000');
})