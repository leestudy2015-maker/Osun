
// api/create-checkout-session.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
  try {
    const { order } = req.body;
    if (!order || !Array.isArray(order.items) || order.items.length === 0) {
      return res.status(400).json({ error: "Missing order items" });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: order.items.map(i => ({
        price_data: {
          currency: (order.currency||"myr").toLowerCase(),
          product_data: { name: i.name },
          unit_amount: Number(i.unit_amount_cents)
        },
        quantity: Number(i.quantity) || 1
      })),
      mode: "payment",
      success_url: `${process.env.SITE_ORIGIN}/success.html`,
      cancel_url: `${process.env.SITE_ORIGIN}/cancel.html`
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
}
