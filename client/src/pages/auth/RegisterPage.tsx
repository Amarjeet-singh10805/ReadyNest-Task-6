import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { Activity } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/store/auth';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { ...form, role: 'PATIENT' });
      await login(form.email, form.password);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">MediCare HMS</span>
          </div>
          <h2 className="text-2xl font-bold">Create your account</h2>
          <p className="text-muted-foreground mt-2 text-sm">Join as a patient to manage your health</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card border rounded-xl p-8 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={form.firstName} onChange={set('firstName')} placeholder="John" required />
            <Input label="Last Name" value={form.lastName} onChange={set('lastName')} placeholder="Doe" required />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="john@example.com" required />
          <Input label="Phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 234 567 8900" />
          <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" required />
          <Button type="submit" loading={loading} className="w-full">Create account</Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
