const express = require('express')
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const AppError = require('./utils/AppError')
const bcrypt = require('bcrypt');
const session = require('express-session');

const GroceryList = require('./models/list');
const Item = require('./models/item');
const Category = require('./models/category');
const SubCategory = require('./models/subcategory');
const User = require('./models/user');

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

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'));
const sessionConfig = {
    secret: 'grocery-list',
    resave: false,
    saveUninitialized: true
}
app.use(session(sessionConfig))
app.use((req, res, next) => {
    res.locals.user_id = req.session.user_id;
    next();
});

const requireSignin = (req, res, next) => {
    if(!req.session.user_id){
        return res.redirect('/signin');
    }
    next();
}

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/signup', (req, res) => {
    res.render('signin/signup');
})

app.post('/signup', async (req, res) => {
    const { password, email } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const user = new User({
        username: email,
        hash: hash
    })

    // Add user id to the session
    req.session.user_id = user._id;

    await user.save();
    res.redirect('/lists');
})

app.get('/signin', (req, res) => {
    res.render('signin/signin');
})

app.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({username: email})
    const validPassword = await bcrypt.compare(password, user.hash);
    if(validPassword){
        req.session.user_id = user._id;

        res.redirect('/');
    }else{
        res.redirect('signin/signin');
    }
})

app.post('/signout', (req, res) => {
    req.session.user_id = null;
    res.redirect('/');
})

app.get('/lists', requireSignin, async(req, res) => {
    const lists = await GroceryList.find({}).populate('items');
    res.render('list', {lists});
})

app.get('/items', requireSignin, async (req, res) => {
    const items = await Item.find({}).populate('category').populate('subCategory');
    res.render('items/show', {items});
})

app.get('/items/new', requireSignin, async(req, res) => {
    const {c, sc} = req.query;
    const categories = await Category.find({}).populate('subCategories');
    res.render('items/new', { categories, c, sc });
})

app.post('/items', requireSignin, async(req, res) => {
    const { item } = req.body;
    const { action } = req.body;
    const category = await Category.findById({_id: item.categoryId });
    const subCategory = await SubCategory.findById({_id: item.subCategoryId });
    const newItem = new Item({
        name: item.name,
        order: 0,
    })
    newItem.category = category;
    newItem.subCategory = subCategory;
    newItem.save()
    if(action === 'save-and-add-another'){
        res.redirect(`/items/new?c=${item.categoryId}&sc=${item.subCategoryId}`);
    }else{
        res.redirect('/items');
    }
})

app.get('/items/:id/edit', requireSignin, async (req, res) => {
    const item = await Item.findById(req.params.id).populate('category');
    const categories = await Category.find({}).populate('subCategories');
    res.render('items/edit', {item, categories});
})

app.put('/items/:id', requireSignin, async (req, res) => {
    const {item} = req.body;

    const category = await Category.findById({_id: item.categoryId });
    const subCategory = await SubCategory.findById({_id: item.subCategoryId });

    await Item.findByIdAndUpdate(
        req.params.id, 
        { 
            name: item.name,
            category: category,
            subCategory: subCategory
        },
        { runValidators: true }
    );
    res.redirect('/items');
})

app.delete('/items/:id', requireSignin, async (req, res) => {
    await Item.findByIdAndDelete(req.params.id);
    res.redirect('/items');
})

app.get('/categories', requireSignin, async (req, res) => {
    const categories = await Category
        .find({})
        .populate('subCategories');
    res.render('categories/show', {categories});
});

app.get('/categories/new', requireSignin, async(req, res) => {
    res.render('categories/new')
})

app.post('/categories', requireSignin, async(req, res) =>{
    const { name } = req.body.category
    const { action } = req.body;
    const category = new Category({
        name: name
    })
    await category.save()
    if (action === 'save-and-add-another') {
        res.redirect('/categories/new');
    } else {
        res.redirect('/categories');
    }
})

app.get('/categories/:id/edit', requireSignin, async(req, res) => {
    const category = await Category.findById(req.params.id);
    res.render('categories/edit', {category});
})

app.put('/categories/:id', requireSignin, async (req, res) => {
    const {category} = req.body;
    await Category.findByIdAndUpdate(
        req.params.id,
        { name: category.name },
        { runValidators: true }
    );
    res.redirect('/categories');
})

app.delete('/categories/:id', requireSignin, async(req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.redirect('/categories');
})

app.get('/subcategories/new', requireSignin, async(req, res) => {
    const selectedCategory = req.query.c;
    const categories = await Category.find({});
    res.render('subcategories/new', {categories, selectedCategory});
})

app.post('/subcategories', requireSignin, async(req, res) => {
    const { name, category } = req.body.subCategory;
    const { action } = req.body;
    const parentCategory = await Category.findById({_id: category});

    const newSubCat = new SubCategory({
        name: name
    });
    parentCategory.subCategories.push(newSubCat);
    await newSubCat.save();
    await parentCategory.save();
    if (action === 'save-and-add-another') {
        res.redirect(`/subcategories/new?c=${category}`);
    } else {
        res.redirect('/categories');
    }
})

app.get('/subcategories/:id/edit', requireSignin, async(req, res) => {
    const { id } = req.params;
    const selectedCategory = req.query.c;
    const subCategory = await SubCategory.findById({_id: id});
    const categories = await Category.find({});
    res.render('subcategories/edit', {subCategory, categories, selectedCategory})
})

app.put('/subcategories/:id', requireSignin, async(req, res) => {
    const { name, category } = req.body.subCategory;
    const { id } = req.params;

    // First we update the subCategory
    const subCategory = await SubCategory.findOneAndUpdate(
        {_id: id}, 
        {name: name}
    );
    await subCategory.save();

    res.redirect('/categories');
})

app.delete('/subcategories/:id', requireSignin, async(req, res) => {
    const { id } = req.params;
    await SubCategory.findOneAndDelete({_id: id});
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