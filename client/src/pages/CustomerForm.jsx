import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label, Select } from '../components/ui/Label';
import { Button } from '../components/ui/Button';
import { money } from '../lib/utils';

const EVENT_TYPES = ['Wedding', 'Engagement', 'Haldi', 'Mehendi', 'Reception', 'Birthday', 'Baby Shower', 'Pre Wedding', 'Other'];
const SERVICE_TYPES = ['Photography', 'Videography', 'Candid', 'Drone', 'Cinematic', 'Pre Wedding','Live Streaming', 'Other'];
const DELIVERABLE_TYPES = ['Wedding Album', 'Engagement Album', 'Traditional Video', 'Cinematic Film', 'Instagram Reel', 'Teaser', 'Highlight','Frame'];
const PAYMENT_METHODS = ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Other'];
const EXPENSE_CATEGORIES = ['Travel', 'Team', 'Food', 'Hotel', 'Editing', 'Album', 'Frame', 'Other'];

const blankEvent = { type: '', date: '', time: '', endTime: '', venue: '', googleMapLink: '', isMainEvent: true };
const blankPayment = { amount: '', date: new Date().toISOString().slice(0, 10), method: 'Cash', notes: '' };
const blankExpense = { category: '', amount: '', date: new Date().toISOString().slice(0, 10), notes: '' };

function Section({ title, description, children, action }) {
  return (
    <Card className="rounded-md shadow-none border border-border">
      <CardHeader className="flex-row items-center justify-between gap-2 py-2 px-3">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && <p className="mt-0.5 text-xs text-secondary">{description}</p>}
        </div>
        {action}
      </CardHeader>
      <CardContent className="space-y-2 px-3 pb-3 pt-0">{children}</CardContent>
    </Card>
  );
}

function RemoveButton({ onClick, label }) {
  return (
    <Button type="button" variant="secondary" size="sm" onClick={onClick} aria-label={label} className="h-8 w-8 p-0">
      <Trash2 size={14} />
    </Button>
  );
}

function SelectField({ label, options, ...props }) {
  return (
    <div>
      <Label className="text-xs font-medium">{label}</Label>
      <Select className="h-9 text-sm" {...props}>
        <option value="">Select…</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </Select>
    </div>
  );
}

