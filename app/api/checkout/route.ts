import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL || "";

async function sendDiscordNotification(title: string, price: number, method: string) {
  if (!DISCORD_WEBHOOK) return;
  await fetch(DISCORD_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [{
        title: "🛒 Νέα Αγορά!",
        description: `**${title}** αγοράστηκε με ${method}`,
        color: 0xFFD700,
        fields: [{ name: "Τιμή", value: `${price}€` }]
      }]
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { resourceId } = await req.json();
    const { data: resource } = await supabase.from("resources").select("*").eq("id", resourceId).single();
    if (!resource) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const session = await getStripe().checkout.sessions.create({
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: resource.title },
          unit_amount: Math.round(resource.price * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${req.nextUrl.origin}/success?resource_id=${resource.id}`,
      cancel_url: `${req.nextUrl.origin}/`,
      metadata: { resourceId: resource.id },
    });

    await sendDiscordNotification(resource.title, resource.price, "Stripe");
    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
