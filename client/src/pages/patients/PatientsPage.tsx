import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { PageHeader, Card, CardContent, Button, Input, Avatar, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton, EmptyState } from '@/components/ui';
import { Search, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import AddPatientModal from './AddPatientModal';

export default function PatientsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['patients', page, search],
    queryFn: () => api.get('/patients', { params: { page, limit: 10, search: search || undefined } }).then(r => r.data.data),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description={`${data?.total ?? 0} total patients`}
        action={<Button onClick={() => setShowAdd(true)}><UserPlus className="h-4 w-4" /> Add Patient</Button>}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search patients..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
          ) : (data?.data || []).length === 0 ? (
            <EmptyState title="No patients found" description="Try adjusting your search terms" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead className="hidden lg:table-cell">Blood Group</TableHead>
                  <TableHead className="hidden lg:table-cell">Registered</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.data || []).map((u: {
                  id: string;
                  firstName: string;
                  lastName: string;
                  email: string;
                  phone?: string;
                  avatar?: string;
                  isActive: boolean;
                  createdAt: string;
                  patient?: { bloodGroup?: string };
                }) => (
                  <TableRow key={u.id} onClick={() => navigate(`/patients/${u.id}`)} className="cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={`${u.firstName} ${u.lastName}`} src={u.avatar} size="sm" />
                        <div>
                          <p className="font-medium text-sm">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{u.phone || '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {u.patient?.bloodGroup ? (
                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          {u.patient.bloodGroup.replace('_', '').replace('POSITIVE', '+').replace('NEGATIVE', '-')}
                        </Badge>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                    <TableCell>
                      <Badge className={u.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700'}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {data.page} of {data.totalPages} · {data.total} patients
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AddPatientModal open={showAdd} onClose={() => { setShowAdd(false); refetch(); }} />
    </div>
  );
}
