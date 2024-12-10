'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  UserGroupIcon, 
  DocumentCheckIcon, 
  BellIcon, 
  ChartBarIcon, 
  ArrowLeftOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '@/app/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
    { name: 'Semua Laporan', href: '/admin/users', icon: UserGroupIcon },
    { name: 'Laporan Approval', href: '/admin/laporan', icon: DocumentCheckIcon },
    { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
  ];

  return (
    <div className="fixed h-full w-64 bg-gray-800 text-white">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-colors ${
                  isActive ? 'bg-gray-700' : ''
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={logout}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-colors w-full text-left"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </div>
  );
} 