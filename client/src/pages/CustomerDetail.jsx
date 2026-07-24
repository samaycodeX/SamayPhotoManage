import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { money, formatDate } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/dashboard/StatCard';
import { QuickAddDialog } from '../components/customers/QuickAddDialog';
import { WorkflowCard } from '../components/customers/WorkflowCard';

function Section({ title, kind, rows, onAdd, renderRow, emptyText, addLabel }) {
  return (
    <section className="border border-border rounded-sm bg-white">
      <div className="flex min-h-8 items-center justify-between gap-2 border-b border-border px-2 py-1">
        <h3 className="text-sm font-semibold text-primary">{title}</h3>
        <button
          type="button"
          onClick={() => onAdd(kind)}
          className="inline-flex h-6 items-center gap-1 rounded-sm border border-border bg-white px-2 text-xs text-primary"
        >
          <Plus size={13} />
          {addLabel || 'Add'}
        </button>
      </div>
      {rows?.length ? (
        <div className="divide-y divide-border">{rows.map(renderRow)}</div>
      ) : (
        <p className="px-2 py-2 text-xs text-secondary">{emptyText}</p>
      )}
    </section>
  );
}

function PlainSection({ title, children }) {
  return (
    <section className="border border-border rounded-sm bg-white">
      <div className="min-h-8 border-b border-border px-2 py-1">
        <h3 className="text-sm font-semibold text-primary">{title}</h3>
      </div>
      <div className="px-2 py-2 text-sm">{children}</div>
    </section>
  );
}

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [addKind, setAddKind] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [editError, setEditError] = useState('');
  const [details, setDetails] = useState({ customerName: '', mobileNumber: '', address: '' });

  const { data, isLoading, isError, refetch } = useQuery(['customer-overview', id], () =>
    api.get(`/customers/${id}/overview`).then((r) => r.data)
  );

  if (isLoading) {
    return <div className="space-y-2"><Skeleton className="h-12" /><Skeleton className="h-24" /></div>;
  }

  if (isError || !data) {
    return <p className="border border-danger/30 px-2 py-2 text-sm text-danger">Unable to load this customer. It may no longer exist.</p>;
  }

  const { customer, events, services, deliverables, payments, expenses, workflow, totals } = data;

  const setMainEvent = async (eventId) => {
    await api.patch(`/events/${eventId}`, { isMainEvent: true });
    refetch();
  };

  const removeCustomer = async () => {
    if (!window.confirm(`Remove ${customer.customerName}? This also removes its events, payments, expenses, and workflow.`)) return;
    setRemoving(true);
    try {
      await api.delete(`/customers/${id}`);
      navigate('/customers');
    } finally {
      setRemoving(false);
    }
  };

  const startEditing = () => {
    setDetails({
      customerName: customer.customerName || '',
      mobileNumber: customer.mobileNumber || '',
      address: customer.address || '',
    });
    setEditError('');
    setEditing(true);
  };

  const saveDetails = async (event) => {
    event.preventDefault();
    setSavingDetails(true);
    setEditError('');
    try {
      await api.patch(`/customers/${id}`, details);
      setEditing(false);
      refetch();
    } catch (error) {
      setEditError(error.response?.data?.message || 'Unable to save customer details.');
    } finally {
      setSavingDetails(false);
    }
  };

  return (
    <div className="space-y-2 bg-white text-sm">
      <header className="border border-border rounded-sm px-2 py-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-primary">{customer.customerName}</h2>
            <p className="mt-0.5 text-xs text-secondary">Mobile: {customer.mobileNumber}</p>
            <p className="text-xs text-secondary">Address: {customer.address || 'No address'}</p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="secondary" size="sm" className="h-7 rounded-sm px-2 text-xs shadow-none" onClick={startEditing}>
              <Pencil size={13} /> Edit
            </Button>
            <Button variant="danger" size="sm" className="h-7 rounded-sm px-2 text-xs shadow-none" onClick={removeCustomer} disabled={removing}>
              <Trash2 size={13} /> {removing ? 'Removing...' : 'Delete'}
            </Button>
          </div>
        </div>

        {editing && (
          <form onSubmit={saveDetails} className="mt-2 grid gap-2 border-t border-border pt-2 md:grid-cols-3">
            <label className="text-xs text-secondary">Customer Name
              <input required value={details.customerName} onChange={(e) => setDetails((current) => ({ ...current, customerName: e.target.value }))} className="mt-1 h-7 w-full rounded-sm border border-border px-2 text-sm text-primary" />
            </label>
            <label className="text-xs text-secondary">Mobile Number
              <input required minLength={6} value={details.mobileNumber} onChange={(e) => setDetails((current) => ({ ...current, mobileNumber: e.target.value }))} className="mt-1 h-7 w-full rounded-sm border border-border px-2 text-sm text-primary" />
            </label>
            <label className="text-xs text-secondary">Address
              <input value={details.address} onChange={(e) => setDetails((current) => ({ ...current, address: e.target.value }))} className="mt-1 h-7 w-full rounded-sm border border-border px-2 text-sm text-primary" />
            </label>
            {editError && <p className="text-xs text-danger md:col-span-3">{editError}</p>}
            <div className="flex gap-1 md:col-span-3">
              <Button type="submit" size="sm" className="h-7 rounded-sm px-2 text-xs shadow-none" disabled={savingDetails}>{savingDetails ? 'Saving...' : 'Save changes'}</Button>
              <Button type="button" variant="secondary" size="sm" className="h-7 rounded-sm px-2 text-xs shadow-none" onClick={() => setEditing(false)} disabled={savingDetails}>Cancel</Button>
            </div>
          </form>
        )}
      </header>

      <Section title="Events" kind="events" rows={events} onAdd={setAddKind} emptyText="No events scheduled." renderRow={(event) => (
        <div key={event._id} className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs">
          <label className="flex min-w-0 items-center gap-2 text-primary">
            <input type="radio" name="main-event" checked={Boolean(event.isMainEvent)} onChange={() => setMainEvent(event._id)} className="h-3.5 w-3.5 accent-accent" aria-label={`Set ${event.type} as the main event`} />
            <span><span className="font-medium">{event.type}</span>{event.isMainEvent ? ' (Main)' : ''}{event.venue ? ` — ${event.venue}` : ''}</span>
          </label>
          <span className="shrink-0 text-secondary">{formatDate(event.date)}{event.time ? ` · ${event.time}` : ''}</span>
        </div>
      )} />

      <PlainSection title="Services">
        {services.length ? <p className="text-xs text-primary">{services.join(', ')}</p> : <p className="text-xs text-secondary">No services selected.</p>}
      </PlainSection>

      <PlainSection title="Deliverables">
        {deliverables.length ? (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-primary">
            {deliverables.map((deliverable) => (
              <li key={deliverable}>☑ {deliverable}</li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-secondary">No deliverables selected.</p>
        )}

        {customer.deliverableNotes && (
          <div className="mt-2 border-t border-border pt-2">
            <p className="text-xs font-medium text-primary">Notes</p>
            <p className="text-xs text-secondary">
              {customer.deliverableNotes}
            </p>
          </div>
        )}
      </PlainSection>

      <Section title="Expenses" kind="expenses" rows={expenses} onAdd={setAddKind} emptyText="No expenses recorded." renderRow={(expense) => (
        <div key={expense._id} className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs">
          <span className="text-primary">{expense.category}</span>
          <span className="ml-auto text-secondary">{formatDate(expense.date)}</span>
          <span className="w-20 text-right font-medium text-primary">{money(expense.amount)}</span>
        </div>
      )} />

      <Section title="Payments" kind="payments" addLabel="Add Payment" rows={payments} onAdd={setAddKind} emptyText="No payments recorded." renderRow={(payment) => (
        <div key={payment._id} className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs">
          <span className="text-primary">{payment.method}{payment.notes ? ` — ${payment.notes}` : ''}</span>
          <span className="ml-auto text-secondary">{formatDate(payment.date)}</span>
          <span className="w-20 text-right font-medium text-primary">{money(payment.amount)}</span>
        </div>
      )} />

      <PlainSection title="Payment Summary">
        <dl className="grid max-w-sm grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-xs">
          <dt className="text-secondary">Package Amount</dt><dd className="text-right text-primary">{money(totals.totalBilled)}</dd>
          <dt className="text-secondary">Total Paid</dt><dd className="text-right text-primary">{money(totals.totalPaid)}</dd>
          <dt className="text-secondary">Remaining Due</dt><dd className="text-right text-primary">{money(totals.remainingDue)}</dd>
          <dt className="text-secondary">Total Expense</dt><dd className="text-right text-primary">{money(totals.totalExpense)}</dd>
        </dl>
      </PlainSection>

      <WorkflowCard workflow={workflow} customerId={id} onChange={refetch} />

      <QuickAddDialog kind={addKind} customerId={id} open={!!addKind} onClose={() => setAddKind(null)} onSaved={refetch} />
    </div>
  );
}
