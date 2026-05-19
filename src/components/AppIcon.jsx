import {
  BarChart3,
  Bolt,
  BookOpen,
  BriefcaseBusiness,
  CarFront,
  CircleDollarSign,
  Clapperboard,
  Coins,
  CreditCard,
  HeartPulse,
  House,
  Laptop,
  Package,
  Plane,
  ReceiptText,
  Search,
  ShieldCheck,
  Sparkles,
  Tags,
  TrendingDown,
  TrendingUp,
  Utensils,
  Wallet,
  Zap,
  ShoppingBag,
} from 'lucide-react'

const ICONS = {
  analytics: BarChart3,
  balance: Wallet,
  bookopen: BookOpen,
  briefcasebusiness: BriefcaseBusiness,
  carfront: CarFront,
  circledollarsign: CircleDollarSign,
  clapperboard: Clapperboard,
  coins: Coins,
  creditcard: CreditCard,
  default: Package,
  education: BookOpen,
  entertainment: Clapperboard,
  expense: TrendingDown,
  freelance: Laptop,
  food: Utensils,
  greeting: Sparkles,
  health: HeartPulse,
  home: House,
  housing: House,
  income: TrendingUp,
  investment: TrendingUp,
  laptop: Laptop,
  logging: Zap,
  other: Package,
  package: Package,
  plane: Plane,
  private: ShieldCheck,
  receipttext: ReceiptText,
  search: Search,
  secure: ShieldCheck,
  shopping: ShoppingBag,
  salary: BriefcaseBusiness,
  tags: Tags,
  transaction: ReceiptText,
  transactions: ReceiptText,
  transport: CarFront,
  travel: Plane,
  utilities: Bolt,
  wallet: Wallet,
}

const EMOJI_ALIASES = {
  ['\u26a1']: 'logging',
  ['\u{1F4CA}']: 'analytics',
  ['\u{1F5C2}\uFE0F']: 'tags',
  ['\u{1F512}']: 'secure',
  ['\u{1F44B}']: 'greeting',
  ['\u{1F4B0}']: 'balance',
  ['\u{1F4C8}']: 'income',
  ['\u{1F4C9}']: 'expense',
  ['\u{1F4FE}']: 'transaction',
  ['\u{1F9EE}']: 'coins',
  ['\u{1F50D}']: 'search',
  ['\u{1F4B5}']: 'income',
  ['\u{1F4B3}']: 'creditcard',
  ['\u{1F354}']: 'food',
  ['\u{1F4BC}']: 'salary',
  ['\u{1F697}']: 'transport',
  ['\u{1F6CD}\uFE0F']: 'shopping',
  ['\u{1F3AC}']: 'entertainment',
  ['\u{1F3E5}']: 'health',
  ['\u{1F3E0}']: 'housing',
  ['\u{1F4DA}']: 'education',
  ['\u2708\uFE0F']: 'travel',
  ['\u{1F4BB}']: 'freelance',
  ['\u{1F4E6}']: 'other',
}

function normalizeIconName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

export function AppIcon({ name, size = 16, strokeWidth = 2, className, ...props }) {
  const normalized = normalizeIconName(EMOJI_ALIASES[name] || name)
  const Icon = ICONS[normalized] || ICONS.default

  return <Icon size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" focusable="false" {...props} />
}