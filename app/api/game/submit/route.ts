import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { phone, keyword } = await req.json();

    if (!phone || !keyword?.trim()) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    let participant = await prisma.participant.findUnique({ where: { checkinCode: phone } });
    if (!participant) {
      participant = await prisma.participant.findUnique({ where: { phone } });
    }
    if (!participant) {
      return NextResponse.json({ error: "未找到用户" }, { status: 404 });
    }

    const session = await prisma.gameSession.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (!session || session.status !== "playing") {
      return NextResponse.json({ error: "当前没有进行中的游戏" }, { status: 400 });
    }

    const existing = await prisma.gameSubmission.findFirst({
      where: {
        sessionId: session.id,
        round: session.currentRound,
        userId: participant.id,
      },
    });

    if (existing) {
      await prisma.gameSubmission.update({
        where: { id: existing.id },
        data: { keyword: keyword.trim() },
      });
      return NextResponse.json({ status: "updated" });
    }

    await prisma.gameSubmission.create({
      data: {
        sessionId: session.id,
        round: session.currentRound,
        userId: participant.id,
        userName: participant.name,
        industry: participant.industry,
        keyword: keyword.trim(),
      },
    });

    return NextResponse.json({ status: "submitted" });
  } catch (error) {
    console.error("Game submit error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const round = req.nextUrl.searchParams.get("round");

    const session = await prisma.gameSession.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (!session) {
      return NextResponse.json({ submissions: [] });
    }

    const where: Record<string, unknown> = { sessionId: session.id };
    if (round) where.round = parseInt(round);

    const submissions = await prisma.gameSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      submissions,
      total: submissions.length,
    });
  } catch (error) {
    console.error("Game submissions GET error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
