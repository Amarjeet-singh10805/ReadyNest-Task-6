import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent, Button, Badge, Avatar, Skeleton, EmptyState } from '@/components/ui';
import { ArrowLeft, Calendar, Clock, DollarSign, FileText, X, CheckCircle, PlayCircle, ThumbsUp } from 'lucide-react';
import { formatDateTime, statusColor, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/store/auth';
import toast from 'react-hot-toast';
import { useState } from 'react';
import CreatePrescriptionModal from '../prescriptions/CreatePrescriptionModal';

const STATUS_FLOW = [
  { value: 'SCHEDULED',   label: 'Scheduled',    color: 'bg-blue-100 text-blue-700' },
  { value: 'CONFIRMED',   label: 'Confirmed',     color: 'bg-green-100 text-green-700' },
  { value: 'IN_PROGRESS', label: 'In Progress',   color: 'bg-yellow-100 text-yellow-700' },
  { value: 'COMPLETED',   label: 'Completed',     color: 'bg-emerald-100 text-emerald-700' },
  { value: 'CANCELLED',   label: 'Cancelled',     color: 'bg-red-100 text-red-700' },
  { value: 'NO_SHOW',     label: 'No Show',       color: 'bg-gray-100 text-gray-700' },
];

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showRx, setShowRx] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const { data: appt, isLoading } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => api.get(`/appointments/${id}`).then(r => r.data.data),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => api.put(`/appointments/${id}`, { status }),
    onSuccess: (_, status) => {
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
      qc.invalidateQueries({ queryKey: ['appointment', id] });
      qc.invalidateQueries({ queryKey: ['appointments'] });
      setShowStatusMenu(false);
    },
    onError: () => toast.error('Failed to update status'),
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.patch(`/appointments/${id}/cancel`),
    onSuccess: () => {
      toast.success('Appointment cancelled');
      qc.invalidateQueries({ queryKey: ['appointment', id] });
    },
  });

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );

  if (!appt) return (
    <EmptyState title="Appointment not found"
      action={<Button onClick={() => navigate('/appointments')}>Back</Button>} />
  );

  const canManage = ['ADMIN', 'DOCTOR', 'RECEPTIONIST'].includes(user?.role || '');
  const canCancel = ['SCHEDULED', 'CONFIRMED'].includes(appt.status) && canManage;
  const canCreateRx = user?.role === 'DOCTOR' && appt.status === 'IN_PROGRESS' && !appt.prescription;

  const currentStatus = STATUS_FLOW.find(s => s.value === appt.status);

  // Quick action buttons based on current status
  const quickActions = () => {
    if (!canManage) return null;
    switch (appt.status) {
      case 'SCHEDULED':
        return (
          <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate('CONFIRMED')}
            loading={updateStatusMutation.isPending}>
            <ThumbsUp className="h-4 w-4" /> Confirm
          </Button>
        );
      case 'CONFIRMED':
        return (
          <Button size="sm" onClick={() => updateStatusMutation.mutate('IN_PROGRESS')}
            loading={updateStatusMutation.isPending}>
            <PlayCircle className="h-4 w-4" /> Start Consultation
          </Button>
        );
      case 'IN_PROGRESS':
        return (
          <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate('COMPLETED')}
            loading={updateStatusMutation.isPending}>
            <CheckCircle className="h-4 w-4" /> Mark Complete
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/appointments')}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <h1 className="text-xl font-semibold">Appointment Details</h1>
        </div>

        {/* Status badge + change button */}
        <div className="flex items-center gap-2">
          <Badge className={`text-sm px-3 py-1 ${statusColor(appt.status)}`}>
            {currentStatus?.label || appt.status}
          </Badge>

          {canManage && !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(appt.status) && (
            <div className="relative">
              <Button variant="outline" size="sm" onClick={() => setShowStatusMenu(v => !v)}>
                Change Status
              </Button>
              {showStatusMenu && (
                <div className="absolute right-0 top-10 z-50 w-44 bg-card border rounded-xl shadow-lg overflow-hidden">
                  {STATUS_FLOW.map(s => (
                    <button
                      key={s.value}
                      onClick={() => updateStatusMutation.mutate(s.value)}
                      disabled={s.value === appt.status || updateStatusMutation.isPending}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                        ${s.value === appt.status ? 'font-semibold' : ''}`}
                    >
                      <span className={`inline-flex items-center gap-2`}>
                        <span className={`h-2 w-2 rounded-full ${s.color.split(' ')[0]}`} />
                        {s.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close status menu */}
      {showStatusMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)} />
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Main Info */}
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Patient */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Patient</p>
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80"
                onClick={() => navigate(`/patients/${appt.patient.user.id}`)}>
                <Avatar name={`${appt.patient.user.firstName} ${appt.patient.user.lastName}`}
                  src={appt.patient.user.avatar} />
                <div>
                  <p className="font-semibold">{appt.patient.user.firstName} {appt.patient.user.lastName}</p>
                  <p className="text-sm text-muted-foreground">{appt.patient.user.email}</p>
                </div>
              </div>
            </div>

            {/* Doctor */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Doctor</p>
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80"
                onClick={() => navigate(`/doctors/${appt.doctor.id}`)}>
                <Avatar name={`${appt.doctor.user.firstName} ${appt.doctor.user.lastName}`}
                  src={appt.doctor.user.avatar} />
                <div>
                  <p className="font-semibold">Dr. {appt.doctor.user.firstName} {appt.doctor.user.lastName}</p>
                  <p className="text-sm text-muted-foreground">
                    {appt.doctor.department.name} · {appt.doctor.specialization}
                  </p>
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Date & Time</p>
                  <p className="text-sm font-medium">{formatDateTime(appt.scheduledAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm font-medium">{appt.duration} min</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Fee</p>
                  <p className="text-sm font-medium">{formatCurrency(appt.fee)}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="text-sm font-medium">{appt.type?.replace(/_/g, ' ')}</p>
              </div>
            </div>

            {appt.reason && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Reason</p>
                <p className="text-sm">{appt.reason}</p>
              </div>
            )}

            {appt.notes && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{appt.notes}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {quickActions()}
              {canCancel && (
                <Button variant="destructive" size="sm"
                  onClick={() => { if (confirm('Cancel this appointment?')) cancelMutation.mutate(); }}
                  loading={cancelMutation.isPending}>
                  <X className="h-4 w-4" /> Cancel
                </Button>
              )}
              {canCreateRx && (
                <Button size="sm" onClick={() => setShowRx(true)}>
                  <FileText className="h-4 w-4" /> Write Prescription
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Prescription + Bill */}
        <div className="space-y-4">
          {appt.prescription ? (
            <Card>
              <div className="p-6 border-b flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Prescription</h3>
              </div>
              <CardContent className="pt-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Diagnosis</p>
                  <p className="text-sm font-medium">{appt.prescription.diagnosis}</p>
                </div>
                {appt.prescription.symptoms && (
                  <div>
                    <p className="text-xs text-muted-foreground">Symptoms</p>
                    <p className="text-sm">{appt.prescription.symptoms}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Medications</p>
                  <div className="space-y-2">
                    {appt.prescription.medications?.map((med: {
                      id: string; medicineName: string; dosage: string;
                      frequency: string; duration: string; instructions?: string;
                    }) => (
                      <div key={med.id} className="p-3 bg-secondary rounded-lg">
                        <p className="text-sm font-medium">{med.medicineName} — {med.dosage}</p>
                        <p className="text-xs text-muted-foreground">{med.frequency} · {med.duration}</p>
                        {med.instructions && (
                          <p className="text-xs text-muted-foreground mt-1 italic">{med.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {appt.prescription.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="text-sm">{appt.prescription.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-sm text-muted-foreground">No prescription yet</p>
                {canCreateRx && (
                  <Button size="sm" className="mt-3" onClick={() => setShowRx(true)}>
                    Write Prescription
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {appt.bill ? (
            <Card>
              <div className="p-6 border-b flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Bill</h3>
              </div>
              <CardContent className="pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bill #</span>
                  <span className="font-mono">{appt.bill.billNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consultation</span>
                  <span>{formatCurrency(appt.bill.consultFee)}</span>
                </div>
                {Number(appt.bill.medicinesFee) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Medicines</span>
                    <span>{formatCurrency(appt.bill.medicinesFee)}</span>
                  </div>
                )}
                {Number(appt.bill.discount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>- {formatCurrency(appt.bill.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(appt.bill.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={statusColor(appt.bill.status)}>{appt.bill.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <DollarSign className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-sm text-muted-foreground">No bill generated yet</p>
                {['ADMIN', 'RECEPTIONIST'].includes(user?.role || '') && (
                  <Button size="sm" variant="outline" className="mt-3"
                    onClick={() => navigate('/billing')}>
                    Generate Bill
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {showRx && (
        <CreatePrescriptionModal
          open={showRx}
          onClose={() => {
            setShowRx(false);
            qc.invalidateQueries({ queryKey: ['appointment', id] });
          }}
          appointmentId={appt.id}
          patientId={appt.patient.id}
          doctorId={appt.doctor.id}
        />
      )}
    </div>
  );
}