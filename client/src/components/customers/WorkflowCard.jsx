import { Button } from '../ui/Button';
import { api } from '../../lib/api';

export function WorkflowCard({ workflow, customerId, onChange }) {
  const create = async () => {
    const { data } = await api.post('/workflow', { customer: customerId });
    onChange(data);
  };

  const toggle = async (index) => {
    const steps = workflow.steps.map((step, i) =>
      i === index ? { ...step, completed: !step.completed, completedAt: !step.completed ? new Date() : null } : step
    );
    const { data } = await api.patch(`/workflow/${workflow._id}`, { steps });
    onChange(data);
  };

  if (!workflow) {
    return (
      <section className="border border-border rounded-sm bg-white">
        <div className="border-b border-border px-2 py-1"><h3 className="text-sm font-semibold text-primary">Workflow</h3></div>
        <div className="px-2 py-2">
          <p className="mb-2 text-xs text-secondary">No workflow started for this customer yet.</p>
          <Button size="sm" className="h-7 rounded-sm px-2 text-xs shadow-none" onClick={create}>Create workflow</Button>
        </div>
      </section>
    );
  }

  const done = workflow.steps.filter((step) => step.completed).length;

  return (
    <section className="border border-border rounded-sm bg-white">
      <div className="flex items-center justify-between border-b border-border px-2 py-1">
        <h3 className="text-sm font-semibold text-primary">Workflow</h3>
        <span className="text-xs text-secondary">{done}/{workflow.steps.length} complete</span>
      </div>
      <div className="grid gap-x-4 gap-y-1 px-2 py-2 sm:grid-cols-2">
        {workflow.steps.map((step, index) => (
          <label key={step.name} className="flex items-center gap-2 text-xs text-primary">
            <input type="checkbox" checked={step.completed} onChange={() => toggle(index)} className="h-3.5 w-3.5 rounded-sm border-border accent-accent" />
            <span className={step.completed ? 'text-secondary line-through' : ''}>{step.name}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
