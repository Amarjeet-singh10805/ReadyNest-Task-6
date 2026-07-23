import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { PageHeader, Card, CardContent, Avatar, Badge, Skeleton, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button } from '@/components/ui';
import { FileText, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import PrescriptionDetailModal from './PrescriptionDetailModal';

export default function PrescriptionsPage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['prescriptions', page],
    queryFn: () => api.get('/prescriptions', { params: { page, limit: 10 } }).then(r => r.data.data),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Prescriptions" description={`${data?.total ?? 0} total prescriptions`} />

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
          ) : (data?.data || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
              <h3 className="font-semibold text-lg">No prescriptions found</h3>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead className="hidden md:table-cell">Doctor</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead className="hidden lg:table-cell">Medicines</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.data || []).map((rx: {
                  id: string;
                  diagnosis: string;
                  createdAt: string;
                  medications: { id: string }[];
                  patient: { user: { firstName: string; lastName: string; avatar?: string } };
                  doctor: { user: { firstName: string; lastName: string } };
                }) => (
                  <TableRow key={rx.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar name={`${rx.patient.user.firstName} ${rx.patient.user.lastName}`} src={rx.patient.user.avatar} size="sm" />
                        <span className="text-sm font-medium">{rx.patient.user.firstName} {rx.patient.user.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">Dr. {rx.doctor.user.firstName} {rx.doctor.user.lastName}</TableCell>
                    <TableCell className="text-sm max-w-xs truncate">{rx.diagnosis}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{rx.medications.length} medicines</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDate(rx.createdAt)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelected(rx.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
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

      <PrescriptionDetailModal id={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
