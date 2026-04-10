import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateShrimpTitle } from "@/lib/shrimp-title";

export async function POST(req: NextRequest) {
  try {
    const { myCode, targetCode } = await req.json();

    if (!myCode || !targetCode) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    }

    if (myCode === targetCode) {
      return NextResponse.json({ error: "不能扫自己的码哦 🦞" }, { status: 400 });
    }

    const findByCodeOrPhone = async (code: string) => {
      let p = await prisma.participant.findUnique({ where: { checkinCode: code } });
      if (!p) p = await prisma.participant.findUnique({ where: { phone: code } });
      return p;
    };

    const [me, target] = await Promise.all([
      findByCodeOrPhone(myCode),
      findByCodeOrPhone(targetCode),
    ]);

    if (!me) {
      return NextResponse.json({ error: "你的手机号无效" }, { status: 404 });
    }
    if (!target) {
      return NextResponse.json({ error: "对方的手机号无效" }, { status: 404 });
    }
    if (!me.checkedIn || !target.checkedIn) {
      return NextResponse.json({ error: "双方都需要先签到" }, { status: 400 });
    }

    const existingMatch = await prisma.blindboxMatch.findFirst({
      where: {
        OR: [
          { user1Id: me.id, user2Id: target.id },
          { user1Id: target.id, user2Id: me.id },
        ],
      },
    });

    const cardData = {
      name: target.name,
      industry: target.industry,
      company: target.company,
      title: target.title,
      bio: target.bio,
      avatarSeed: target.avatarSeed,
      avatar: target.avatar,
      checkinCode: target.checkinCode,
    };

    if (existingMatch) {
      return NextResponse.json({
        success: true,
        alreadyMatched: true,
        card: cardData,
      });
    }

    await prisma.blindboxMatch.create({
      data: {
        user1Id: me.id,
        user2Id: target.id,
      },
    });

    return NextResponse.json({
      success: true,
      alreadyMatched: false,
      card: cardData,
    });
  } catch (error) {
    console.error("Blindbox error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "缺少签到码" }, { status: 400 });
  }

  let participant = await prisma.participant.findUnique({
    where: { checkinCode: code },
  });
  if (!participant) {
    participant = await prisma.participant.findUnique({
      where: { phone: code },
    });
  }

  if (!participant) {
    return NextResponse.json({ error: "无效签到码" }, { status: 404 });
  }

  if (!participant.shrimpTitle) {
    const title = generateShrimpTitle(participant.phone);
    await prisma.participant.update({
      where: { id: participant.id },
      data: { shrimpTitle: title },
    });
    participant = { ...participant, shrimpTitle: title };
  }

  const matches = await prisma.blindboxMatch.findMany({
    where: {
      OR: [{ user1Id: participant.id }, { user2Id: participant.id }],
    },
    include: {
      user1: { select: { id: true, name: true, industry: true, company: true, title: true, bio: true, avatarSeed: true, avatar: true, checkinCode: true } },
      user2: { select: { id: true, name: true, industry: true, company: true, title: true, bio: true, avatarSeed: true, avatar: true, checkinCode: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const systemMatches = matches
    .filter((m) => m.source === "system")
    .map((m) => {
      const other = m.user1Id === participant.id ? m.user2 : m.user1;
      return { ...other, round: m.round };
    });

  const manualCards = matches
    .filter((m) => m.source !== "system")
    .map((m) => {
      const other = m.user1Id === participant.id ? m.user2 : m.user1;
      return other;
    });

  return NextResponse.json({
    me: {
      id: participant.id,
      name: participant.name,
      industry: participant.industry,
      company: participant.company,
      title: participant.title,
      checkinCode: participant.checkinCode,
      avatar: participant.avatar,
      checkedIn: participant.checkedIn,
      shrimpGender: participant.shrimpGender,
      shrimpReason: participant.shrimpReason,
      shrimpSkills: participant.shrimpSkills,
      shrimpWish: participant.shrimpWish,
      shrimpTitle: participant.shrimpTitle,
      createdAt: participant.createdAt,
    },
    cards: manualCards,
    systemPairs: systemMatches,
    totalExchanged: manualCards.length,
    totalSystemPairs: systemMatches.length,
  });
}
