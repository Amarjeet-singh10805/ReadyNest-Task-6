import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { Button, Input } from '@/components/ui';
import { Activity, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@hms.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role: string) => {
    const creds: Record<string, { email: string; pass: string }> = {
      admin: { email: 'admin@hms.com', pass: 'Admin@123' },
      doctor: { email: 'james.wilson@hms.com', pass: 'Admin@123' },
      patient: { email: 'patient1@hms.com', pass: 'Admin@123' },
      receptionist: { email: 'reception@hms.com', pass: 'Admin@123' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].pass);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-sidebar flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">MediCare HMS</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Streamline your<br />hospital operations
          </h1>
          <p className="mt-4 text-white/60 text-lg">
            Manage patients, doctors, appointments, prescriptions, and billing — all in one place.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[['10,000+', 'Patients Served'], ['500+', 'Medical Staff'], ['99.9%', 'Uptime'], ['24/7', 'Support']].map(([v, l]) => (
            <div key={l} className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{v}</div>
              <div className="text-sm text-white/50 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">MediCare HMS</span>
            </div>
            <h2 className="text-2xl font-bold">Sign in to your account</h2>
            <p className="text-muted-foreground mt-2 text-sm">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            <div className="space-y-1">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm pr-10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
            </div>

            <Button type="submit" loading={loading} className="w-full">Sign in</Button>
          </form>

          <div className="mt-6">
            <p className="text-xs text-muted-foreground text-center mb-3">Quick login for demo</p>
            <div className="grid grid-cols-2 gap-2">
              {['admin', 'doctor', 'patient', 'receptionist'].map(role => (
                <button key={role} onClick={() => quickLogin(role)}
                  className="text-xs py-2 px-3 rounded-lg border hover:bg-secondary transition-colors capitalize font-medium">
                  {role}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
