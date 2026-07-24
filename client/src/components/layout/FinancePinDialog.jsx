import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';

export function FinancePinDialog({ open, onClose }) {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/finance/verify-pin', { pin });
      setPin('');
      onClose();
      navigate('/finance');
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        setPin('');
        setError('');
        onClose();
      }}
      title="Unlock Finance"
      description="Enter your 6-digit secure PIN to view financial reports."
    >
      <form onSubmit={submit} className="space-y-4">
        <Input
          autoFocus
          maxLength={6}
          inputMode="numeric"
          placeholder="••••••"
          className="text-center text-lg tracking-[0.5em]"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={pin.length !== 6 || loading}>
            {loading ? 'Verifying…' : 'Verify PIN'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
