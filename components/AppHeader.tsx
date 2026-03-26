import Link from 'next/link';
import UserNav from './UserNav';

export default function AppHeader() {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-base font-bold text-slate-900 tracking-tight hover:text-primary transition-colors duration-200">
              Next Best Action
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-all duration-200">
                Dashboard
              </Link>
              <Link href="/clients" className="text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-all duration-200">
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
