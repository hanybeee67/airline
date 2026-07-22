export function formatMoney(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  return `${sign}$${abs.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

export function monthLabel(month: number): string {
  const year = 1 + Math.floor(month / 12);
  const monthIndex = month % 12;
  const names = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${names[monthIndex]} Y${year}`;
}
