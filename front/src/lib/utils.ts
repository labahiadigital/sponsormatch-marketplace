export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr));
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `hace ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'aceptado': return 'text-success';
    case 'pendiente': return 'text-warning';
    case 'rechazado': return 'text-error';
    case 'cancelado': return 'text-outline';
    default: return 'text-on-surface-variant';
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case 'aceptado': return 'bg-success/10';
    case 'pendiente': return 'bg-warning/10';
    case 'rechazado': return 'bg-error/10';
    case 'cancelado': return 'bg-outline/10';
    default: return 'bg-surface-container';
  }
}
