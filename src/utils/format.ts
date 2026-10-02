export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateShort(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function generateInvoiceNumber(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${y}${m}${d}-${rand}`;
}

export function generateVANumber(bank: string): string {
  const prefixMap: Record<string, string> = {
    VA_BCA: '88012',
    VA_MANDIRI: '89108',
    VA_BRI: '88810',
    VA_BNI: '98814',
  };
  const prefix = prefixMap[bank] || '88800';
  const randomSuffix = Math.floor(1000000000 + Math.random() * 9000000000);
  return `${prefix}${randomSuffix}`;
}

export function generateTrackingNumber(courierCode: string): string {
  const prefix = courierCode.toUpperCase().slice(0, 3);
  const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}ID${rand}`;
}
