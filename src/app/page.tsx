import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RefreshCw,
  Headphones,
  Star,
  TrendingUp,
  Zap,
  Smartphone,
  Shirt,
  Footprints,
  Home,
  Sparkles,
  Dumbbell,
  Coffee,
  Package,
  CreditCard,
  Undo2,
} from 'lucide-react';
import ProductCard from '@/components/shop/ProductCard';
import { getProducts } from '@/lib/db';

const CATEGORIES = [
  { name: 'Electronics',     icon: Smartphone, color: 'from-blue-50 to-blue-100',     border: 'border-blue-200',   text: 'text-blue-700'   },
  { name: 'Fashion',         icon: Shirt,       color: 'from-pink-50 to-pink-100',     border: 'border-pink-200',   text: 'text-pink-700'   },
  { name: 'Footwear',        icon: Footprints,  color: 'from-orange-50 to-orange-100', border: 'border-orange-200', text: 'text-orange-700' },
  { name: 'Home & Living',   icon: Home,        color: 'from-green-50 to-green-100',   border: 'border-green-200',  text: 'text-green-700'  },
  { name: 'Beauty',          icon: Sparkles,    color: 'from-purple-50 to-purple-100', border: 'border-purple-200', text: 'text-purple-700' },
  { name: 'Sports & Fitness',icon: Dumbbell,    color: 'from-yellow-50 to-yellow-100', border: 'border-yellow-200', text: 'text-yellow-700' },
  { name: 'Food & Drinks',   icon: Coffee,      color: 'from-amber-50 to-amber-100',   border: 'border-amber-200',  text: 'text-amber-700'  },
];

const HERO_PERKS = [
  { icon: Package,    text: 'Free Delivery over KES 2,000', sub: 'Nationwide'         },
  { icon: CreditCard, text: 'Pay with M-Pesa',              sub: 'Instant & Secure'   },
  { icon: Undo2,      text: '7-Day Returns',                sub: 'No questions asked' },
];

export default async function HomePage() {
  
const raw = await getProducts();
type RawProduct = typeof raw[number];
const allProducts = raw.map((p: RawProduct) => ({
  ...p,
  originalPrice: p.originalPrice ?? undefined,
  images: (p.images as string[]) ?? [],
  tags: (p.tags as string[]) ?? [],
  createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
  updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
}));


  const featured = allProducts
    .filter(p => p.featured && p.active)
    .slice(0, 8);
  const newest = allProducts
    .filter(p => p.active)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden text-white">
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80"
          alt=""
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Dark green overlay so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 via-green-800/85 to-green-700/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6 text-sm font-medium">
              <Zap size={14} className="text-yellow-300" />
              New arrivals every week
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
              Shop Smart,<br />
              <span className="text-yellow-300">Live Better</span>
            </h1>

            <p className="text-lg text-green-100 mb-8 leading-relaxed">
              Discover thousands of products at unbeatable prices. Pay with M-Pesa or cash on delivery.
              Fast shipping across Kenya.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 bg-white text-green-700 hover:bg-green-50 font-bold px-8 py-4 rounded-xl transition-all shadow-xl text-base"
              >
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link
                href="/shop?featured=true"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-xl transition-all text-base"
              >
                Featured Deals
              </Link>
            </div>

            <div className="flex flex-wrap gap-8 mt-10">
              {[
                ['10,000+', 'Products'],
                ['50,000+', 'Happy Customers'],
                ['4.8', 'Rating'],
              ].map(([v, l]) => (
                <div key={l}>
                  <div className="flex items-center gap-1 text-2xl font-black text-yellow-300">
                    {v}
                    {l === 'Rating' && <Star size={18} className="fill-yellow-300 text-yellow-300" />}
                  </div>
                  <div className="text-green-200 text-sm">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating perk cards */}
        <div className="hidden lg:flex flex-col gap-3 absolute right-12 top-1/2 -translate-y-1/2">
          {HERO_PERKS.map(({ icon: Icon, text, sub }) => (
            <div
              key={text}
              className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 flex items-center gap-3"
            >
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">{text}</p>
                <p className="text-xs text-green-200">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES BAR ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Truck className="text-green-600" size={22} />,       title: 'Fast Delivery',   sub: 'Nairobi same-day available'  },
              { icon: <ShieldCheck className="text-green-600" size={22} />, title: 'Secure Payment',  sub: 'M-Pesa & Cash accepted'      },
              { icon: <RefreshCw className="text-green-600" size={22} />,   title: '7-Day Returns',   sub: 'Easy hassle-free returns'    },
              { icon: <Headphones className="text-green-600" size={22} />,  title: '24/7 Support',    sub: 'Always here to help'         },
            ].map(f => (
              <div key={f.title} className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Shop by Category</h2>
          <Link href="/shop" className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {CATEGORIES.map(({ name, icon: Icon, color, border, text }) => (
            <Link
              key={name}
              href={`/shop?category=${encodeURIComponent(name)}`}
              className={`bg-gradient-to-br ${color} border ${border} rounded-2xl p-4 flex flex-col items-center gap-2.5 hover:scale-105 transition-all duration-200 hover:shadow-md`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/60`}>
                <Icon size={20} className={text} />
              </div>
              <span className={`text-xs font-semibold ${text} text-center leading-tight`}>{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
          </div>
          <Link href="/shop?featured=true" className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1">
            See all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      {/* ── PROMO BANNER ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl overflow-hidden text-white grid md:grid-cols-2 items-center">
          {/* Content */}
          <div className="flex flex-col gap-4 p-8 md:p-12">
            <p className="text-orange-200 font-medium">Limited Time Offer</p>
            <h3 className="text-2xl md:text-3xl font-black leading-tight">
              Up to 30% OFF<br />on Electronics
            </h3>
            <p className="text-orange-100">
              Don&apos;t miss out on our biggest sale of the season
            </p>
            <Link
              href="/shop?category=Electronics"
              className="inline-flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 font-bold px-7 py-3.5 rounded-xl shadow-xl transition-all w-fit"
            >
              Shop Electronics <ArrowRight size={18} />
            </Link>
          </div>

          {/* Product image */}
          <div className="relative h-56 md:h-72 w-full">
            <Image
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop&q=80"
              alt="Headphones on sale"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-500/20 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-green-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">New Arrivals</h2>
          </div>
          <Link href="/shop" className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1">
            Browse all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {newest.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      {/* ── M-PESA BANNER ── */}
      <section className="bg-green-600 py-12 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center flex-shrink-0">
              <CreditCard size={28} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Pay Easily with M-Pesa</h3>
              <p className="text-green-100">Lipa na M-Pesa. Fast, secure, convenient payments on all orders.</p>
            </div>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-white text-green-700 hover:bg-green-50 font-bold px-8 py-4 rounded-xl shadow-xl flex-shrink-0"
          >
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}