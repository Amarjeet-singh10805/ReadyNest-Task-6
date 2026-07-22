import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { PageHeader, Card, CardHeader, CardTitle, CardContent, Button, Skeleton } from '@/components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Download, BarChart3 } from 'lucide-react';

const COLORS = ['#1a56db', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const { data: apptReport, isLoading: apptLoading } = useQuery({
    queryKey: ['report-appointments', dateRange],
    queryFn: () => api.get('/reports/appointments', { params: dateRange }).then(r => r.data.data),
  });

  const { data: revReport, isLoading: revLoading } = useQuery({
    queryKey: ['report-revenue', dateRange],
    queryFn: () => api.get('/reports/revenue', { params: dateRange }).then(r => r.data.data),
  });

  const { data: patReport } = useQuery({
    queryKey: ['report-patients'],
    queryFn: () => api.get('/reports/patients').then(r => r.data.data),
  });

  const exportCSV = (type: string) => {
    const data = type === 'revenue' ? revReport?.byMonth : apptReport?.byStatus;
    if (!data) return;
    const csv = [Object.keys(data[0]).join(','), ...data.map((r: Record<string, unknown>) => Object.values(r).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${type}-report.csv`; a.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reports & Analytics" description="Comprehensive hospital performance data" />

      {/* Date range filter */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">From:</label>
              <input type="date" value={dateRange.from} onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">To:</label>
              <input type="date" value={dateRange.to} onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            {(dateRange.from || dateRange.to) && (
              <Button variant="ghost" size="sm" onClick={() => setDateRange({ from: '', to: '' })}>Clear</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Appointments</p>
            <p className="text-3xl font-bold mt-1">{apptReport?.total ?? '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-3xl font-bold mt-1 text-primary">{revReport?.total ? formatCurrency(revReport.total.totalAmount || 0) : '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Patients</p>
            <p className="text-3xl font-bold mt-1">{patReport?.total ?? '—'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Monthly Revenue</CardTitle>
            <Button variant="outline" size="sm" onClick={() => exportCSV('revenue')}><Download className="h-4 w-4" /> CSV</Button>
          </div>
        </CardHeader>
        <CardContent>
          {revLoading ? <Skeleton className="h-64 w-full" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={revReport?.byMonth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(Number(v)/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(213, 94%, 44%)" strokeWidth={2} dot={{ fill: 'hsl(213, 94%, 44%)' }} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Appointment status breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Appointments by Status</CardTitle>
              <Button variant="outline" size="sm" onClick={() => exportCSV('appointments')}><Download className="h-4 w-4" /> CSV</Button>
            </div>
          </CardHeader>
          <CardContent>
            {apptLoading ? <Skeleton className="h-52 w-full" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={apptReport?.byStatus || []} cx="50%" cy="50%" outerRadius={80} dataKey="_count" nameKey="status" label={({ status, _count }) => `${status}: ${_count}`} labelLine={false}>
                    {(apptReport?.byStatus || []).map((_: unknown, index: number) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Appointments by department */}
        <Card>
          <CardHeader><CardTitle>Appointments by Department</CardTitle></CardHeader>
          <CardContent>
            {apptLoading ? <Skeleton className="h-52 w-full" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={(apptReport?.byDept || []).slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="hsl(213, 94%, 44%)" radius={[0, 4, 4, 0]} name="Appointments" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Patient gender breakdown */}
      {patReport && (
        <Card>
          <CardHeader><CardTitle>Patient Demographics</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              {(patReport.byGender || []).map((g: { gender: string; _count: number }) => (
                <div key={g.gender} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-sm capitalize">{(g.gender || 'Unknown').toLowerCase()}: <strong>{g._count}</strong></span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
