import Link from 'next/link';
import UserNav from './UserNav';

export default function AppHeader() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-gray-800">
              Next Best Action
            </Link>
            <nav className="hidden md:flex gap-6">
                <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                    Dashboard
                </Link>
                <Link href="/clients" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                    Clients
                </Link>
            </nav>
          </div>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
