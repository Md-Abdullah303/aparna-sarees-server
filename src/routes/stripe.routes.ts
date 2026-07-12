import { Router, Request, Response } from "express";
import Stripe from "stripe";

const router = Router();

// Let stripe SDK auto-detect apiVersion from installed version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// POST /api/stripe/create-payment-intent
router.post("/create-payment-intent", async (req: Request, res: Response) => {
  try {
    const { amount, sareeId, sareeName } = req.body;

    if (!amount || typeof amount !== "number" || amount < 1) {
      res.status(400).json({ message: "Invalid amount." });
      return;
    }

    // Stripe works in smallest currency unit (paisa for BDT)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to paisa
      currency: "bdt",
      automatic_payment_methods: { enabled: true },
      metadata: {
        sareeId: sareeId || "",
        sareeName: sareeName || "",
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ message: err.message || "Payment failed." });
  }
});

export default router;
