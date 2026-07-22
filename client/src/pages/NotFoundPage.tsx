import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-9xl font-black text-muted-foreground/20">404</h1>
        <h2 className="text-2xl font-bold mt-4">Page not found</h2>
        <p className="text-muted-foreground mt-2">The page you're looking for doesn't exist.</p>
        <Button className="mt-6" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    </div>
  );
}
