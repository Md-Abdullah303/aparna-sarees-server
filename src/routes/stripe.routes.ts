import { Router, Request, Response } from "express";
import Stripe from "stripe";

const router = Router();

// Let stripe SDK auto-detect apiVersion from installed version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// POST /api/stripe/create-payment-intent
router.post("/create-payment-intent", async (req: Request, res: Response) => {
  try {
    const { amount, sareeId, sareeName, userEmail } = req.body;

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
        userEmail: userEmail || "",
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ message: err.message || "Payment failed." });
  }
});

// GET /api/stripe/payments — List recent payment intents
router.get("/payments", async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;
    
    // Fetch recent payment intents
    const list = await stripe.paymentIntents.list({ limit: 100 });
    
    // Filter by user email if provided
    let userPayments = list.data;
    if (email) {
      userPayments = list.data.filter((p) => p.metadata?.userEmail === email);
    }

    res.json({ payments: userPayments });
  } catch (err: any) {
    console.error("Stripe list error:", err.message);
    res.status(500).json({ message: err.message || "Failed to fetch payments." });
  }
});

export default router;
