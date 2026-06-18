import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

export function DashboardLayout() {
  return (
    <div className="flex h-screen gap-3 overflow-hidden bg-background p-3">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <Topbar />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
