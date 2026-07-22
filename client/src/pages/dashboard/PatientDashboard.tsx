import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, Skeleton, Badge } from '@/components/ui';
import { CalendarDays, FileText, CreditCard } from 'lucide-react';
import { formatCurrency, formatDateTime, statusColor } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'patient'],
    queryFn: () => api.get('/dashboard/patient').then(r => r.data.data),
  });

  if (isLoading) return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Health Portal</h1>
        <p className="text-muted-foreground mt-1">Your appointments, prescriptions, and bills</p>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" /> Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(data?.upcomingAppts || []).length === 0
            ? <p className="text-center text-muted-foreground py-6">No upcoming appointments</p>
            : <div className="space-y-3">
              {data.upcomingAppts.map((appt: {
                id: string;
                doctor: { user: { firstName: string; lastName: string }; department: { name: string } };
                scheduledAt: string;
                status: string;
                reason?: string;
              }) => (
                <div key={appt.id} className="flex justify-between items-center p-3 rounded-lg border hover:border-primary/40 cursor-pointer transition-colors" onClick={() => navigate(`/appointments/${appt.id}`)}>
                  <div>
                    <p className="font-medium">Dr. {appt.doctor.user.firstName} {appt.doctor.user.lastName}</p>
                    <p className="text-sm text-muted-foreground">{appt.doctor.department.name} · {appt.reason || 'Consultation'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{formatDateTime(appt.scheduledAt)}</p>
                    <Badge className={`mt-1 ${statusColor(appt.status)}`}>{appt.status}</Badge>
                  </div>
                </div>
              ))}
            </div>}
        </CardContent>
      </Card>

      {/* Prescriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Recent Prescriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(data?.prescriptions || []).length === 0
            ? <p className="text-center text-muted-foreground py-6">No prescriptions yet</p>
            : <div className="space-y-3">
              {data.prescriptions.map((rx: {
                id: string;
                diagnosis: string;
                doctor: { user: { firstName: string; lastName: string } };
                createdAt: string;
                medications: { id: string; medicineName: string; dosage: string }[];
              }) => (
                <div key={rx.id} className="p-3 rounded-lg border cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate(`/prescriptions`)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{rx.diagnosis}</p>
                      <p className="text-xs text-muted-foreground">Dr. {rx.doctor.user.firstName} {rx.doctor.user.lastName} · {formatDateTime(rx.createdAt)}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{rx.medications.length} medicines</span>
                  </div>
                </div>
              ))}
            </div>}
        </CardContent>
      </Card>

      {/* Bills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" /> Recent Bills
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(data?.bills || []).length === 0
            ? <p className="text-center text-muted-foreground py-6">No bills yet</p>
            : <div className="space-y-3">
              {data.bills.map((bill: { id: string; billNumber: string; totalAmount: number; status: string; createdAt: string }) => (
                <div key={bill.id} className="flex justify-between items-center p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{bill.billNumber}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(bill.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(bill.totalAmount)}</p>
                    <Badge className={`mt-1 ${statusColor(bill.status)}`}>{bill.status}</Badge>
                  </div>
                </div>
              ))}
            </div>}
        </CardContent>
      </Card>
    </div>
  );
}
