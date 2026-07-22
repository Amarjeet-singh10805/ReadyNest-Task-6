import { useState } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Props { open: boolean; onClose: () => void; }

export default function AddPatientModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: 'Patient@123', phone: '' });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { ...form, role: 'PATIENT' });
      toast.success('Patient registered');
      setForm({ firstName: '', lastName: '', email: '', password: 'Patient@123', phone: '' });
      onClose();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to register patient');
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Register New Patient">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" value={form.firstName} onChange={set('firstName')} placeholder="John" required />
          <Input label="Last Name" value={form.lastName} onChange={set('lastName')} placeholder="Doe" required />
        </div>
        <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="patient@example.com" required />
        <Input label="Phone" value={form.phone} onChange={set('phone')} placeholder="+1 234 567 8900" />
        <Input label="Temporary Password" type="password" value={form.password} onChange={set('password')} required />
        <p className="text-xs text-muted-foreground">Patient will use this password to log in. Ask them to change it after first login.</p>
        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Register Patient</Button>
        </div>
      </form>
    </Modal>
  );
}
