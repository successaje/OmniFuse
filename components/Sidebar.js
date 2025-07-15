import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const navLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
  { name: 'Admin', path: '/admin', icon: '🛠️' },
  { name: 'Docs', path: 'https://docs.omnifuse.com', icon: '📄', external: true },
  { name: 'Faucet', path: 'https://faucet.zetachain.com', icon: '💧', external: true },
];

export default function Sidebar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return (
    <aside className="hidden lg:flex flex-col fixed top-16 left-0 h-[calc(100vh-4rem)] w-56 bg-[#181C23]/80 border-r border-[#23272F]/60 shadow-lg z-20 backdrop-blur-lg py-8 px-4 space-y-2">
      {navLinks.map(link => link.external ? (
        <a
          key={link.name}
          href={link.path}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 px-4 py-3 rounded-xl nav-link hover:scale-[1.03] transition-transform"
        >
          <span className="text-xl">{link.icon}</span>
          <span className="font-medium">{link.name}</span>
        </a>
      ) : (
        <button
          key={link.name}
          onClick={() => router.push(link.path)}
          className={`flex items-center space-x-3 px-4 py-3 rounded-xl nav-link hover:scale-[1.03] transition-transform w-full text-left ${router.pathname === link.path ? 'active' : ''}`}
        >
          <span className="text-xl">{link.icon}</span>
          <span className="font-medium">{link.name}</span>
        </button>
      ))}
    </aside>
  );
} 