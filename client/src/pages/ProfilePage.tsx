import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Avatar, PageHeader } from '@/components/ui';
import { useAuth } from '@/store/auth';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const qc = useQueryClient();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/users/me').then(r => r.data.data),
  });

  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });

  if (me && !form.firstName && !isLoading) {
    setForm({ firstName: me.firstName, lastName: me.lastName, phone: me.phone || '' });
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const { data } = await api.put('/users/me', form);
      setUser({ ...user!, firstName: data.data.firstName, lastName: data.data.lastName });
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success('Profile updated');
    } catch { toast.error('Failed to update profile'); }
    finally { setProfileLoading(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    setPwLoading(true);
    try {
      await api.put('/users/me/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to change password');
    } finally { setPwLoading(false); }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const { data } = await api.put('/users/me', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUser({ ...user!, avatar: data.data.avatar });
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success('Photo updated');
    } catch { toast.error('Failed to upload photo'); }
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-700',
    DOCTOR: 'bg-blue-100 text-blue-700',
    RECEPTIONIST: 'bg-green-100 text-green-700',
    PATIENT: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="My Profile" description="Manage your account settings" />

      {/* Avatar & Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar name={`${me?.firstName || ''} ${me?.lastName || ''}`} src={me?.avatar} size="lg" />
              <label className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                <Camera className="h-3.5 w-3.5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{me?.firstName} {me?.lastName}</h2>
              <p className="text-muted-foreground text-sm">{me?.email}</p>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mt-2 ${roleColors[me?.role || ''] || 'bg-gray-100 text-gray-700'}`}>
                {me?.role}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile form */}
      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
              <Input label="Last Name" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
            </div>
            <Input label="Email" value={me?.email || ''} disabled className="opacity-60 cursor-not-allowed" />
            <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 234 567 8900" />
            <Button type="submit" loading={profileLoading}>Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      {/* Password form */}
      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input label="Current Password" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} required />
            <Input label="New Password" type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="Min. 8 characters" required />
            <Input label="Confirm New Password" type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} required />
            <Button type="submit" loading={pwLoading}>Update Password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
