import { config } from "dotenv";
config();

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "lobster_nexus",
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

const testParticipants = [
  { name: "张三丰", phone: "13800138001", industry: "餐饮美食", company: "太极餐饮集团", title: "创始人", bio: "用太极的方式做一碗好面" },
  { name: "李小龙", phone: "13800138002", industry: "体育健身", company: "龙拳健身", title: "总教练", bio: "截拳道也能跨界" },
  { name: "王大锤", phone: "13800138003", industry: "科技互联网", company: "锤子科技", title: "产品经理", bio: "用科技改变生活" },
  { name: "赵晓月", phone: "13800138004", industry: "设计创意", company: "月光设计工作室", title: "创意总监", bio: "每一个像素都有故事" },
  { name: "陈大厨", phone: "13800138005", industry: "餐饮美食", company: "滇味轩", title: "主厨", bio: "云南菜就该这么做" },
  { name: "刘记者", phone: "13800138006", industry: "自媒体/KOL", company: "城市探秘", title: "主编", bio: "探索昆明每一个角落" },
  { name: "黄律师", phone: "13800138007", industry: "法律服务", company: "金盾律所", title: "合伙人", bio: "法律也可以很有趣" },
  { name: "周老师", phone: "13800138008", industry: "教育培训", company: "未来教育", title: "教学总监", bio: "让学习不再枯燥" },
  { name: "吴摄影", phone: "13800138009", industry: "摄影艺术", company: "光影工坊", title: "首席摄影师", bio: "用镜头记录美好" },
  { name: "郑医生", phone: "13800138010", industry: "医疗健康", company: "春城中医馆", title: "主治医师", bio: "中医养生从吃龙虾开始" },
  { name: "孙老板", phone: "13800138011", industry: "零售电商", company: "鲜果到家", title: "CEO", bio: "让新鲜水果触手可及" },
  { name: "钱投资", phone: "13800138012", industry: "金融投资", company: "云创资本", title: "投资总监", bio: "寻找下一个独角兽" },
  { name: "冯文旅", phone: "13800138013", industry: "文旅策划", company: "彩云之南文旅", title: "策划总监", bio: "让旅行充满惊喜" },
  { name: "褚咨询", phone: "13800138014", industry: "咨询服务", company: "智汇咨询", title: "高级顾问", bio: "帮企业找到方向" },
  { name: "蒋家居", phone: "13800138015", industry: "房产家居", company: "宜居空间", title: "设计师", bio: "打造温暖的家" },
  { name: "沈传统", phone: "13800138016", industry: "传统企业", company: "老字号茶庄", title: "掌门人", bio: "百年传承的味道" },
  { name: "韩程序", phone: "13800138017", industry: "科技互联网", company: "码农科技", title: "CTO", bio: "代码改变世界" },
  { name: "朱美食", phone: "13800138018", industry: "餐饮美食", company: "朱记火锅", title: "品牌总监", bio: "火锅配龙虾绝了" },
  { name: "杨瑜伽", phone: "13800138019", industry: "体育健身", company: "静心瑜伽馆", title: "创始人", bio: "在呼吸中找到力量" },
  { name: "秦网红", phone: "13800138020", industry: "自媒体/KOL", company: "秦时明月MCN", title: "达人", bio: "100万粉丝的美食博主" },
];

async function main() {
  console.log("🦞 开始插入测试数据...\n");

  let inserted = 0;
  let skipped = 0;

  for (const p of testParticipants) {
    const existing = await prisma.participant.findUnique({ where: { phone: p.phone } });
    if (existing) {
      console.log(`⏭️  跳过已存在: ${p.name} (${p.phone})`);
      skipped++;
      continue;
    }

    await prisma.participant.create({
      data: {
        name: p.name,
        phone: p.phone,
        industry: p.industry,
        company: p.company,
        title: p.title,
        bio: p.bio,
        checkinCode: p.phone,
        checkedIn: true,
        checkinTime: new Date(),
        avatarSeed: Math.random().toString(36).substring(2, 8),
      },
    });
    console.log(`✅ 已插入: ${p.name} | ${p.industry} | ${p.company} | ${p.title}`);
    inserted++;
  }

  const count = await prisma.participant.count();
  console.log(`\n📊 本次插入: ${inserted} 条, 跳过: ${skipped} 条`);
  console.log(`🦞 数据库中共有 ${count} 位参与者（全部已签到）`);
  console.log("\n✨ 现在可以去大屏页面点击「开始配对」按钮了！");
}

main()
  .catch((e) => {
    console.error("❌ 错误:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
