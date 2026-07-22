import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { Activity, ArrowLeft, Copy } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'email' | 'reset' | 'done'>('email');

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      if (data.data?.resetToken) {
        setResetToken(data.data.resetToken);
        setStep('reset');
        toast.success('Reset token generated (dev mode)');
      }
    } catch {
      toast.error('Failed to generate reset token');
    } finally { setLoading(false); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token: resetToken, password: newPassword });
      setStep('done');
      toast.success('Password reset successfully!');
    } catch {
      toast.error('Invalid or expired token');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">MediCare HMS</span>
          </div>
          <h2 className="text-2xl font-bold">Reset password</h2>
          <p className="text-muted-foreground mt-2 text-sm">Enter your email to get a reset token</p>
        </div>

        <div className="bg-card border rounded-xl p-8 shadow-sm">
          {step === 'email' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              <Button type="submit" loading={loading} className="w-full">Get reset token</Button>
            </form>
          )}

          {step === 'reset' && (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-xs font-medium text-amber-800 dark:text-amber-400 mb-2">Dev mode — your reset token:</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs break-all flex-1 text-amber-900 dark:text-amber-300">{resetToken}</code>
                  <button onClick={() => { navigator.clipboard.writeText(resetToken); toast.success('Copied!'); }}
                    className="shrink-0 text-amber-600 hover:text-amber-800">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleReset} className="space-y-4">
                <Input label="Reset Token" value={resetToken} onChange={e => setResetToken(e.target.value)} required />
                <Input label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" required />
                <Button type="submit" loading={loading} className="w-full">Reset password</Button>
              </form>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <p className="font-medium">Password reset successfully!</p>
              <p className="text-sm text-muted-foreground mt-1">You can now log in with your new password.</p>
            </div>
          )}
        </div>

        <div className="text-center mt-4">
          <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
