const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Define JSON file paths
const PRIMARY_DB = 'primary_db.json';
const MIRROR_DB = 'mirror_db.json';

// Function to load products from JSON
const loadProducts = () => {
    if (fs.existsSync(PRIMARY_DB)) {
        return JSON.parse(fs.readFileSync(PRIMARY_DB, 'utf-8'));
    }
    return [];
};

// Function to save products to both primary and mirrored databases
const saveProducts = (data) => {
    fs.writeFileSync(PRIMARY_DB, JSON.stringify(data, null, 2));
    fs.copyFileSync(PRIMARY_DB, MIRROR_DB); // Syncs the data to the mirror
};

let products = loadProducts();

// GET /products → Retrieve all products (with optional filters)
app.get('/products', (req, res) => {
    let filteredProducts = products;

    if (req.query.category) {
        filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === req.query.category.toLowerCase());
    }

    if (req.query.inStock) {
        const inStock = req.query.inStock.toLowerCase() === "true";
        filteredProducts = filteredProducts.filter(p => p.inStock === inStock);
    }

    res.json(filteredProducts);
});

// GET /products/:id → Retrieve a single product by ID
app.get('/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
});

// POST /products → Add a new product
app.post('/products', (req, res) => {
    const { name, description, price, category, inStock } = req.body;
    if (!name || !description || !price || !category) {
        return res.status(400).json({ error: "All product details are required" });
    }

    const newProduct = {
        id: uuidv4(),
        name,
        description,
        price,
        category,
        inStock: inStock || false
    };

    products.push(newProduct);
    saveProducts(products); // Save to both primary & mirrored storage

    res.status(201).json(newProduct);
});

// PUT /products/:id → Update an existing product
app.put('/products/:id', (req, res) => {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    if (productIndex === -1) return res.status(404).json({ error: "Product not found" });

    products[productIndex] = { ...products[productIndex], ...req.body };
    saveProducts(products); // Save changes to both databases

    res.json(products[productIndex]);
});

// DELETE /products/:id → Remove a product
app.delete('/products/:id', (req, res) => {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    if (productIndex === -1) return res.status(404).json({ error: "Product not found" });

    products.splice(productIndex, 1);
    saveProducts(products); // Ensure deletion is mirrored

    res.json({ message: "Product successfully deleted" });
});

// Asynchronous replication every 30 seconds
const replicateAsync = () => {
    if (fs.existsSync(PRIMARY_DB)) {
        fs.copyFileSync(PRIMARY_DB, MIRROR_DB);
        console.log("Asynchronous replication completed.");
    }
};
setInterval(replicateAsync, 30000);

// Start the server
app.listen(PORT, () => {
    console.log(`E-commerce API running on http://localhost:${PORT}`);
});