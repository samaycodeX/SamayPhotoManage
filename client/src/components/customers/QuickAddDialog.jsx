import { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Label';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';

const EVENT_TYPES = ['Wedding', 'Engagement', 'Haldi', 'Mehendi', 'Reception', 'Birthday', 'Baby Shower', 'Pre Wedding', 'Other'];
const PAYMENT_METHODS = ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Other'];
const EXPENSE_CATEGORIES = ['Travel', 'Team', 'Food', 'Hotel', 'Editing', 'Album', 'Frame', 'Other'];

const CONFIG = {
  events: { title: 'Add event', endpoint: '/events', typeField: 'type', options: EVENT_TYPES, hasDate: true, hasTime: true, hasVenue: true },
  payments: { title: 'Add payment', endpoint: '/payments', typeField: 'method', options: PAYMENT_METHODS, hasAmount: true, hasDate: true, hasNotes: true },
  expenses: { title: 'Add expense', endpoint: '/expenses', typeField: 'category', options: EXPENSE_CATEGORIES, hasAmount: true },
};

export function QuickAddDialog({ kind, customerId, open, onClose, onSaved }) {
  const config = kind ? CONFIG[kind] : null;
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  if (!config) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(config.endpoint, { customer: customerId, ...form });
      setForm({});
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={config.title}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>{config.typeField === 'type' ? 'Event type' : config.typeField === 'name' ? 'Name' : config.typeField === 'method' ? 'Method' : 'Category'}</Label>
          <Select required value={form[config.typeField] || ''} onChange={set(config.typeField)}>
            <option value="" disabled>Select…</option>
            {config.options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </Select>
        </div>

        {config.hasDate && (
          <div className={config.hasTime ? 'grid grid-cols-2 gap-3' : ''}>
            <div>
              <Label>Date</Label>
              <Input type="date" required value={form.date || ''} onChange={set('date')} />
            </div>
            {config.hasTime && <div>
              <Label>Time</Label>
              <Input type="time" value={form.time || ''} onChange={set('time')} />
            </div>}
          </div>
        )}
        {config.hasVenue && (
          <div>
            <Label>Venue</Label>
            <Input value={form.venue || ''} onChange={set('venue')} />
          </div>
        )}
        {config.hasPrice && (
          <div>
            <Label>Price (₹)</Label>
            <Input type="number" min="0" value={form.price || ''} onChange={set('price')} />
          </div>
        )}
        {config.hasAmount && (
          <div>
            <Label>Amount (₹)</Label>
            <Input type="number" min="0" required value={form.amount || ''} onChange={set('amount')} />
          </div>
        )}
        {config.hasNotes && (
          <div>
            <Label>Notes</Label>
            <Input value={form.notes || ''} onChange={set('notes')} />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </div>
      </form>
    </Dialog>
  );
}
