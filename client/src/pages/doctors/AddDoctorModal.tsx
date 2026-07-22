import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal, Button, Input, Select } from '@/components/ui';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Props { open: boolean; onClose: () => void; }

export default function AddDoctorModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: 'Doctor@123',
    departmentId: '', specialization: '', qualification: '', experience: '5',
    consultationFee: '300', licenseNumber: '', bio: '',
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const { data: depts } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.get('/departments').then(r => r.data.data),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/doctors', { ...form, experience: Number(form.experience), consultationFee: Number(form.consultationFee) });
      toast.success('Doctor added successfully');
      onClose();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to add doctor');
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Doctor">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" value={form.firstName} onChange={set('firstName')} required />
          <Input label="Last Name" value={form.lastName} onChange={set('lastName')} required />
        </div>
        <Input label="Email" type="email" value={form.email} onChange={set('email')} required />
        <Input label="Phone" value={form.phone} onChange={set('phone')} />
        <Select label="Department" value={form.departmentId} onChange={set('departmentId')} required>
          <option value="">Select department</option>
          {(depts || []).map((d: { id: string; name: string }) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </Select>
        <Input label="Specialization" value={form.specialization} onChange={set('specialization')} required />
        <Input label="Qualification" value={form.qualification} onChange={set('qualification')} placeholder="MD, FACC" required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Experience (years)" type="number" value={form.experience} onChange={set('experience')} required />
          <Input label="Consultation Fee ($)" type="number" value={form.consultationFee} onChange={set('consultationFee')} required />
        </div>
        <Input label="License Number" value={form.licenseNumber} onChange={set('licenseNumber')} required />
        <Input label="Temporary Password" type="password" value={form.password} onChange={set('password')} required />
        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Add Doctor</Button>
        </div>
      </form>
    </Modal>
  );
}
