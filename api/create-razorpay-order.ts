import Razorpay from "razorpay";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = "INR" } = req.body;
    
    // Fallbacks to support various environments
    const key_id = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_id || !key_secret) {
      return res.status(500).json({ error: "Razorpay credentials (VITE_RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET) missing from environment variables." });
    }

    const razorpay = new Razorpay({ key_id, key_secret });

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json(order);
  } catch (error: any) {
    console.error("Razorpay error:", error);
    return res.status(500).json({ error: error.message });
  }
}
