import { cn } from '@/lib/utils';
import { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

// Card
export const Card = ({ className, children, onClick }: { className?: string; children?: ReactNode; onClick?: () => void }) => (
  <div className={cn('rounded-xl border bg-card text-card-foreground shadow-sm', className)} onClick={onClick}>{children}</div>
);
export const CardHeader = ({ className, children }: { className?: string; children?: ReactNode }) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)}>{children}</div>
);
export const CardTitle = ({ className, children }: { className?: string; children?: ReactNode }) => (
  <h3 className={cn('font-semibold leading-none tracking-tight', className)}>{children}</h3>
);
export const CardContent = ({ className, children }: { className?: string; children?: ReactNode }) => (
  <div className={cn('p-6 pt-0', className)}>{children}</div>
);

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  children?: ReactNode;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', loading, children, disabled, ...props }, ref) => {
    const variants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    };
    const sizes = { sm: 'h-8 px-3 text-xs', md: 'h-9 px-4 text-sm', lg: 'h-11 px-6 text-base', icon: 'h-9 w-9' };
    return (
      <button
        ref={ref}
        className={cn('inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50', variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// Badge
export const Badge = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', className)}>{children}</span>
);

// Input
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }>(
  ({ label, error, className, ...props }, ref) => (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium leading-none">{label}</label>}
      <input ref={ref} className={cn('flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50', error && 'border-destructive', className)} {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';

// Select
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }>(
  ({ label, error, className, children, ...props }, ref) => (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium leading-none">{label}</label>}
      <select ref={ref} className={cn('flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50', error && 'border-destructive', className)} {...props}>
        {children}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';

// Textarea
export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }>(
  ({ label, error, className, ...props }, ref) => (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium leading-none">{label}</label>}
      <textarea ref={ref} className={cn('flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 resize-none', error && 'border-destructive', className)} {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';

// Table
export const Table = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <div className="relative w-full overflow-auto">
    <table className={cn('w-full caption-bottom text-sm', className)}>{children}</table>
  </div>
);
export const TableHeader = ({ children }: { children?: ReactNode }) => <thead className="[&_tr]:border-b">{children}</thead>;
export const TableBody = ({ children }: { children?: ReactNode }) => <tbody className="[&_tr:last-child]:border-0">{children}</tbody>;
export const TableRow = ({ children, className, onClick }: { children?: ReactNode; className?: string; onClick?: () => void }) => (
  <tr className={cn('border-b transition-colors hover:bg-muted/50', onClick && 'cursor-pointer', className)} onClick={onClick}>{children}</tr>
);
export const TableHead = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <th className={cn('h-10 px-4 text-left align-middle font-medium text-muted-foreground', className)}>{children}</th>
);
export const TableCell = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <td className={cn('p-4 align-middle', className)}>{children}</td>
);

// Avatar
export const Avatar = ({ src, name, size = 'md' }: { src?: string; name: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' };
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return src
    ? <img src={src} alt={name} className={cn('rounded-full object-cover', sizes[size])} />
    : <div className={cn('rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center shrink-0', sizes[size])}>{initials}</div>;
};

// Spinner
export const Spinner = ({ className }: { className?: string }) => (
  <Loader2 className={cn('h-5 w-5 animate-spin text-primary', className)} />
);

// Empty state
export const EmptyState = ({ title, description, action }: { title: string; description?: string; action?: ReactNode }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
      <span className="text-2xl">📭</span>
    </div>
    <h3 className="font-semibold text-lg">{title}</h3>
    {description && <p className="text-muted-foreground mt-1 text-sm max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// Skeleton
export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-md bg-muted', className)} />
);

// Stats Card
export const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }: {
  title: string; value: string | number; icon: React.ElementType; trend?: string; color?: string;
}) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  };
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
          </div>
          <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center shrink-0', colors[color] || colors.blue)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Page header
export const PageHeader = ({ title, description, action }: { title: string; description?: string; action?: ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description && <p className="text-muted-foreground mt-1">{description}</p>}
    </div>
    {action}
  </div>
);

// Modal
export const Modal = ({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children?: ReactNode }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-lg mx-4 rounded-xl bg-card border shadow-xl animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
