import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { PageHeader } from '../components/dashboard/StatCard';

export default function Settings({ email }) {
  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your studio account." />
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Admin account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-secondary">Signed in as</p>
          <p className="mt-1 text-sm font-medium text-primary">{email}</p>
        </CardContent>
      </Card>
    </>
  );
}
