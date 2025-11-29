// routes/products.js

const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET tous les produits ou par catégorie
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// GET un produit
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Produit non trouvé" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// routes/products.js → dans router.post('/')
router.post("/", async (req, res) => {
  console.log("Données reçues :", req.body); // ← Ajoute cette ligne

  const { name, price, stock, description, imageUrl, category } = req.body;

  if (!category) {
    return res.status(400).json({ message: "Catégorie manquante" });
  }

  const product = new Product({
    name: name.trim(),
    price: Number(price),
    stock: Number(stock),
    description: description?.trim() || "",
    imageUrl,
    category, // ← maintenant accepté
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Erreur création :", err);
    res.status(400).json({ message: "Erreur lors de la création", error: err.message });
  }
});

// PUT - Mettre à jour un produit
router.put("/:id", async (req, res) => {
  const { name, price, stock, description, imageUrl } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    // Mise à jour seulement si la valeur est fournie
    if (name !== undefined) product.name = name.trim();
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (description !== undefined) product.description = description.trim() || "";
    if (imageUrl) {
      if (!imageUrl.startsWith("data:image/") && !imageUrl.startsWith("http")) {
        return res.status(400).json({ message: "Image invalide" });
      }
      product.imageUrl = imageUrl;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    console.error("Erreur mise à jour produit:", err);
    res.status(400).json({ message: "Erreur mise à jour", error: err.message });
  }
});

// DELETE - Supprimer un produit
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    // MongoDB 6+ : utilise delete() au lieu de remove()
    await product.deleteOne();

    res.json({ message: "Produit supprimé avec succès" });
  } catch (err) {
    console.error("Erreur suppression produit:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;