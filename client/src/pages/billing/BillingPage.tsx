import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { PageHeader, Card, CardContent, Button, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton, EmptyState, Select } from '@/components/ui';
import { Plus, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate, statusColor } from '@/lib/utils';
import CreateBillModal from './CreateBillModal';
import PaymentModal from './PaymentModal';

export default function BillingPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [payBillId, setPayBillId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['bills', page, status],
    queryFn: () => api.get('/billing', { params: { page, limit: 10, status: status || undefined } }).then(r => r.data.data),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description={`${data?.total ?? 0} total bills`}
        action={<Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> Generate Bill</Button>}
      />

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <Select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="w-40">
              <option value="">All Statuses</option>
              {['PENDING', 'PAID', 'PARTIAL', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            {status && <Button variant="ghost" size="sm" onClick={() => { setStatus(''); setPage(1); }}>Clear</Button>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
          ) : (data?.data || []).length === 0 ? (
            <EmptyState title="No bills found" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead className="hidden md:table-cell">Doctor</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="hidden lg:table-cell">Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.data || []).map((bill: {
                  id: string;
                  billNumber: string;
                  totalAmount: number;
                  paidAmount: number;
                  status: string;
                  createdAt: string;
                  patient: { user: { firstName: string; lastName: string } };
                  appointment: { doctor: { user: { firstName: string; lastName: string } } };
                }) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-mono text-sm">{bill.billNumber}</TableCell>
                    <TableCell className="text-sm">{bill.patient.user.firstName} {bill.patient.user.lastName}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      Dr. {bill.appointment.doctor.user.firstName} {bill.appointment.doctor.user.lastName}
                    </TableCell>
                    <TableCell className="font-semibold text-sm">{formatCurrency(bill.totalAmount)}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatCurrency(bill.paidAmount)}</TableCell>
                    <TableCell><Badge className={statusColor(bill.status)}>{bill.status}</Badge></TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDate(bill.createdAt)}</TableCell>
                    <TableCell>
                      {bill.status !== 'PAID' && bill.status !== 'CANCELLED' && (
                        <Button size="sm" variant="outline" onClick={() => setPayBillId(bill.id)}>
                          <DollarSign className="h-3.5 w-3.5" /> Pay
                        </Button>
                      )}
                    </TableCell>
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

      <CreateBillModal open={showCreate} onClose={() => { setShowCreate(false); refetch(); }} />
      <PaymentModal billId={payBillId} onClose={() => { setPayBillId(null); refetch(); }} />
    </div>
  );
}
