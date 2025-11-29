// routes/orders.js

const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");

// POST - Créer une commande (guest ou connecté)
router.post("/", async (req, res) => {
  const {
    customerName,
    email,
    phone,
    deliveryMethod,     // "Livraison" ou "Ramassage"
    deliveryAddress,    // obligatoire seulement si Livraison
    deliveryDate,       // format: "2025-11-29"
    deliveryTime,       // format: "14:00"
    items,              // [{ productId, quantity }]
    note,
    userId              // optionnel – peut être null ou absent
  } = req.body;

  // Validation des champs obligatoires
  if (!customerName || !email || !phone || !deliveryMethod || !deliveryDate || !deliveryTime) {
    return res.status(400).json({ message: "Informations client ou livraison manquantes" });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Le panier est vide" });
  }

  if (deliveryMethod === "Livraison" && !deliveryAddress) {
    return res.status(400).json({ message: "L'adresse de livraison est obligatoire" });
  }

  try {
    let total = 0;
    const processedItems = [];

    // Vérification du stock + calcul du prix
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ message: "Format d'article invalide" });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Produit non trouvé : ${item.productId}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Stock insuffisant pour "${product.name}" (disponible: ${product.stock})`,
        });
      }

      // Mise à jour du stock
      product.stock -= item.quantity;
      await product.save();

      const itemPrice = product.price * item.quantity;
      total += itemPrice;

      processedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
    }

    // Frais de livraison
    const deliveryFee = deliveryMethod === "Livraison" ? 7 : 0;
    total += deliveryFee;

    // Création de la commande
    const order = new Order({
      customerName: customerName.trim(),
      email: email.toLowerCase().trim(),
      phone,
      deliveryMethod,
      deliveryAddress:
        deliveryMethod === "Livraison" ? deliveryAddress.trim() : "Ramassage en boutique",
      deliveryDate,
      deliveryTime,
      items: processedItems,
      total,
      note: note?.trim() || "",
      status: "Pending",
      userId: userId || null, // si userId existe → on le garde, sinon null
    });

    const savedOrder = await order.save();

    return res.status(201).json({
      success: true,
      message: "Commande passée avec succès !",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Erreur création commande:", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la création de la commande",
      error: error.message,
    });
  }
});

// GET - Toutes les commandes (admin)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("items.productId", "name price imageUrl");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - Commandes d'un utilisateur (si connecté plus tard)
router.get("/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("items.productId");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT - Mettre à jour le statut d'une commande (admin)
router.put("/:id/status", async (req, res) => {
  const { status } = req.body;

  if (!["Pending", "Processing", "Completed", "Cancelled"].includes(status)) {
    return res.status(400).json({ message: "Statut invalide" });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    order.status = status;
    order.updatedAt = Date.now();

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: "Statut mis à jour",
      order: updatedOrder,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;