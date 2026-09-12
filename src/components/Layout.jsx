import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: '首页' },
  { to: '/publish', label: '发布' },
  { to: '/orders', label: '订单' },
  { to: '/profile', label: '我的' },
];

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-64 bg-[radial-gradient(circle_at_top,rgba(87,104,244,0.18),transparent_58%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-24 pt-6 md:px-6">
        {children}
      </div>

      <nav className="fixed bottom-4 left-1/2 z-20 flex w-[min(92vw,32rem)] -translate-x-1/2 items-center justify-between rounded-full border border-white/60 bg-white/88 px-3 py-2 shadow-card backdrop-blur">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? 'bg-brand-600 text-white' : 'text-slate-500'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default Layout;
