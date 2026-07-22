import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal, Button, Input, Select } from '@/components/ui';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/store/auth';

interface Props { open: boolean; onClose: () => void; }

export default function BookAppointmentModal({ open, onClose }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    patientId: '', doctorId: '', scheduledAt: '', reason: '', type: 'CONSULTATION',
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  // Fetch patients list (user records with nested patient profile)
  const { data: patientUsers } = useQuery({
    queryKey: ['patients-list-modal'],
    queryFn: () => api.get('/patients', { params: { limit: 200 } }).then(r => r.data.data.data),
    enabled: open && user?.role !== 'PATIENT',
  });

  // Fetch the current patient's own profile if logged in as patient
  const { data: myProfile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get('/users/me').then(r => r.data.data),
    enabled: open && user?.role === 'PATIENT',
  });

  const { data: doctors } = useQuery({
    queryKey: ['doctors-list-modal'],
    queryFn: () => api.get('/doctors', { params: { limit: 100 } }).then(r => r.data.data.data),
    enabled: open,
  });

  const selectedDoctor = (doctors || []).find((d: { id: string }) => d.id === form.doctorId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.doctorId) return toast.error('Please select a doctor');
    if (!form.scheduledAt) return toast.error('Please select a date and time');

    let patientId = form.patientId;

    // If logged in as patient, get their patient profile id
    if (user?.role === 'PATIENT') {
      patientId = myProfile?.patient?.id;
      if (!patientId) return toast.error('Patient profile not found. Please complete your profile first.');
    } else {
      if (!patientId) return toast.error('Please select a patient');
    }

    setLoading(true);
    try {
      await api.post('/appointments', {
        patientId,
        doctorId: form.doctorId,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        reason: form.reason,
        type: form.type,
        fee: Number(selectedDoctor?.consultationFee || 0),
        duration: 30,
      });
      toast.success('Appointment booked!');
      setForm({ patientId: '', doctorId: '', scheduledAt: '', reason: '', type: 'CONSULTATION' });
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <Modal open={open} onClose={onClose} title="Book Appointment">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Patient selector — only for non-patients */}
        {user?.role !== 'PATIENT' && (
          <Select label="Patient *" value={form.patientId} onChange={set('patientId')} required>
            <option value="">Select patient</option>
            {(patientUsers || []).map((u: {
              id: string;
              firstName: string;
              lastName: string;
              patient?: { id: string };
            }) => (
              <option key={u.id} value={u.patient?.id || ''}>
                {u.firstName} {u.lastName}
              </option>
            ))}
          </Select>
        )}

        {/* Doctor selector */}
        <Select label="Doctor *" value={form.doctorId} onChange={set('doctorId')} required>
          <option value="">Select doctor</option>
          {(doctors || []).map((d: {
            id: string;
            specialization: string;
            consultationFee: number;
            user: { firstName: string; lastName: string };
          }) => (
            <option key={d.id} value={d.id}>
              Dr. {d.user.firstName} {d.user.lastName} — {d.specialization} (${d.consultationFee})
            </option>
          ))}
        </Select>

        {/* Show availability */}
        {selectedDoctor && (
          <div className="p-3 bg-secondary rounded-lg text-xs text-muted-foreground space-y-1">
            <p><span className="font-medium">Available:</span> {selectedDoctor.availableDays?.replace(/,/g, ', ')}</p>
            <p><span className="font-medium">Hours:</span> {selectedDoctor.startTime} — {selectedDoctor.endTime}</p>
            <p><span className="font-medium">Fee:</span> ${selectedDoctor.consultationFee}</p>
          </div>
        )}

        {/* Date & Time */}
        <Input
          label="Date & Time *"
          type="datetime-local"
          value={form.scheduledAt}
          onChange={set('scheduledAt')}
          min={minDate}
          required
        />

        {/* Type */}
        <Select label="Appointment Type" value={form.type} onChange={set('type')}>
          <option value="CONSULTATION">Consultation</option>
          <option value="FOLLOW_UP">Follow Up</option>
          <option value="EMERGENCY">Emergency</option>
          <option value="ROUTINE_CHECKUP">Routine Checkup</option>
        </Select>

        {/* Reason */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Reason for Visit</label>
          <textarea
            value={form.reason}
            onChange={set('reason')}
            placeholder="Describe symptoms or reason..."
            rows={3}
            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Book Appointment</Button>
        </div>
      </form>
    </Modal>
  );
}