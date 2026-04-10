import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const challenges = [
  { verb: "用", action: "重新设计", what: "的获客方式" },
  { verb: "把", action: "的用户体验", what: "搬到线下" },
  { verb: "用", action: "的思维", what: "做一款产品" },
  { verb: "用", action: "的方法论", what: "解决招聘问题" },
  { verb: "如果", action: "遇上", what: "会碰撞出什么火花？" },
  { verb: "用", action: "的逻辑", what: "做一道龙虾菜" },
  { verb: "把", action: "的爆款策略", what: "应用到社区运营" },
  { verb: "用", action: "的思路", what: "做一场线下活动" },
  { verb: "如果让", action: "的人来做", what: "会怎样？" },
  { verb: "用", action: "的营销方式", what: "推广一家餐厅" },
  { verb: "把", action: "的服务标准", what: "搬到你的行业" },
  { verb: "用", action: "的创新模式", what: "改造传统行业" },
  { verb: "用", action: "的定价策略", what: "卖龙虾" },
  { verb: "从", action: "的角度", what: "重新定义社交" },
  { verb: "把", action: "和", what: "做成一个跨界IP" },
];

const funFacts: Record<string, string[]> = {
  "餐饮美食": ["中国每年消费小龙虾超200万吨", "一只龙虾有10条腿", "龙虾的牙齿长在胃里"],
  "文旅策划": ["全球每年有14亿国际游客", "旅行者平均在目的地停留4.2天", "沉浸式体验市场年增长30%"],
  "设计创意": ["人类大脑处理图像只需13毫秒", "蓝色是全球最受欢迎的颜色", "好的设计能提升销售33%"],
  "自媒体/KOL": ["短视频用户日均使用2.5小时", "优质内容的打开率是普通的7倍", "真实感内容转化率最高"],
  "教育培训": ["成人学习遗忘曲线在24h内丢失70%", "互动式学习效果是被动式的6倍", "微学习完成率高达80%"],
  "传统企业": ["中国有4000万+中小企业", "数字化转型可提升效率40%", "跨界合作成功率是单打独斗的3倍"],
  "科技互联网": ["全球每天产生2.5EB数据", "AI市场预计2030年达$1.8万亿", "5G速度是4G的100倍"],
  "医疗健康": ["人体有37.2万亿个细胞", "笑能降低压力激素40%", "步行30分钟可燃烧200卡"],
  "金融投资": ["全球股票市场总市值超$100万亿", "复利是世界第八大奇迹", "投资回报的80%来自20%的决策"],
  "法律服务": ["中国有超过60万执业律师", "合同纠纷占民事案件的30%", "知识产权案件年增长25%"],
  "摄影艺术": ["每天全球上传1.8亿张照片", "黄金比例=1.618", "人眼等效焦距约50mm"],
  "零售电商": ["直播电商年交易额超3万亿", "包邮门槛影响60%的购买决策", "会员复购率是非会员的5倍"],
  "房产家居": ["中国城镇化率已超65%", "智能家居市场年增长15%", "好的户型设计可提升20%居住体验"],
  "体育健身": ["运动释放内啡肽=天然快乐药", "核心肌群训练可减少80%腰痛", "健身行业年增长率8%"],
  "咨询服务": ["麦肯锡式思维：MECE原则", "80%的问题可通过20%的方案解决", "结构化思维提升沟通效率3倍"],
  "其他": ["跨界是创新的最大来源", "异业合作的品牌曝光提升5倍", "多元化团队创新效率高出35%"],
};

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "请提供手机号" }, { status: 400 });
    }

    let participant = await prisma.participant.findUnique({ where: { checkinCode: phone } });
    if (!participant) {
      participant = await prisma.participant.findUnique({ where: { phone } });
    }
    if (!participant) {
      return NextResponse.json({ error: "手机号未注册" }, { status: 404 });
    }

    const allIndustries = [
      "餐饮美食", "文旅策划", "设计创意", "自媒体/KOL",
      "教育培训", "传统企业", "科技互联网", "医疗健康",
      "金融投资", "法律服务", "摄影艺术", "零售电商",
      "房产家居", "体育健身", "咨询服务", "其他",
    ];

    const otherIndustries = allIndustries.filter((i) => i !== participant.industry);
    const targetIndustry = otherIndustries[Math.floor(Math.random() * otherIndustries.length)];
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    const facts = funFacts[targetIndustry] || funFacts["其他"];
    const fact = facts[Math.floor(Math.random() * facts.length)];

    let mission: string;
    if (challenge.verb === "如果" || challenge.verb === "如果让") {
      mission = `${challenge.verb}【${targetIndustry}】${challenge.action}【${participant.industry}】，${challenge.what}`;
    } else if (challenge.verb === "从") {
      mission = `${challenge.verb}【${targetIndustry}】${challenge.action}，${challenge.what}`;
    } else {
      mission = `${challenge.verb}【${targetIndustry}】${challenge.action}，${challenge.what}`;
    }

    return NextResponse.json({
      myIndustry: participant.industry,
      targetIndustry,
      mission,
      funFact: fact,
      name: participant.name,
    });
  } catch (error) {
    console.error("Game error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
