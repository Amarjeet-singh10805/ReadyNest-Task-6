import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { PageHeader, Card, CardContent, Button, Avatar, Badge, Skeleton, EmptyState } from '@/components/ui';
import { Search, UserPlus, Stethoscope, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/store/auth';
import AddDoctorModal from './AddDoctorModal';

export default function DoctorsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['doctors', page, search],
    queryFn: () => api.get('/doctors', { params: { page, limit: 12, search: search || undefined } }).then(r => r.data.data),
  });

  // Show raw error for debugging
  if (error) return (
    <div className="p-6 bg-red-50 rounded-xl text-red-800">
      <p className="font-bold mb-2">Error loading doctors:</p>
      <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(error, null, 2)}</pre>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctors"
        description={`${data?.total ?? 0} medical professionals`}
        action={user?.role === 'ADMIN' && <Button onClick={() => setShowAdd(true)}><UserPlus className="h-4 w-4" /> Add Doctor</Button>}
      />

      <div className="mb-4 max-w-xs">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search doctors..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Debug info */}
      <div className="p-3 bg-secondary rounded-lg text-xs font-mono">
        data?.total: {String(data?.total)} | data?.data?.length: {String(data?.data?.length)} | isLoading: {String(isLoading)}
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
        </div>
      ) : (data?.data || []).length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-semibold">No doctors found</p>
          <p className="text-muted-foreground mt-1 text-sm">Raw data: {JSON.stringify(data)}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(data?.data || []).map((doc: {
            id: string;
            specialization: string;
            qualification: string;
            experience: number;
            consultationFee: number;
            availableDays: string;
            user: { firstName: string; lastName: string; email: string; avatar?: string };
            department: { name: string };
          }) => (
            <Card key={doc.id} className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
              onClick={() => navigate(`/doctors/${doc.id}`)}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar name={`${doc.user.firstName} ${doc.user.lastName}`} src={doc.user.avatar} size="lg" />
                  <h3 className="mt-3 font-semibold text-sm group-hover:text-primary transition-colors">
                    Dr. {doc.user.firstName} {doc.user.lastName}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{doc.specialization}</p>
                  <Badge className="mt-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                    {doc.department.name}
                  </Badge>
                  <div className="mt-4 w-full space-y-1.5 text-xs text-left border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Experience</span>
                      <span className="font-medium">{doc.experience} yrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fee</span>
                      <span className="font-medium text-primary">{formatCurrency(doc.consultationFee)}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <Stethoscope className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground truncate">{doc.qualification}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">Page {data.page} of {data.totalPages}</p>
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

      <AddDoctorModal open={showAdd} onClose={() => { setShowAdd(false); refetch(); }} />
    </div>
  );
}