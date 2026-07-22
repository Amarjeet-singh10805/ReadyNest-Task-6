import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Modal, Skeleton } from '@/components/ui';
import { formatDate } from '@/lib/utils';

interface Props { id: string | null; onClose: () => void; }

export default function PrescriptionDetailModal({ id, onClose }: Props) {
  const { data: rx, isLoading } = useQuery({
    queryKey: ['prescription', id],
    queryFn: () => api.get(`/prescriptions/${id}`).then(r => r.data.data),
    enabled: !!id,
  });

  if (!id) return null;

  const printPrescription = () => {
    const w = window.open('', '_blank');
    if (!w || !rx) return;
    w.document.write(`
      <html><head><title>Prescription</title>
      <style>body{font-family:Arial;max-width:600px;margin:40px auto;padding:20px}
      .header{border-bottom:2px solid #1a56db;padding-bottom:16px;margin-bottom:24px}
      .title{font-size:24px;color:#1a56db;font-weight:bold}
      .med{border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-bottom:8px}
      .label{color:#6b7280;font-size:12px}table{width:100%}
      </style></head><body>
      <div class="header">
        <div class="title">🏥 MediCare HMS — Prescription</div>
        <table><tr>
          <td><b>Dr. ${rx.doctor.user.firstName} ${rx.doctor.user.lastName}</b><br/>
          <span class="label">${rx.doctor.department?.name || ''}</span></td>
          <td style="text-align:right"><span class="label">Date: ${formatDate(rx.createdAt)}</span></td>
        </tr></table>
      </div>
      <table style="margin-bottom:16px"><tr>
        <td><b>Patient:</b> ${rx.patient.user.firstName} ${rx.patient.user.lastName}</td>
        <td style="text-align:right"><b>License:</b> ${rx.doctor.licenseNumber}</td>
      </tr></table>
      <p><b>Diagnosis:</b> ${rx.diagnosis}</p>
      ${rx.symptoms ? `<p><b>Symptoms:</b> ${rx.symptoms}</p>` : ''}
      <h3>Medications</h3>
      ${rx.medications.map((m: { medicineName: string; dosage: string; frequency: string; duration: string; instructions?: string }) => `
        <div class="med">
          <b>${m.medicineName}</b> — ${m.dosage}<br/>
          <span class="label">${m.frequency} · ${m.duration}</span>
          ${m.instructions ? `<br/><span class="label">${m.instructions}</span>` : ''}
        </div>`).join('')}
      ${rx.notes ? `<p><b>Notes:</b> ${rx.notes}</p>` : ''}
      ${rx.followUpDate ? `<p><b>Follow-up:</b> ${formatDate(rx.followUpDate)}</p>` : ''}
      </body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <Modal open={!!id} onClose={onClose} title="Prescription Details">
      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-6 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
      ) : rx ? (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Patient</p>
              <p className="font-semibold">{rx.patient.user.firstName} {rx.patient.user.lastName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Doctor</p>
              <p className="font-semibold">Dr. {rx.doctor.user.firstName} {rx.doctor.user.lastName}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Diagnosis</p>
            <p className="font-medium">{rx.diagnosis}</p>
          </div>
          {rx.symptoms && <div><p className="text-xs text-muted-foreground">Symptoms</p><p className="text-sm">{rx.symptoms}</p></div>}

          <div>
            <p className="text-xs text-muted-foreground mb-2">Medications</p>
            <div className="space-y-2">
              {rx.medications.map((m: { id: string; medicineName: string; dosage: string; frequency: string; duration: string; instructions?: string }) => (
                <div key={m.id} className="p-3 bg-secondary rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">{m.medicineName}</span>
                    <span className="text-sm text-muted-foreground">{m.dosage}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{m.frequency} · {m.duration}</p>
                  {m.instructions && <p className="text-xs text-muted-foreground mt-1 italic">{m.instructions}</p>}
                </div>
              ))}
            </div>
          </div>

          {rx.notes && <div><p className="text-xs text-muted-foreground">Notes</p><p className="text-sm">{rx.notes}</p></div>}
          {rx.followUpDate && <div><p className="text-xs text-muted-foreground">Follow-up Date</p><p className="text-sm font-medium">{formatDate(rx.followUpDate)}</p></div>}

          <div className="flex gap-2 justify-end pt-2 border-t">
            <button onClick={printPrescription}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              🖨️ Print / Download
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
