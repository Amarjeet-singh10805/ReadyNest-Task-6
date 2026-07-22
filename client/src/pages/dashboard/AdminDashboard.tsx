import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { StatCard, Card, CardHeader, CardTitle, CardContent, Skeleton, Avatar, Badge } from '@/components/ui';
import { Users, Stethoscope, CalendarDays, DollarSign, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatCurrency, formatDateTime, statusColor } from '@/lib/utils';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: () => api.get('/dashboard/admin').then(r => r.data.data),
  });

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground mt-1">Hospital performance at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Patients" value={data?.totalPatients ?? 0} icon={Users} color="blue" trend="Registered patients" />
        <StatCard title="Total Doctors" value={data?.totalDoctors ?? 0} icon={Stethoscope} color="green" trend="Active physicians" />
        <StatCard title="Today's Appointments" value={data?.todayAppts ?? 0} icon={CalendarDays} color="purple" trend="Scheduled today" />
        <StatCard title="Monthly Revenue" value={formatCurrency(data?.monthRevenue ?? 0)} icon={DollarSign} color="orange" trend="This month" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Monthly Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data?.monthlyStats || []}>
                <defs>
                  <linearGradient id="apptGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(213, 94%, 44%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(213, 94%, 44%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="count" stroke="hsl(213, 94%, 44%)" strokeWidth={2} fill="url(#apptGrad)" name="Appointments" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data?.monthlyStats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="hsl(213, 94%, 44%)" radius={[4, 4, 0, 0]} name="Appointments" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(data?.recentAppts || []).slice(0, 8).map((appt: {
              id: string;
              patient: { user: { firstName: string; lastName: string; avatar?: string } };
              doctor: { user: { firstName: string; lastName: string } };
              scheduledAt: string;
              status: string;
              fee: number;
            }) => (
              <div key={appt.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar name={`${appt.patient.user.firstName} ${appt.patient.user.lastName}`} src={appt.patient.user.avatar} size="sm" />
                  <div>
                    <p className="text-sm font-medium">{appt.patient.user.firstName} {appt.patient.user.lastName}</p>
                    <p className="text-xs text-muted-foreground">Dr. {appt.doctor.user.lastName} · {formatDateTime(appt.scheduledAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium hidden sm:block">{formatCurrency(appt.fee)}</span>
                  <Badge className={statusColor(appt.status)}>{appt.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
