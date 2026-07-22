import { useState } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

interface Medication { medicineName: string; dosage: string; frequency: string; duration: string; instructions: string; }
interface Props { open: boolean; onClose: () => void; appointmentId: string; patientId: string; doctorId: string; }

const emptyMed = (): Medication => ({ medicineName: '', dosage: '', frequency: 'Once daily', duration: '7 days', instructions: '' });

export default function CreatePrescriptionModal({ open, onClose, appointmentId, patientId, doctorId }: Props) {
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [medications, setMedications] = useState<Medication[]>([emptyMed()]);

  const updateMed = (i: number, k: keyof Medication, v: string) =>
    setMedications(meds => meds.map((m, idx) => idx === i ? { ...m, [k]: v } : m));

  const addMed = () => setMedications(m => [...m, emptyMed()]);
  const removeMed = (i: number) => setMedications(m => m.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim()) return toast.error('Diagnosis is required');
    if (medications.some(m => !m.medicineName)) return toast.error('All medications need a name');
    setLoading(true);
    try {
      await api.post('/prescriptions', { appointmentId, patientId, doctorId, diagnosis, symptoms, notes, followUpDate: followUpDate || undefined, medications });
      toast.success('Prescription created');
      onClose();
    } catch {
      toast.error('Failed to create prescription');
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Write Prescription">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Diagnosis *</label>
          <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} required rows={2} placeholder="Primary diagnosis..."
            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Symptoms</label>
          <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={2} placeholder="Patient reported symptoms..."
            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Medications</label>
            <Button type="button" variant="outline" size="sm" onClick={addMed}><Plus className="h-3.5 w-3.5" /> Add</Button>
          </div>
          <div className="space-y-3">
            {medications.map((med, i) => (
              <div key={i} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Medicine {i + 1}</span>
                  {medications.length > 1 && (
                    <button type="button" onClick={() => removeMed(i)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Medicine name" value={med.medicineName} onChange={e => updateMed(i, 'medicineName', e.target.value)} required />
                  <Input placeholder="Dosage (e.g. 500mg)" value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Frequency" value={med.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)} required />
                  <Input placeholder="Duration" value={med.duration} onChange={e => updateMed(i, 'duration', e.target.value)} required />
                </div>
                <Input placeholder="Special instructions" value={med.instructions} onChange={e => updateMed(i, 'instructions', e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        <Input label="Follow-up Date" type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} />
        <div className="space-y-1">
          <label className="text-sm font-medium">Additional Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Additional instructions..."
            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Save Prescription</Button>
        </div>
      </form>
    </Modal>
  );
}
