import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-password");
  return auth === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const participants = await prisma.participant.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      phone: true,
      industry: true,
      company: true,
      title: true,
      bio: true,
      checkedIn: true,
      checkinTime: true,
      checkinCode: true,
      groupId: true,
      avatarSeed: true,
      avatar: true,
      createdAt: true,
    },
  });

  const stats = {
    total: participants.length,
    checkedIn: participants.filter((p) => p.checkedIn).length,
    industries: [...new Set(participants.map((p) => p.industry))],
  };

  return NextResponse.json({ participants, stats });
}
