import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { FinancePinDialog } from './FinancePinDialog';

export function AppShell({ title, subtitle, email, children }) {
  const [pinOpen, setPinOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar email={email} onFinanceClick={() => setPinOpen(true)} />
      <div className="flex-1">
        <Topbar title={title} subtitle={subtitle} email={email} />
        <main className="mx-auto max-w-6xl space-y-6 px-8 py-6">{children}</main>
      </div>
      <FinancePinDialog open={pinOpen} onClose={() => setPinOpen(false)} />
    </div>
  );
}
