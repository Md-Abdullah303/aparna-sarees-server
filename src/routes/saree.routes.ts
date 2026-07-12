import { Router, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db";
import { requireAuth } from "../middleware/auth.middleware";
import { Saree } from "../types/saree.types";

const router = Router();

// ─── POST /api/sarees ─── Add new saree (protected)
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const userId = (req as any).userId as string;

    const {
      name,
      description,
      price,
      category,
      fabric,
      color,
      size,
      quantity,
      images,
      tags,
      isAvailable,
    } = req.body;

    // Validation
    if (!name || !price) {
      res.status(400).json({ message: "Name and price are required." });
      return;
    }

    const newSaree: Saree = {
      name: String(name),
      description: String(description || ""),
      price: Number(price),
      category: String(category || ""),
      fabric: String(fabric || ""),
      color: String(color || ""),
      size: String(size || ""),
      quantity: Number(quantity || 0),
      images: Array.isArray(images) ? images : [],
      tags: Array.isArray(tags) ? tags : [],
      isAvailable: isAvailable !== false, // default true
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("sarees").insertOne(newSaree);

    res.status(201).json({
      message: "Saree added successfully!",
      sareeId: result.insertedId,
      saree: { ...newSaree, _id: result.insertedId },
    });
  } catch (err) {
    console.error("POST /sarees error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ─── GET /api/sarees ─── Get all sarees (public) with search & filter
router.get("/", async (req: Request, res: Response) => {
  try {
    const db = getDB();

    const { search, category, minPrice, maxPrice, sortBy } = req.query;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    // Search by name or description
    if (search && typeof search === "string" && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { tags: { $elemMatch: { $regex: search.trim(), $options: "i" } } },
      ];
    }

    // Filter by category
    if (category && typeof category === "string" && category !== "all") {
      query.category = { $regex: `^${category.trim()}$`, $options: "i" };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sort options
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy === "price_asc") sortOption = { price: 1 };
    else if (sortBy === "price_desc") sortOption = { price: -1 };
    else if (sortBy === "name_asc") sortOption = { name: 1 };

    const sarees = await db
      .collection("sarees")
      .find(query)
      .sort(sortOption)
      .toArray();

    res.json(sarees);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// ─── GET /api/sarees/my ─── Get logged-in user's sarees (protected)
router.get("/my", requireAuth, async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const userId = (req as any).userId as string;
    const sarees = await db
      .collection("sarees")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(sarees);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// ─── GET /api/sarees/:id ─── Get single saree (public)
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const saree = await db
      .collection("sarees")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!saree) {
      res.status(404).json({ message: "Saree not found" });
      return;
    }
    res.json(saree);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// ─── PUT /api/sarees/:id ─── Update saree (protected, owner only)
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const userId = (req as any).userId as string;

    const existing = await db
      .collection("sarees")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!existing) {
      res.status(404).json({ message: "Saree not found" });
      return;
    }
    if (existing.userId !== userId) {
      res.status(403).json({ message: "Forbidden: not your saree" });
      return;
    }

    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;

    await db
      .collection("sarees")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });

    res.json({ message: "Saree updated successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// ─── DELETE /api/sarees/:id ─── Delete saree (protected, owner only)
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const userId = (req as any).userId as string;

    const existing = await db
      .collection("sarees")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!existing) {
      res.status(404).json({ message: "Saree not found" });
      return;
    }
    if (existing.userId !== userId) {
      res.status(403).json({ message: "Forbidden: not your saree" });
      return;
    }

    await db.collection("sarees").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Saree deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
