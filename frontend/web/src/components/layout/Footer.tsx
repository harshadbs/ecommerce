import Link from 'next/link';

const columns = [
  {
    title: 'Shop',
    links: [
      { href: '/products', label: 'All products' },
      { href: '/categories', label: 'Categories' },
      { href: '/products?featured=true', label: 'Featured' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/profile', label: 'My account' },
      { href: '/profile/orders', label: 'My orders' },
      { href: '/profile/wishlist', label: 'Wishlist' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-secondary-100">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <p className="font-display text-2xl font-semibold text-brand">E-Store</p>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Your one-stop shop for all your needs. Quality products at the best prices.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="eyebrow">{col.title}</h3>
              <ul className="mt-4 space-y-1">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="inline-flex min-h-[36px] items-center text-sm text-secondary-700 hover:text-brand">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="eyebrow">Support</h3>
            <ul className="mt-4 space-y-2 text-sm text-secondary-700">
              <li>support@estore.in</li>
              <li>+91 98765 43210</li>
              <li>Mon–Sat, 9am–6pm IST</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-line pt-6 text-sm text-muted">
          © {new Date().getFullYear()} E-Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
