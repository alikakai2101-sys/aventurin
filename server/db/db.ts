import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Product, Order, StoreCategory, SampleItem, SampleCategory, CustomOrder, ChatMessage } from '../../src/types';
import { Coupon } from '../../src/components/UserPages';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
  status: 'active' | 'blocked';
}

export interface DbSchema {
  products: Product[];
  categories: Array<{ id: string; name: string }>;
  orders: Order[];
  users: UserRecord[];
  coupons: Coupon[];
  cmsTexts: { about: string; terms: string; contact: string };
  storeSettings: { currencyUnit: 'تومان' | 'ریال'; shippingCost: number; taxPercent: number };
  sampleItems: SampleItem[];
  sampleCategories: SampleCategory[];
  customOrders: CustomOrder[];
  chatMessages: ChatMessage[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'server-db.json');

// Initial seed data
const initialProducts: Product[] = [
  {
    id: 'p1',
    title: 'گردنبند طلا با آویز تک‌نگین الماس',
    description: 'گردنبند ظریف و دست‌ساز از طلای ۱۸ عیار همراه با تک‌نگین الماس درخشان تراش برلیان. انتخابی بی‌نظیر برای درخشش در مهمانی‌ها و هدیه‌ای ماندگار برای عزیزان شما. کاملاً ضدحساسیت و آبکاری شده با رادیوم برای ثبات رنگ همیشگی.',
    price: 1850000,
    image: '/src/assets/images/luxury_necklace_1784386427279.jpg',
    category: 'necklace',
    stock: 8,
    variants: ['طلایی', 'نقره‌ای', 'رزگلد'],
    rating: 4.9,
    isFeatured: true,
    discount: 10
  },
  {
    id: 'p2',
    title: 'انگشتر لوکس طلا با نگین زمرد کلمبیا',
    description: 'انگشتر منحصر‌به‌فرد طرح مارکیز ساخته شده از طلای ۱۸ عیار با نگین زمرد طبیعی کلمبیا با رنگ سبز غلیظ و بی‌نقص. بدنه انگشتر با ظرافت خارق‌العاده مخراج‌کاری شده است. همراه با شناسنامه معتبر سنگ‌های قیمتی.',
    price: 2400000,
    image: '/src/assets/images/luxury_ring_1784386441851.jpg',
    category: 'ring',
    stock: 5,
    variants: ['طلایی', 'سفید'],
    rating: 5.0,
    isFeatured: true
  },
  {
    id: 'p3',
    title: 'گوشواره آویز لوکس با مروارید طبیعی',
    description: 'جفت گوشواره آویز فوق‌العاده زیبا متشکل از مرواریدهای آب شیرین طبیعی و زنجیر طلای باکیفیت. مرواریدها دارای درخشش صدفی خیره‌کننده و یکدست هستند. طراحی ارگونومیک قفل گوشواره مانع از خستگی گوش می‌شود.',
    price: 950000,
    image: '/src/assets/images/luxury_earrings_1784386456583.jpg',
    category: 'earrings',
    stock: 12,
    variants: ['طلایی', 'نقره‌ای'],
    rating: 4.8,
    isFeatured: true
  },
  {
    id: 'p4',
    title: 'دستبند زنجیری مدرن با آویزهای ظریف',
    description: 'دستبند زنانه مدرن با زنجیر چندلایه و آویزهای هندسی مینیمال مینیاتوری. این دستبند از استیل درجه یک جراحی (عیار ۳۱۶) با آبکاری طلای ۲۴ عیار ساخته شده است و برای استفاده روزانه کاملاً مناسب و مقاوم در برابر آب است.',
    price: 1200000,
    image: '/src/assets/images/luxury_bracelet_1784386471951.jpg',
    category: 'bracelet',
    stock: 15,
    variants: ['طلایی', 'رزگلد'],
    rating: 4.7,
    isFeatured: true,
    discount: 15
  },
  {
    id: 'p5',
    title: 'گردنبند چند ردیفه کارتیر و سکه الیزابت',
    description: 'ترکیب مدرن زنجیر ضخیم کارتیر به همراه زنجیر باریک و آویز سکه کلاسیک الیزابت. ساخته شده از فلز مس با پوشش آبکاری طلا زرد چندلایه. استایلی جسورانه و ترند برای دختران جوان علاقمند به مد مدرن.',
    price: 780000,
    image: '/src/assets/images/luxury_necklace_1784386427279.jpg',
    category: 'necklace',
    stock: 20,
    variants: ['طلایی'],
    rating: 4.6,
    discount: 5
  },
  {
    id: 'p6',
    title: 'انگشتر رینگ ظریف هفت نگین کریستال',
    description: 'انگشتر ردیفی مینیمال با هفت کریستال سواروسکی اصل مخراج‌کاری شده به صورت خطی. بسیار شیک برای استفاده تکی یا ست کردن با دیگر انگشترها (Stackable). بدون حساسیت پوستی و با ماندگاری رنگ مادام‌العمر.',
    price: 450000,
    image: '/src/assets/images/luxury_ring_1784386441851.jpg',
    category: 'ring',
    stock: 25,
    variants: ['طلایی', 'نقره‌ای', 'رزگلد'],
    rating: 4.9
  },
  {
    id: 'p7',
    title: 'گوشواره حلقه‌ای آیس‌کات با آبکاری رزگلد',
    description: 'گوشواره‌های حلقه‌ای سایز متوسط با تراش‌های الماسی آیس‌کات که نور را در تمام زوایا منعکس می‌کنند. دارای رنگ پرطرفدار رزگلد و قفل بسیار ایمن فرانسوی. انتخابی عالی برای هدیه روز زن.',
    price: 620000,
    image: '/src/assets/images/luxury_earrings_1784386456583.jpg',
    category: 'earrings',
    stock: 18,
    variants: ['رزگلد', 'طلایی'],
    rating: 4.5,
    discount: 20
  },
  {
    id: 'p8',
    title: 'دستبند زنجیری کارتیر ظریف کلاسیک',
    description: 'دستبند کارتیر همیشگی و کلاسیک با پهنای ۴ میلی‌متر. تماماً آبکاری طلا زرد، قفل طوطی درجه یک و امکان تنظیم طول دستبند با زنجیر اضافه کارشده در انتهای کار. دوام بسیار بالا و شستشوی آسان.',
    price: 890000,
    image: '/src/assets/images/luxury_bracelet_1784386471951.jpg',
    category: 'bracelet',
    stock: 14,
    variants: ['طلایی', 'نقره‌ای'],
    rating: 4.8
  }
];

const initialCategories = [
  { id: 'all', name: 'همه موارد' },
  { id: 'necklace', name: 'گردنبندها' },
  { id: 'ring', name: 'انگشترها' },
  { id: 'earrings', name: 'گوشواره‌ها' },
  { id: 'bracelet', name: 'دستبندها' },
];

const initialCoupons = [
  { code: 'WINTER1405', type: 'percent' as const, value: 15, expiryDate: '2027-03-20', usageLimit: 100, usageCount: 2 },
  { code: 'OFF50', type: 'amount' as const, value: 50000, expiryDate: '2027-06-01', usageLimit: 50, usageCount: 0 },
];

const defaultCms = {
  about: 'گالری آونتورین در سال ۱۳۹۸ با هدف طراحی و ارائه زیورآلات و بدلیجات لوکس و باکیفیت تاسیس شد. ما بر این باوریم که هر قطعه از اکسسوری، داستانی از ظرافت و شخصیت منحصربه‌فرد صاحب خود را روایت می‌کند. تیم طراحی ما با وسواس فراوان برترین متریال ضدحساسیت و سنگ‌های درخشان را دست‌چین کرده و با مجهزترین شیوه‌های آبکاری طلا و رادیوم عرضه می‌دارد.',
  terms: '۱. تمامی خریدهای گالری دارای ۷ روز ضمانت بازگشت کالا و تعویض بی‌قیدوشرط در صورت بروز نقص فنی یا عدم مطابقت با تصاویر می‌باشند.\n۲. ارسال سفارشات از طریق پست پیشتاز ظرف ۲ الی ۴ روز کاری انجام می‌پذیرد.\n۳. اطلاعات خریداران گرامی در سرورهای امن آونتورین ذخیره شده و متعهد به حفظ کامل حریم خصوصی شما هستیم.',
  contact: 'نشانی گالری: مرکزی، محلات، میدان مصطفی خمینی، گالری اونتورین\nتلفن پشتیبانی: ۰۹۳۹۹۳۱۱۸۷۵\nپست الکترونیک: galeriaventurin@gmail.com\nپشتیبانی آنلاین: تلگرام، ایتا، بله، روبیکا، اینستاگرام و واتساپ'
};

const defaultSettings = {
  currencyUnit: 'تومان' as const,
  shippingCost: 35000,
  taxPercent: 9
};

const initialSampleCategories: SampleCategory[] = [
  { id: 'sc-1', name: 'انگشترهای سفارشی' },
  { id: 'sc-2', name: 'گردنبندهای سفارشی' },
  { id: 'sc-3', name: 'گوشواره‌های سفارشی' },
  { id: 'sc-4', name: 'دستبندهای سفارشی' }
];

const initialSampleItems: SampleItem[] = [
  {
    id: 's-1',
    title: 'رینگ دست‌ساز طرح پروانه طلایی',
    description: 'انگشتر فوق‌العاده ظریف و دست‌ساز از طلای ۱۸ عیار با آویز متحرک مینیاتوری پروانه و نگین‌های کوچک برلیان اصل.',
    category: 'ring',
    basePrice: 3200000,
    image: '/src/assets/images/luxury_ring_1784386441851.jpg',
    material: 'gold',
    stone: 'diamond',
    color: 'gold',
    createdAt: new Date().toISOString()
  },
  {
    id: 's-2',
    title: 'گردنبند دست‌ساز آبشاری نقره با مروارید',
    description: 'گردنبند نقره استرلینگ ۹۲۵ دست‌ساز طرح آبشاری همراه با مرواریدهای آب شیرین بیضی و زنجیر کارشده بسیار ظریف.',
    category: 'necklace',
    basePrice: 1950000,
    image: '/src/assets/images/luxury_necklace_1784386427279.jpg',
    material: 'silver',
    stone: 'pearl',
    color: 'silver',
    createdAt: new Date().toISOString()
  },
  {
    id: 's-3',
    title: 'گوشواره آویز هندسی مینیمال رزگلد',
    description: 'گوشواره آویز بلند دست‌ساز با خطوط هندسی متقاطع از جنس استیل ضدحساسیت با روکش آبکاری رزگلد چند لایه.',
    category: 'earrings',
    basePrice: 850000,
    image: '/src/assets/images/luxury_earrings_1784386456583.jpg',
    material: 'rose-gold',
    stone: 'none',
    color: 'rose-gold',
    createdAt: new Date().toISOString()
  },
  {
    id: 's-4',
    title: 'دستبند النگویی طرح بافت امپراطور',
    description: 'دستبند النگویی فوق‌العاده مستحکم ساخته شده با متدهای سنتی بافت فلز از جنس نقره سیاه قلم همراه با نگین فیروزه نیشابور.',
    category: 'bracelet',
    basePrice: 2400000,
    image: '/src/assets/images/luxury_bracelet_1784386471951.jpg',
    material: 'silver',
    stone: 'emerald',
    color: 'silver',
    createdAt: new Date().toISOString()
  }
];

// Create the JSON file with hashed password for admin and default user
export function initDb() {
  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data); // Validate JSON format
      // Upgrade database format in place if handmades arrays are missing
      let mutated = false;
      if (!parsed.sampleItems) { parsed.sampleItems = initialSampleItems; mutated = true; }
      if (!parsed.sampleCategories) { parsed.sampleCategories = initialSampleCategories; mutated = true; }
      if (!parsed.customOrders) { parsed.customOrders = []; mutated = true; }
      if (!parsed.chatMessages) { parsed.chatMessages = []; mutated = true; }
      if (mutated) {
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
        console.log('✅ Local database format successfully upgraded in place to support handmades.');
      }
      return;
    } catch (e) {
      console.error('Corruption detected in database, re-initializing database...');
    }
  }

  // Pre-hash password for initial accounts
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('admin123', salt);
  const userHash = bcrypt.hashSync('user123', salt);

  const initialUsers: UserRecord[] = [
    {
      id: 'u-1',
      name: 'مریم حسینی',
      email: 'maryam@example.com',
      passwordHash: userHash,
      role: 'user',
      status: 'active'
    },
    {
      id: 'u-2',
      name: 'مدیر کل آونتورین',
      email: 'admin@aventurin.com',
      passwordHash: adminHash,
      role: 'admin',
      status: 'active'
    },
    {
      id: 'u-3',
      name: 'آرش علوی',
      email: 'arash@example.com',
      passwordHash: userHash,
      role: 'user',
      status: 'blocked'
    }
  ];

  const schema: DbSchema = {
    products: initialProducts,
    categories: initialCategories,
    orders: [],
    users: initialUsers,
    coupons: initialCoupons,
    cmsTexts: defaultCms,
    storeSettings: defaultSettings,
    sampleItems: initialSampleItems,
    sampleCategories: initialSampleCategories,
    customOrders: [],
    chatMessages: []
  };

  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(schema, null, 2), 'utf-8');
  console.log('Database initialized successfully at ' + DB_FILE_PATH);
}

export function readDb(): DbSchema {
  if (!fs.existsSync(DB_FILE_PATH)) {
    initDb();
  }
  const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
  return JSON.parse(data) as DbSchema;
}

export function writeDb(data: DbSchema) {
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}