export default function CustomerForm() {
  const navigate = useNavigate();
  const { register, control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      customer: { customerName: '', mobileNumber: '', whatsappNumber: '', email: '', address: '', reference: '', notes: '', packageAmount: '' },
      events: [], services: [], deliverables: [], deliverableNotes: '', payments: [], expenses: [],
    },
  });
  const events = useFieldArray({ control, name: 'events' });
  const payments = useFieldArray({ control, name: 'payments' });
  const expenses = useFieldArray({ control, name: 'expenses' });
  const packageAmount = Number(watch('customer.packageAmount')) || 0;
  const totalPaid = (watch('payments') || []).reduce((total, payment) => total + (Number(payment.amount) || 0), 0);
  const remainingDue = Math.max(0, packageAmount - totalPaid);

  const removeEvent = (index) => {
    const remainingEvents = (watch('events') || []).filter((_, eventIndex) => eventIndex !== index);
    const hasMainEvent = remainingEvents.some((event) => event.isMainEvent);
    events.replace(remainingEvents.map((event, eventIndex) => ({
      ...event,
      isMainEvent: hasMainEvent ? event.isMainEvent : eventIndex === 0,
    })));
  };

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      customer: { ...values.customer, packageAmount: Number(values.customer.packageAmount) },
      events: values.events.filter((event) => event.type && event.date),
      services: values.services || [],
      deliverables: values.deliverables || [],
      payments: values.payments.filter((payment) => payment.amount !== '').map((payment) => ({ ...payment, amount: Number(payment.amount) })),
      expenses: values.expenses.filter((expense) => expense.category && expense.amount !== '').map((expense) => ({ ...expense, amount: Number(expense.amount) })),
    };
    const { data } = await api.post('/customers', payload);
    navigate(`/customers/${data._id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-7xl space-y-3 pb-6">
      <div>
        <h2 className="text-xl font-semibold text-primary">New customer booking</h2>
        <p className="mt-0.5 text-xs text-secondary">Capture the complete booking, then save it once.</p>
      </div>

      <Section title="Customer information">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <Label className="text-xs font-medium">Customer Name *</Label>
            <Input className="h-9 text-sm" {...register('customer.customerName', { required: true })} />
            <p className="mt-0.5 text-xs text-danger">{errors.customer?.customerName && 'Customer name is required.'}</p>
          </div>
          <div>
            <Label className="text-xs font-medium">Mobile Number *</Label>
            <Input className="h-9 text-sm" {...register('customer.mobileNumber', { required: true })} />
            <p className="mt-0.5 text-xs text-danger">{errors.customer?.mobileNumber && 'Mobile number is required.'}</p>
          </div>
          <div>
            <Label className="text-xs font-medium">Address</Label>
            <Input className="h-9 text-sm" {...register('customer.address')} />
          </div>
        </div>
      </Section>

      <Section
        title="Event Information"
        action={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() =>
              events.append({
                ...blankEvent,
                date: new Date().toISOString().split("T")[0],
                isMainEvent: events.fields.length === 0,
              })
            }
          >
            <Plus size={14} />
          </Button>
        }
      >
        {events.fields.length === 0 && (
          <p className="py-3 text-center text-xs text-secondary">
            No events added yet.
          </p>
        )}

        <div className="space-y-2">
          {events.fields.map((field, index) => (
            <div key={field.id} className="rounded-md border border-border px-2 py-1.5">
              <div className="grid items-end gap-2 md:grid-cols-[28px_1fr_1fr_1.4fr_32px]">
                {/* Main Event */}
                <div className="flex justify-center pb-2">
                  <input
                    type="radio"
                    name="main-event"
                    checked={watch(`events.${index}.isMainEvent`)}
                    onChange={() =>
                      events.fields.forEach((_, i) =>
                        setValue(`events.${i}.isMainEvent`, i === index)
                      )
                    }
                    className="h-3.5 w-3.5 accent-accent"
                    title="Main Event"
                  />
                </div>

                {/* Event Name */}
                <SelectField
                  label="Event Name"
                  options={EVENT_TYPES}
                  {...register(`events.${index}.type`)}
                />

                {/* Event Date */}
                <div>
                  <Label className="text-xs font-medium">Event Date</Label>
                  <Input
                    type="date"
                    className="h-9 text-sm"
                    {...register(`events.${index}.date`)}
                    defaultValue={new Date().toISOString().split("T")[0]}
                  />
                </div>

                {/* Venue */}
                <div>
                  <Label className="text-xs font-medium">Venue</Label>
                  <Input
                    placeholder="Enter venue"
                    className="h-9 text-sm"
                    {...register(`events.${index}.venue`)}
                  />
                </div>

                {/* Delete */}
                <div className="flex justify-center pb-2">
                  <RemoveButton
                    label="Remove event"
                    onClick={() => removeEvent(index)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Services" description="Select every service included in this booking.">
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {SERVICE_TYPES.map((service) => {
            const selected = (watch('services') || []).includes(service);
            return (
              <label key={service} className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 text-[13px] font-medium transition-colors ${selected ? 'border-accent text-accent' : 'border-border bg-card text-primary hover:bg-surface'}`}>
                <input type="checkbox" value={service} {...register('services')} className="h-3.5 w-3.5 accent-accent" />
                {service}
              </label>
            );
          })}
        </div>
      </Section>

      <Section title="Deliverables" description="Select the final items included in this booking.">
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {DELIVERABLE_TYPES.map((deliverable) => {
            const selected = (watch('deliverables') || []).includes(deliverable);
            return (
              <label key={deliverable} className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 text-[13px] font-medium transition-colors ${selected ? 'border-accent text-accent' : 'border-border bg-card text-primary hover:bg-surface'}`}>
                <input type="checkbox" value={deliverable} {...register('deliverables')} className="h-3.5 w-3.5 accent-accent" />
                {deliverable}
              </label>
            );
          })}
        </div>
        <div>
          <Label className="text-xs font-medium">Notes</Label>
          <textarea
            placeholder="Example: Album with matte finish. Customer requested teaser before full video."
            className="min-h-14 w-full rounded-md border border-border bg-card px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent/30"
            {...register('deliverableNotes')}
          />
        </div>
      </Section>

      <Section title="Payment" description="Package amount is fixed once the booking is saved. Add future installments from the customer details page.">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <Label className="text-xs font-medium">Package Amount *</Label>
            <Input type="number" min="0" className="h-9 text-sm" {...register('customer.packageAmount', { required: true })} />
            <p className="mt-0.5 text-xs text-danger">{errors.customer?.packageAmount && 'Package amount is required.'}</p>
          </div>
          <div>
            <Label className="text-xs font-medium">Total Paid</Label>
            <div className="flex h-9 items-center rounded-md border border-border bg-surface px-2 text-sm">{money(totalPaid)}</div>
          </div>
          <div>
            <Label className="text-xs font-medium">Remaining Due</Label>
            <div className="flex h-9 items-center rounded-md border border-border bg-surface px-2 text-sm font-medium">{money(remainingDue)}</div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-primary">Advance payment</p>
          <Button type="button" variant="secondary" size="sm" className="h-8" onClick={() => payments.append(blankPayment)}>
            <Plus size={14} /> Add Payment
          </Button>
        </div>
        {payments.fields.map((field, index) => (
          <div key={field.id} className="grid gap-2 rounded-md border border-border p-2 md:grid-cols-4">
            <div>
              <Label className="text-xs font-medium">Amount</Label>
              <Input type="number" min="0" className="h-9 text-sm" {...register(`payments.${index}.amount`)} />
            </div>
            <div>
              <Label className="text-xs font-medium">Date</Label>
              <Input type="date" className="h-9 text-sm" {...register(`payments.${index}.date`)} />
            </div>
            <SelectField label="Method" options={PAYMENT_METHODS} {...register(`payments.${index}.method`)} />
            <div className="flex items-end">
              <RemoveButton label="Remove payment" onClick={() => payments.remove(index)} />
            </div>
            <div className="md:col-span-3">
              <Label className="text-xs font-medium">Notes</Label>
              <Input className="h-9 text-sm" {...register(`payments.${index}.notes`)} />
            </div>
          </div>
        ))}
      </Section>

      <Section
        title="Expenses"
        action={
          <Button type="button" variant="secondary" size="sm" className="h-8" onClick={() => expenses.append(blankExpense)}>
            <Plus size={14} /> Add Expense
          </Button>
        }
      >
        {expenses.fields.map((field, index) => (
          <div key={field.id} className="grid gap-2 rounded-md border border-border p-2 md:grid-cols-4">
            <SelectField label="Category" options={EXPENSE_CATEGORIES} {...register(`expenses.${index}.category`)} />
            <div>
              <Label className="text-xs font-medium">Amount</Label>
              <Input type="number" min="0" className="h-9 text-sm" {...register(`expenses.${index}.amount`)} />
            </div>
            <div>
              <Label className="text-xs font-medium">Date</Label>
              <Input type="date" className="h-9 text-sm" {...register(`expenses.${index}.date`)} />
            </div>
            <div className="flex items-end">
              <RemoveButton label="Remove expense" onClick={() => expenses.remove(index)} />
            </div>
            <div className="md:col-span-3">
              <Label className="text-xs font-medium">Notes</Label>
              <Input className="h-9 text-sm" {...register(`expenses.${index}.notes`)} />
            </div>
          </div>
        ))}
        {!expenses.fields.length && <p className="text-xs text-secondary">No expenses added yet.</p>}
      </Section>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" className="h-9" onClick={() => navigate(-1)}>Cancel</Button>
        <Button type="submit" className="h-9" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save Customer'}</Button>
      </div>
    </form>
  );
}