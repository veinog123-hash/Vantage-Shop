import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_SERVER_ID;

  const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
    headers: {
      Authorization: `Bot ${token}`,
    },
    cache: "no-store",
  });

  const data = await res.json();

  return NextResponse.json({
    members: data.approximate_member_count || 0,
    online: data.approximate_presence_count || 0,
    name: data.name || "Vantage",
  });
}