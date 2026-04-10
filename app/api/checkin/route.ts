import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function findByCodeOrPhone(code: string) {
  let p = await prisma.participant.findUnique({ where: { checkinCode: code } });
  if (!p) p = await prisma.participant.findUnique({ where: { phone: code } });
  return p;
}

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "请输入手机号" }, { status: 400 });
    }

    const participant = await findByCodeOrPhone(code);

    if (!participant) {
      return NextResponse.json({ error: "手机号未注册，请先报名" }, { status: 404 });
    }

    if (participant.checkedIn) {
      return NextResponse.json({
        error: "你已经签到过了！",
        participant: {
          id: participant.id,
          name: participant.name,
          industry: participant.industry,
          company: participant.company,
          title: participant.title,
          checkedIn: true,
          checkinTime: participant.checkinTime,
        },
      }, { status: 409 });
    }

    const updated = await prisma.participant.update({
      where: { id: participant.id },
      data: {
        checkedIn: true,
        checkinTime: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      participant: {
        id: updated.id,
        name: updated.name,
        industry: updated.industry,
        company: updated.company,
        title: updated.title,
        bio: updated.bio,
        checkedIn: true,
        checkinTime: updated.checkinTime,
      },
    });
  } catch (error) {
    console.error("Checkin error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "缺少签到码" }, { status: 400 });
  }

  const raw = await findByCodeOrPhone(code);

  if (!raw) {
    return NextResponse.json({ error: "手机号未注册" }, { status: 404 });
  }

  const participant = {
    id: raw.id,
    name: raw.name,
    industry: raw.industry,
    company: raw.company,
    title: raw.title,
    checkedIn: raw.checkedIn,
    checkinTime: raw.checkinTime,
    avatarSeed: raw.avatarSeed,
  };

  return NextResponse.json({ participant });
}
