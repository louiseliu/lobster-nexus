import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { phone, avatar } = await req.json();

    if (!phone || !avatar) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    }

    let participant = await prisma.participant.findUnique({ where: { phone } });
    if (!participant) {
      participant = await prisma.participant.findUnique({ where: { checkinCode: phone } });
    }

    if (!participant) {
      return NextResponse.json({ error: "用户未找到" }, { status: 404 });
    }

    await prisma.participant.update({
      where: { id: participant.id },
      data: { avatar },
    });

    return NextResponse.json({ success: true, avatar });
  } catch (error) {
    console.error("Update avatar error:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
