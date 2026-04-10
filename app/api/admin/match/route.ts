import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-password");
  return auth === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { round = 1 } = await req.json();

    const checkedIn = await prisma.participant.findMany({
      where: { checkedIn: true },
      select: { id: true, name: true, industry: true, company: true, title: true, avatarSeed: true, avatar: true },
    });

    if (checkedIn.length < 2) {
      return NextResponse.json({ error: "签到人数不足" }, { status: 400 });
    }

    const existingMatches = await prisma.blindboxMatch.findMany({
      where: { round },
      select: { user1Id: true, user2Id: true },
    });
    const alreadyMatched = new Set<string>();
    existingMatches.forEach((m) => {
      alreadyMatched.add(`${m.user1Id}-${m.user2Id}`);
      alreadyMatched.add(`${m.user2Id}-${m.user1Id}`);
    });

    const shuffled = [...checkedIn].sort(() => Math.random() - 0.5);
    const pairs: Array<{ user1: typeof checkedIn[0]; user2: typeof checkedIn[0] }> = [];

    const used = new Set<string>();
    for (let i = 0; i < shuffled.length; i++) {
      if (used.has(shuffled[i].id)) continue;
      for (let j = i + 1; j < shuffled.length; j++) {
        if (used.has(shuffled[j].id)) continue;
        const key = `${shuffled[i].id}-${shuffled[j].id}`;
        if (!alreadyMatched.has(key)) {
          pairs.push({ user1: shuffled[i], user2: shuffled[j] });
          used.add(shuffled[i].id);
          used.add(shuffled[j].id);
          break;
        }
      }
    }

    const createdMatches = await Promise.all(
      pairs.map((pair) =>
        prisma.blindboxMatch.create({
          data: {
            user1Id: pair.user1.id,
            user2Id: pair.user2.id,
            round,
            source: "system",
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      pairs: pairs.map((p) => ({
        user1: p.user1,
        user2: p.user2,
      })),
      totalPairs: createdMatches.length,
      unmatched: shuffled.filter((s) => !used.has(s.id)),
    });
  } catch (error) {
    console.error("Match error:", error);
    return NextResponse.json({ error: "配对失败" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const round = Number(req.nextUrl.searchParams.get("round")) || 1;

  const matches = await prisma.blindboxMatch.findMany({
    where: { round },
    include: {
      user1: { select: { id: true, name: true, industry: true, company: true, title: true, avatarSeed: true, avatar: true } },
      user2: { select: { id: true, name: true, industry: true, company: true, title: true, avatarSeed: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ matches, total: matches.length });
}
