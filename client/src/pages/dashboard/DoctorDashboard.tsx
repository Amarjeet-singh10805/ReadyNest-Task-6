import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { StatCard, Card, CardHeader, CardTitle, CardContent, Skeleton, Avatar, Badge } from '@/components/ui';
import { CalendarDays, Users, FileText, Clock } from 'lucide-react';
import { formatDateTime, statusColor } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'doctor'],
    queryFn: () => api.get('/dashboard/doctor').then(r => r.data.data),
  });

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <p className="text-muted-foreground mt-1">Today's schedule and patient overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Today's Appointments" value={data?.todayAppts ?? 0} icon={CalendarDays} color="blue" />
        <StatCard title="Total Patients" value={data?.totalPatients ?? 0} icon={Users} color="green" />
        <StatCard title="Prescriptions" value={data?.totalPrescriptions ?? 0} icon={FileText} color="purple" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(data?.upcomingAppts || []).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No upcoming appointments today</p>
          ) : (
            <div className="space-y-3">
              {(data?.upcomingAppts || []).map((appt: {
                id: string;
                patient: { user: { firstName: string; lastName: string; avatar?: string } };
                scheduledAt: string;
                status: string;
                reason?: string;
              }) => (
                <div key={appt.id}
                  className="flex items-center justify-between p-4 rounded-xl border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
                  onClick={() => navigate(`/appointments/${appt.id}`)}>
                  <div className="flex items-center gap-3">
                    <Avatar name={`${appt.patient.user.firstName} ${appt.patient.user.lastName}`} src={appt.patient.user.avatar} />
                    <div>
                      <p className="font-medium">{appt.patient.user.firstName} {appt.patient.user.lastName}</p>
                      <p className="text-sm text-muted-foreground">{appt.reason || 'General Consultation'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatDateTime(appt.scheduledAt)}</p>
                    <Badge className={`mt-1 ${statusColor(appt.status)}`}>{appt.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
