import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent, Button, Badge, Avatar, Skeleton, EmptyState } from '@/components/ui';
import { ArrowLeft, Mail, Phone, Award, Clock, DollarSign, Building2, CalendarDays } from 'lucide-react';
import { formatCurrency, formatDateTime, statusColor } from '@/lib/utils';

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: doc, isLoading } = useQuery({
    queryKey: ['doctor', id],
    queryFn: () => api.get(`/doctors/${id}`).then(r => r.data.data),
  });

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid lg:grid-cols-3 gap-6">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl lg:col-span-2" />
      </div>
    </div>
  );

  if (!doc) return <EmptyState title="Doctor not found" action={<Button onClick={() => navigate('/doctors')}>Back</Button>} />;

  const days = (doc.availableDays || '').split(',');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/doctors')}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <h1 className="text-xl font-semibold">Dr. {doc.user.firstName} {doc.user.lastName}</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar name={`${doc.user.firstName} ${doc.user.lastName}`} src={doc.user.avatar} size="lg" />
              <h2 className="mt-4 font-semibold text-lg">Dr. {doc.user.firstName} {doc.user.lastName}</h2>
              <p className="text-sm text-muted-foreground">{doc.specialization}</p>
              <Badge className="mt-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{doc.department.name}</Badge>

              <div className="mt-6 w-full space-y-3 text-left">
                <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /><span className="truncate">{doc.user.email}</span></div>
                {doc.user.phone && <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span>{doc.user.phone}</span></div>}
                <div className="flex items-center gap-2 text-sm"><Award className="h-4 w-4 text-muted-foreground" /><span>{doc.qualification}</span></div>
                <div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-muted-foreground" /><span>{doc.experience} years experience</span></div>
                <div className="flex items-center gap-2 text-sm"><DollarSign className="h-4 w-4 text-muted-foreground" /><span className="text-primary font-medium">{formatCurrency(doc.consultationFee)}</span></div>
                <div className="flex items-center gap-2 text-sm"><Building2 className="h-4 w-4 text-muted-foreground" /><span>#{doc.licenseNumber}</span></div>
              </div>

              <div className="mt-4 w-full">
                <p className="text-xs text-muted-foreground mb-2">Available days</p>
                <div className="flex flex-wrap gap-1">
                  {['MON','TUE','WED','THU','FRI','SAT','SUN'].map(d => (
                    <span key={d} className={`text-xs px-2 py-1 rounded-md font-medium ${days.includes(d) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>{d}</span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{doc.startTime} — {doc.endTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6 border-b flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Recent Appointments</h3>
            </div>
            <CardContent className="pt-4">
              {(doc.appointments || []).length === 0 ? (
                <EmptyState title="No appointments yet" />
              ) : (
                <div className="space-y-3">
                  {doc.appointments.map((appt: {
                    id: string;
                    scheduledAt: string;
                    status: string;
                    reason?: string;
                    fee: number;
                    patient: { user: { firstName: string; lastName: string; avatar?: string } };
                  }) => (
                    <div key={appt.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/40 cursor-pointer transition-colors" onClick={() => navigate(`/appointments/${appt.id}`)}>
                      <div className="flex items-center gap-3">
                        <Avatar name={`${appt.patient.user.firstName} ${appt.patient.user.lastName}`} src={appt.patient.user.avatar} size="sm" />
                        <div>
                          <p className="font-medium text-sm">{appt.patient.user.firstName} {appt.patient.user.lastName}</p>
                          <p className="text-xs text-muted-foreground">{appt.reason || 'Consultation'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{formatDateTime(appt.scheduledAt)}</p>
                        <Badge className={`mt-1 ${statusColor(appt.status)}`}>{appt.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
