import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

export function ListCard({ title, action, rows, renderRow, emptyText = 'Nothing here yet.' }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className="space-y-1">
        {rows?.length ? (
          rows.map((row) => (
            <div
              key={row._id}
              className="flex items-center justify-between gap-3 rounded-md px-2 py-2.5 text-sm hover:bg-surface"
            >
              {renderRow(row)}
            </div>
          ))
        ) : (
          <p className="py-6 text-center text-sm text-secondary">{emptyText}</p>
        )}
      </CardContent>
    </Card>
  );
}
