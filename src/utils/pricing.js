const COMPLEXITY_LEVELS = {
  routine: {
    key: 'routine',
    label: 'Routine',
    adjustment: -0.2,
    reason: '无专业知识、几乎无需准备',
  },
  standard: {
    key: 'standard',
    label: 'Standard',
    adjustment: 0,
    reason: '普通帮助、有明确任务',
  },
  skilled: {
    key: 'skilled',
    label: 'Skilled',
    adjustment: 0.4,
    reason: '需要特定软件、课程或技能',
  },
  specialist: {
    key: 'specialist',
    label: 'Specialist',
    adjustment: 0.6,
    reason: '需要诊断、调试或高级知识',
  },
};

const URGENCY_LEVELS = {
  flexible: {
    key: 'flexible',
    label: '三天以后',
    adjustment: 0,
    reason: '时间宽松',
  },
  soon: {
    key: 'soon',
    label: '24-72 小时',
    adjustment: 0.1,
    reason: '较紧急',
  },
  urgent: {
    key: 'urgent',
    label: '24 小时内',
    adjustment: 0.3,
    reason: '当天或今晚需要',
  },
};

const MARKET_SIGNALS = {
  跑腿生活: {
    key: 'abundant',
    label: '供给充足',
    adjustment: -0.1,
    offers: 12,
    requests: 6,
  },
  学习辅导: {
    key: 'high-demand',
    label: '需求偏高',
    adjustment: 0.1,
    offers: 6,
    requests: 8,
  },
  设计剪辑: {
    key: 'balanced',
    label: '供需平衡',
    adjustment: 0,
    offers: 7,
    requests: 7,
  },
  编程技术: {
    key: 'scarce',
    label: '稀缺技能',
    adjustment: 0.4,
    offers: 1,
    requests: 6,
  },
  运动陪练: {
    key: 'balanced',
    label: '供需平衡',
    adjustment: 0,
    offers: 5,
    requests: 5,
  },
  摄影修图: {
    key: 'high-demand',
    label: '需求偏高',
    adjustment: 0.1,
    offers: 4,
    requests: 6,
  },
};

const ROUTINE_KEYWORDS = ['快递', '跑腿', '打印', '排队', '代拿', '取件'];
const SPECIALIST_KEYWORDS = ['调试', '诊断', '建模', '全栈', '修复', '架构'];
const SKILLED_KEYWORDS = [
  'excel',
  'python',
  'ppt',
  '口语',
  '剪辑',
  '修图',
  '海报',
  '代码',
  '辅导',
];

const CATEGORY_COMPLEXITY = {
  跑腿生活: 'routine',
  学习辅导: 'skilled',
  设计剪辑: 'skilled',
  编程技术: 'specialist',
  运动陪练: 'standard',
  摄影修图: 'skilled',
};

const clamp = (min, max, value) => Math.min(max, Math.max(min, value));
const roundToTenth = (value) => Math.round(value * 10) / 10;

const detectComplexity = ({ category, title, description }) => {
  const text = `${title} ${description}`.toLowerCase();

  if (SPECIALIST_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return COMPLEXITY_LEVELS.specialist;
  }

  if (ROUTINE_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return COMPLEXITY_LEVELS.routine;
  }

  if (SKILLED_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return COMPLEXITY_LEVELS.skilled;
  }

  return COMPLEXITY_LEVELS[CATEGORY_COMPLEXITY[category] || 'standard'];
};

const resolveMarketSignal = (category) =>
  MARKET_SIGNALS[category] || {
    key: 'balanced',
    label: '供需平衡',
    adjustment: 0,
    offers: 5,
    requests: 5,
  };

export const formatCredits = (value) => `${Number(value).toFixed(1)} Credits`;

export const createAiPricingSuggestion = ({
  category,
  title,
  description,
  durationHours,
  urgency,
}) => {
  const complexity = detectComplexity({ category, title, description });
  const market = resolveMarketSignal(category);
  const urgencyLevel = URGENCY_LEVELS[urgency] || URGENCY_LEVELS.flexible;
  const duration = Number(durationHours) || 1;

  const hourlyPrice = roundToTenth(
    clamp(0.5, 2.5, 1.0 + complexity.adjustment + market.adjustment + urgencyLevel.adjustment),
  );
  const totalPrice = roundToTenth(hourlyPrice * duration);

  return {
    hourlyPrice,
    totalPrice,
    durationHours: duration,
    fairnessRange: {
      min: roundToTenth(clamp(0.5, 2.5, hourlyPrice - 0.2)),
      max: roundToTenth(clamp(0.5, 2.5, hourlyPrice + 0.2)),
    },
    complexity,
    market,
    urgency: urgencyLevel,
    explanation: [
      `${complexity.label} task ${complexity.adjustment >= 0 ? '+' : ''}${complexity.adjustment}`,
      `${market.label} ${market.adjustment >= 0 ? '+' : ''}${market.adjustment}`,
      `${urgencyLevel.label} ${urgencyLevel.adjustment >= 0 ? '+' : ''}${urgencyLevel.adjustment}`,
    ],
    campusSignal: `Campus signal: ${market.requests} requests and ${market.offers} available helpers this week`,
  };
};

export const urgencyOptions = [
  { value: 'flexible', label: '三天以后' },
  { value: 'soon', label: '24-72 小时' },
  { value: 'urgent', label: '24 小时内' },
];

export const CUSTOM_PRICE_LIMITS = {
  min: 0.1,
  max: 10,
};

export const clampCustomPrice = (value) =>
  roundToTenth(clamp(CUSTOM_PRICE_LIMITS.min, CUSTOM_PRICE_LIMITS.max, Number(value) || 0));

export const buildPostPricingSummary = (post) => {
  if (!post.aiPricing) {
    return null;
  }

  return [
    `${formatCredits(post.aiPricing.hourlyPrice)}/hour`,
    `${post.aiPricing.complexity.label} ${post.aiPricing.complexity.adjustment >= 0 ? '+' : ''}${post.aiPricing.complexity.adjustment}`,
    `${post.aiPricing.market.label} ${post.aiPricing.market.adjustment >= 0 ? '+' : ''}${post.aiPricing.market.adjustment}`,
    `${post.aiPricing.urgency.label} ${post.aiPricing.urgency.adjustment >= 0 ? '+' : ''}${post.aiPricing.urgency.adjustment}`,
  ];
};
