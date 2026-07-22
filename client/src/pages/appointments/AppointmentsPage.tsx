import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { PageHeader, Card, CardContent, Button, Badge, Avatar, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton, EmptyState, Select } from '@/components/ui';
import { Plus, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { formatDateTime, statusColor, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/store/auth';
import BookAppointmentModal from './BookAppointmentModal';

const STATUS_OPTIONS = ['', 'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

export default function AppointmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [showBook, setShowBook] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['appointments', page, status, date],
    queryFn: () => api.get('/appointments', { params: { page, limit: 10, status: status || undefined, date: date || undefined } }).then(r => r.data.data),
  });

  const canBook = ['ADMIN', 'RECEPTIONIST', 'PATIENT'].includes(user?.role || '');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description={`${data?.total ?? 0} total appointments`}
        action={canBook && <Button onClick={() => setShowBook(true)}><Plus className="h-4 w-4" /> Book Appointment</Button>}
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <Select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="w-40">
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
            </Select>
            <input
              type="date"
              value={date}
              onChange={e => { setDate(e.target.value); setPage(1); }}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {(status || date) && (
              <Button variant="ghost" size="sm" onClick={() => { setStatus(''); setDate(''); setPage(1); }}>Clear filters</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
          ) : (data?.data || []).length === 0 ? (
            <EmptyState title="No appointments found" description="Try adjusting your filters" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead className="hidden md:table-cell">Doctor</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead className="hidden lg:table-cell">Fee</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.data || []).map((appt: {
                  id: string;
                  scheduledAt: string;
                  status: string;
                  fee: number;
                  reason?: string;
                  patient: { user: { firstName: string; lastName: string; avatar?: string } };
                  doctor: { user: { firstName: string; lastName: string }; department: { name: string } };
                }) => (
                  <TableRow key={appt.id} onClick={() => navigate(`/appointments/${appt.id}`)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={`${appt.patient.user.firstName} ${appt.patient.user.lastName}`} src={appt.patient.user.avatar} size="sm" />
                        <div>
                          <p className="font-medium text-sm">{appt.patient.user.firstName} {appt.patient.user.lastName}</p>
                          <p className="text-xs text-muted-foreground hidden sm:block">{appt.reason || 'Consultation'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <p className="text-sm">Dr. {appt.doctor.user.firstName} {appt.doctor.user.lastName}</p>
                      <p className="text-xs text-muted-foreground">{appt.doctor.department.name}</p>
                    </TableCell>
                    <TableCell className="text-sm">{formatDateTime(appt.scheduledAt)}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm font-medium">{formatCurrency(appt.fee)}</TableCell>
                    <TableCell><Badge className={statusColor(appt.status)}>{appt.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">Page {data.page} of {data.totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <BookAppointmentModal open={showBook} onClose={() => { setShowBook(false); refetch(); }} />
    </div>
  );
}
