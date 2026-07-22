import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal, Button, Input, Select } from '@/components/ui';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

interface Props { billId: string | null; onClose: () => void; }

export default function PaymentModal({ billId, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('CASH');

  const { data: bill } = useQuery({
    queryKey: ['bill-detail', billId],
    queryFn: () => api.get(`/billing/${billId}`).then(r => r.data.data),
    enabled: !!billId,
  });

  const outstanding = bill ? Number(bill.totalAmount) - Number(bill.paidAmount) : 0;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/billing/${billId}/pay`, { paidAmount: Number(amount), paymentMethod: method });
      toast.success('Payment recorded');
      onClose();
    } catch { toast.error('Payment failed'); }
    finally { setLoading(false); }
  };

  if (!billId) return null;

  return (
    <Modal open={!!billId} onClose={onClose} title="Record Payment">
      <form onSubmit={handlePay} className="space-y-4">
        {bill && (
          <div className="p-3 bg-secondary rounded-lg text-sm space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Bill #</span><span className="font-mono">{bill.billNumber}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Patient</span><span>{bill.patient.user.firstName} {bill.patient.user.lastName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-medium">{formatCurrency(bill.totalAmount)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Already Paid</span><span>{formatCurrency(bill.paidAmount)}</span></div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-semibold">Outstanding</span>
              <span className="font-bold text-primary">{formatCurrency(outstanding)}</span>
            </div>
          </div>
        )}
        <Input
          label="Amount to Pay ($)"
          type="number"
          value={amount || String(outstanding)}
          onChange={e => setAmount(e.target.value)}
          max={outstanding}
          required
        />
        <Select label="Payment Method" value={method} onChange={e => setMethod(e.target.value)}>
          {['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'BANK_TRANSFER'].map(m => (
            <option key={m} value={m}>{m.replace('_', ' ')}</option>
          ))}
        </Select>
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Record Payment</Button>
        </div>
      </form>
    </Modal>
  );
}
