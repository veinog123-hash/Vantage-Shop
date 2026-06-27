import { NextRequest, NextResponse } from "next/server";

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const NOTIFY_CHANNEL_ID = "1518995178835411035";
const WEBHOOK_SECRET    = process.env.NOTIFY_SECRET || "vantage_notify_secret";

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-webhook-secret");
    if (secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const record = body.record;

    if (!record) return NextResponse.json({ error: "No record" }, { status: 400 });

    const { title, description, category, price, is_free, image_url, video_url, id } = record;

    const priceText = is_free ? "**Free**" : `**${price}€**`;
    const shopUrl   = `${process.env.NEXTAUTH_URL}/resource/${id}`;

    const embed: any = {
      title: `🆕 ${title}`,
      description: description || "No description.",
      color: 0xFFD700,
      fields: [
        { name: "📦 Category", value: category || "N/A", inline: true },
        { name: "💰 Price",    value: priceText,          inline: true },
      ],
      footer: { text: "Vantage Shop • New Resource" },
      timestamp: new Date().toISOString(),
      url: shopUrl,
    };

    if (image_url) embed.image = { url: image_url };

    const components = [];
    const buttons: any[] = [
      {
        type: 2,
        style: 5,
        label: "🛒 View Resource",
        url: shopUrl,
      }
    ];

    if (video_url) {
      buttons.push({
        type: 2,
        style: 5,
        label: "▶️ Watch Video",
        url: video_url,
      });
    }

    components.push({ type: 1, components: buttons });

    const res = await fetch(`https://discord.com/api/v10/channels/${NOTIFY_CHANNEL_ID}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bot ${DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ embeds: [embed], components }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
