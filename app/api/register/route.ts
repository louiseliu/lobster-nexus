import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { generateShrimpTitle } from "@/lib/shrimp-title";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, industry, company, title, bio, avatar, shrimpGender, shrimpReason, shrimpSkills, shrimpWish } = body;

    if (!name || !phone || !industry || !company || !title) {
      return NextResponse.json({ error: "请填写必填字段" }, { status: 400 });
    }

    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: "手机号格式不正确" }, { status: 400 });
    }

    const existing = await prisma.participant.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json({
        error: "该手机号已报名",
        participant: {
          id: existing.id,
          name: existing.name,
          checkinCode: existing.checkinCode,
        },
      }, { status: 409 });
    }

    const avatarSeed = nanoid(6);
    const shrimpTitle = generateShrimpTitle(phone);

    let shrimpCode = "";
    for (let digits = 4; digits <= phone.length; digits++) {
      const candidate = phone.slice(-digits);
      const conflict = await prisma.participant.findFirst({
        where: { checkinCode: candidate },
      });
      if (!conflict) {
        shrimpCode = candidate;
        break;
      }
    }
    if (!shrimpCode) {
      shrimpCode = phone;
    }

    const participant = await prisma.participant.create({
      data: {
        name,
        phone,
        industry,
        company,
        title,
        bio: bio || null,
        avatar: avatar || null,
        checkinCode: shrimpCode,
        avatarSeed,
        shrimpGender: shrimpGender || null,
        shrimpReason: shrimpReason || null,
        shrimpSkills: shrimpSkills || null,
        shrimpWish: shrimpWish || null,
        shrimpTitle,
      },
    });

    return NextResponse.json({
      success: true,
      participant: {
        id: participant.id,
        name: participant.name,
        checkinCode: participant.checkinCode,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "服务器错误，请稍后重试" }, { status: 500 });
  }
}
