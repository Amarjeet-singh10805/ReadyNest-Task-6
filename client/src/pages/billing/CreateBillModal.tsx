import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal, Button, Input, Select } from '@/components/ui';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

interface Props { open: boolean; onClose: () => void; }

export default function CreateBillModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    appointmentId: '', patientId: '',
    consultFee: '', medicinesFee: '0', labFee: '0', otherFee: '0',
    discount: '0', tax: '5', notes: '',
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const { data: appts } = useQuery({
    queryKey: ['appointments-completed'],
    queryFn: () => api.get('/appointments', { params: { limit: 100, status: 'COMPLETED' } }).then(r => r.data.data.data),
    enabled: open,
  });

  const onApptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const apptId = e.target.value;
    const appt = (appts || []).find((a: { id: string }) => a.id === apptId);
    if (appt) {
      setForm(f => ({ ...f, appointmentId: apptId, patientId: appt.patientId, consultFee: String(appt.fee) }));
    }
  };

  const calcTotal = () => {
    const sub = Number(form.consultFee || 0) + Number(form.medicinesFee) + Number(form.labFee) + Number(form.otherFee);
    return sub - Number(form.discount) + (sub * Number(form.tax) / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.appointmentId) return toast.error('Please select an appointment');
    setLoading(true);
    try {
      await api.post('/billing', {
        appointmentId: form.appointmentId,
        patientId: form.patientId,
        consultFee: Number(form.consultFee),
        medicinesFee: Number(form.medicinesFee),
        labFee: Number(form.labFee),
        otherFee: Number(form.otherFee),
        discount: Number(form.discount),
        tax: Number(form.tax),
        notes: form.notes,
      });
      toast.success('Bill generated');
      setForm({ appointmentId: '', patientId: '', consultFee: '', medicinesFee: '0', labFee: '0', otherFee: '0', discount: '0', tax: '5', notes: '' });
      onClose();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create bill');
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Generate Bill">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Completed Appointment *" onChange={onApptChange} value={form.appointmentId} required>
          <option value="">Select an appointment</option>
          {(appts || []).map((a: {
            id: string;
            patient: { user: { firstName: string; lastName: string } };
            doctor: { user: { firstName: string; lastName: string } };
          }) => (
            <option key={a.id} value={a.id}>
              {a.patient.user.firstName} {a.patient.user.lastName} — Dr. {a.doctor.user.lastName}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Consultation Fee ($)" type="number" value={form.consultFee} onChange={set('consultFee')} required />
          <Input label="Medicines Fee ($)" type="number" value={form.medicinesFee} onChange={set('medicinesFee')} />
          <Input label="Lab Fee ($)" type="number" value={form.labFee} onChange={set('labFee')} />
          <Input label="Other Fee ($)" type="number" value={form.otherFee} onChange={set('otherFee')} />
          <Input label="Discount ($)" type="number" value={form.discount} onChange={set('discount')} />
          <Input label="Tax (%)" type="number" value={form.tax} onChange={set('tax')} />
        </div>

        <div className="p-3 bg-secondary rounded-lg flex justify-between items-center">
          <span className="text-sm font-medium">Total Amount</span>
          <span className="text-lg font-bold text-primary">{formatCurrency(calcTotal())}</span>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Notes</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={2}
            placeholder="Optional notes..."
            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Generate Bill</Button>
        </div>
      </form>
    </Modal>
  );
}
