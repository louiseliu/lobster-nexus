import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PROMPTS = {
  1: [
    "你最近想让 AI 帮你解决的一个具体问题是什么？",
    "你行业里最烧钱的一个环节，AI 有可能优化吗？",
    "如果给你一个免费的 AI 助手用3个月，你让它干什么？",
    "你的客户最常抱怨的事情是什么？AI 能解决吗？",
    "你行业里最重复、最无聊的工作是什么？",
  ],
  2: [
    "听完搭子的痛点，用你行业的经验给 TA 一个具体建议",
    "你行业里已经在用的 AI 方案，搭子的行业能不能直接抄？",
    "你们两个行业如果合作，最可能做成什么产品？",
    "对方的行业哪个环节最适合用 AI？你来帮 TA 设计",
    "你行业里踩过的坑，能帮搭子避开什么？",
  ],
  3: [
    "今天你打算带走的、下周就能做的一件事是什么？",
    "你们现在就可以互相帮忙的一件事是什么？",
    "一句话总结：龙虾（AI）在你行业的最大价值是？",
    "回去后你第一个要用 AI 尝试的事情是？",
    "用一个词形容今天最大的收获",
  ],
};

const ROUND_NAMES = ["", "🎯 破冰发问", "⚡ 跨界处方", "🤝 行动约定"];
const ROUND_DURATIONS = [0, 180, 300, 120];

export async function GET() {
  try {
    const session = await prisma.gameSession.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!session) {
      return NextResponse.json({
        status: "waiting",
        currentRound: 0,
        currentPrompt: null,
        roundStartAt: null,
        roundDuration: 0,
        roundName: "",
        prompts: PROMPTS,
        roundNames: ROUND_NAMES,
      });
    }

    return NextResponse.json({
      id: session.id,
      status: session.status,
      currentRound: session.currentRound,
      currentPrompt: session.currentPrompt,
      roundStartAt: session.roundStartAt?.toISOString() || null,
      roundDuration: session.roundDuration,
      roundName: ROUND_NAMES[session.currentRound] || "",
      prompts: PROMPTS,
      roundNames: ROUND_NAMES,
    });
  } catch (error) {
    console.error("Game session GET error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, round, prompt, duration } = await req.json();

    if (action === "create") {
      const session = await prisma.gameSession.create({
        data: { status: "waiting", currentRound: 0 },
      });
      return NextResponse.json({ id: session.id, status: "created" });
    }

    if (action === "start_round") {
      const session = await prisma.gameSession.findFirst({
        orderBy: { createdAt: "desc" },
      });

      if (!session) {
        const newSession = await prisma.gameSession.create({
          data: {
            status: "playing",
            currentRound: round,
            currentPrompt: prompt,
            roundStartAt: new Date(),
            roundDuration: duration || ROUND_DURATIONS[round] || 300,
          },
        });
        return NextResponse.json({ id: newSession.id, status: "round_started" });
      }

      await prisma.gameSession.update({
        where: { id: session.id },
        data: {
          status: "playing",
          currentRound: round,
          currentPrompt: prompt,
          roundStartAt: new Date(),
          roundDuration: duration || ROUND_DURATIONS[round] || 300,
        },
      });

      return NextResponse.json({ id: session.id, status: "round_started" });
    }

    if (action === "end_round") {
      const session = await prisma.gameSession.findFirst({
        orderBy: { createdAt: "desc" },
      });
      if (session) {
        const nextStatus = (session.currentRound >= 3) ? "finished" : "waiting";
        await prisma.gameSession.update({
          where: { id: session.id },
          data: { status: nextStatus },
        });
      }
      return NextResponse.json({ status: "round_ended" });
    }

    if (action === "reset") {
      const session = await prisma.gameSession.findFirst({
        orderBy: { createdAt: "desc" },
      });
      if (session) {
        await prisma.gameSubmission.deleteMany({ where: { sessionId: session.id } });
        await prisma.gameSession.delete({ where: { id: session.id } });
      }
      return NextResponse.json({ status: "reset" });
    }

    return NextResponse.json({ error: "无效操作" }, { status: 400 });
  } catch (error) {
    console.error("Game session POST error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
