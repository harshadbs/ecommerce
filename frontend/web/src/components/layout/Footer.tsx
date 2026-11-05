import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-secondary-900 text-white mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">E-Store</h3>
            <p className="text-secondary-400 text-sm">Your one-stop shop for all your needs. Quality products at the best prices.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Shop</h4>
            <ul className="space-y-2 text-sm text-secondary-400">
              <li><Link href="/categories" className="hover:text-white">Categories</Link></li>
              <li><Link href="/products" className="hover:text-white">All Products</Link></li>
              <li><Link href="/products?featured=true" className="hover:text-white">Featured</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-secondary-400">
              <li><Link href="/profile" className="hover:text-white">My Account</Link></li>
              <li><Link href="/profile/orders" className="hover:text-white">My Orders</Link></li>
              <li><Link href="/profile/wishlist" className="hover:text-white">Wishlist</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-secondary-400">
              <li><span>Email: support@estore.in</span></li>
              <li><span>Phone: +91 98765 43210</span></li>
              <li><span>Mon-Sat, 9am-6pm IST</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-secondary-700 mt-8 pt-8 text-center text-sm text-secondary-400">
          © {new Date().getFullYear()} E-Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
