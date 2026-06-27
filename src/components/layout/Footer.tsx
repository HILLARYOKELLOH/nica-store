import Link from 'next/link';
import { Package, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
                <Package size={20} className="text-white" />
              </div>
              <span className="text-xl font-black text-white">NICA <span className="text-green-400">STORE</span></span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Kenya's premier online shopping destination. Quality products, fast delivery, M-Pesa accepted.
            </p>
            <div className="flex items-center gap-3">
              {['f', 'in', 'tw'].map((s, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors text-xs font-bold text-white">
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {([['Home', '/'], ['Shop', '/shop'], ['My Orders', '/orders'], ['My Account', '/account'], ['Cart', '/cart']] as const).map(([l, h]) => (
                <li key={l}><Link href={h} className="text-sm text-gray-400 hover:text-green-400 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-white mb-4">Categories</h4>
            <ul className="space-y-2">
              {['Electronics', 'Fashion', 'Footwear', 'Home & Living', 'Beauty', 'Sports & Fitness'].map(cat => (
                <li key={cat}>
                  <Link href={`/shop?category=${encodeURIComponent(cat)}`} className="text-sm text-gray-400 hover:text-green-400 transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin size={15} className="text-green-400 flex-shrink-0 mt-0.5" />
                <span>Westlands, Nairobi,<br />Kenya</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone size={15} className="text-green-400 flex-shrink-0" />
                <a href="tel:+254700000000" className="hover:text-green-400 transition-colors">+254 700 000 000</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail size={15} className="text-green-400 flex-shrink-0" />
                <a href="mailto:hello@nicastore.co.ke" className="hover:text-green-400 transition-colors">hello@nicastore.co.ke</a>
              </li>
            </ul>
            <div className="mt-5">
              <p className="text-xs text-gray-500 mb-2">We Accept</p>
              <div className="flex gap-2">
                <div className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">M-PESA</div>
                <div className="bg-gray-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg">CASH</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© 2024 NICA STORE. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Returns Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
