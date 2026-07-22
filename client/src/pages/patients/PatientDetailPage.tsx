import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Avatar, Skeleton, EmptyState } from '@/components/ui';
import { ArrowLeft, Edit, Phone, Mail, Droplets, AlertCircle, Calendar } from 'lucide-react';
import { formatDate, formatDateTime, statusColor, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'prescriptions' | 'bills'>('overview');

  const { data: user, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => api.get(`/patients/${id}`).then(r => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/patients/${id}`),
    onSuccess: () => { toast.success('Patient deleted'); qc.invalidateQueries({ queryKey: ['patients'] }); navigate('/patients'); },
    onError: () => toast.error('Failed to delete patient'),
  });

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl lg:col-span-2" />
      </div>
    </div>
  );

  if (!user) return <EmptyState title="Patient not found" action={<Button onClick={() => navigate('/patients')}>Back to Patients</Button>} />;

  const p = user.patient;

  const bloodLabel = (bg: string) => bg?.replace('_POSITIVE', '+').replace('_NEGATIVE', '-') || '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/patients')}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <h1 className="text-xl font-semibold">{user.firstName} {user.lastName}</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar name={`${user.firstName} ${user.lastName}`} src={user.avatar} size="lg" />
              <h2 className="mt-4 text-lg font-semibold">{user.firstName} {user.lastName}</h2>
              <Badge className={user.isActive ? 'bg-green-100 text-green-700 mt-2' : 'bg-gray-100 text-gray-700 mt-2'}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>

              <div className="mt-6 w-full space-y-3 text-left">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{user.phone}</span>
                </div>}
                {p?.dateOfBirth && <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{formatDate(p.dateOfBirth)} ({new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()} yrs)</span>
                </div>}
                {p?.bloodGroup && <div className="flex items-center gap-2 text-sm">
                  <Droplets className="h-4 w-4 text-red-500 shrink-0" />
                  <span className="font-medium text-red-600">{bloodLabel(p.bloodGroup)}</span>
                </div>}
                {p?.gender && <div className="flex items-center gap-2 text-sm capitalize">
                  <span className="text-muted-foreground">Gender:</span>
                  <span>{p.gender.toLowerCase()}</span>
                </div>}
              </div>

              {p?.allergies && (
                <div className="mt-4 w-full p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-xs font-medium mb-1">
                    <AlertCircle className="h-3.5 w-3.5" /> Allergies
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-300">{p.allergies}</p>
                </div>
              )}

              <div className="flex gap-2 mt-6 w-full">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/patients/${id}/edit`)}>
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button variant="destructive" size="sm" className="flex-1" onClick={() => { if (confirm('Delete this patient?')) deleteMutation.mutate(); }}>
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-1 bg-secondary rounded-lg p-1 w-fit">
            {(['overview', 'appointments', 'prescriptions', 'bills'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-4">
              {p?.medicalHistory && (
                <Card>
                  <CardHeader><CardTitle className="text-sm">Medical History</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{p.medicalHistory}</p></CardContent>
                </Card>
              )}
              {p && (p.emergencyName || p.address) && (
                <Card>
                  <CardHeader><CardTitle className="text-sm">Additional Info</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {p.address && <div><span className="text-muted-foreground">Address:</span> {p.address}</div>}
                    {p.emergencyName && <div><span className="text-muted-foreground">Emergency Contact:</span> {p.emergencyName} ({p.emergencyRel}) — {p.emergencyPhone}</div>}
                    {p.insuranceProvider && <div><span className="text-muted-foreground">Insurance:</span> {p.insuranceProvider} #{p.insuranceNumber}</div>}
                  </CardContent>
                </Card>
              )}
              {!p?.medicalHistory && !p?.address && (
                <EmptyState title="No additional info" description="Update the patient profile to add medical history and contact information." />
              )}
            </div>
          )}

          {activeTab === 'appointments' && (
            <Card>
              <CardContent className="pt-6">
                {(p?.appointments || []).length === 0 ? <EmptyState title="No appointments" /> : (
                  <div className="space-y-3">
                    {p.appointments.map((appt: {
                      id: string;
                      scheduledAt: string;
                      status: string;
                      reason?: string;
                      fee: number;
                      doctor: { user: { firstName: string; lastName: string }; department: { name: string } };
                    }) => (
                      <div key={appt.id} className="flex justify-between items-center p-3 border rounded-lg hover:border-primary/40 cursor-pointer transition-colors" onClick={() => navigate(`/appointments/${appt.id}`)}>
                        <div>
                          <p className="font-medium text-sm">Dr. {appt.doctor.user.firstName} {appt.doctor.user.lastName}</p>
                          <p className="text-xs text-muted-foreground">{appt.doctor.department.name} · {formatDateTime(appt.scheduledAt)}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={statusColor(appt.status)}>{appt.status}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">{formatCurrency(appt.fee)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'prescriptions' && (
            <Card>
              <CardContent className="pt-6">
                {(p?.prescriptions || []).length === 0 ? <EmptyState title="No prescriptions" /> : (
                  <div className="space-y-3">
                    {p.prescriptions.map((rx: {
                      id: string;
                      diagnosis: string;
                      createdAt: string;
                      medications: { id: string; medicineName: string; dosage: string; frequency: string }[];
                      doctor: { user: { firstName: string; lastName: string } };
                    }) => (
                      <div key={rx.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-sm">{rx.diagnosis}</p>
                          <span className="text-xs text-muted-foreground">{formatDate(rx.createdAt)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">Dr. {rx.doctor.user.firstName} {rx.doctor.user.lastName}</p>
                        <div className="space-y-1">
                          {rx.medications.map(med => (
                            <div key={med.id} className="text-xs flex gap-2">
                              <span className="font-medium">{med.medicineName}</span>
                              <span className="text-muted-foreground">{med.dosage} · {med.frequency}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'bills' && (
            <Card>
              <CardContent className="pt-6">
                {(p?.bills || []).length === 0 ? <EmptyState title="No bills" /> : (
                  <div className="space-y-3">
                    {p.bills.map((bill: { id: string; billNumber: string; totalAmount: number; paidAmount: number; status: string; createdAt: string }) => (
                      <div key={bill.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{bill.billNumber}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(bill.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{formatCurrency(bill.totalAmount)}</p>
                          <Badge className={`mt-1 ${statusColor(bill.status)}`}>{bill.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
