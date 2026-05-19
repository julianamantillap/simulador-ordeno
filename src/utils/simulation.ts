import type { ColumnMapping, ExcelRow, SimCustomer } from "../types/index";

function excelDateNumberToMinutes(value: number): number {
  return value * 24 * 60;
}

function arrivalToMinutes(value: any): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value >= 0 && value < 1) return value * 24 * 60;
    if (value > 1000) return excelDateNumberToMinutes(value);
    return value;
  }

  if (typeof value !== "string") return NaN;

  const trimmed = value.trim();
  if (!trimmed) return NaN;

  const timeMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (timeMatch) {
    const h = Number(timeMatch[1]);
    const m = Number(timeMatch[2]);
    const s = Number(timeMatch[3] ?? 0);
    return h * 60 + m + s / 60;
  }

  const normalized = trimmed.replace(",", ".");
  const n = Number(normalized);

  if (Number.isFinite(n)) {
    if (n >= 0 && n < 1) return n * 24 * 60;
    if (n > 1000) return excelDateNumberToMinutes(n);
    return n;
  }

  return NaN;
}

function serviceToMinutes(value: any): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return NaN;

  const trimmed = value.trim();
  if (!trimmed) return NaN;

  const normalized = trimmed.replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}

export function buildSingleServerSimulation(
  rows: ExcelRow[],
  mapping: ColumnMapping
): SimCustomer[] {
  const items = rows
    .map((r, idx) => ({
      id: idx + 1,
      arrivalMin: arrivalToMinutes(r[mapping.arrival]),
      serviceMin: serviceToMinutes(r[mapping.service]),
    }))
    .filter(
      (r) =>
        Number.isFinite(r.arrivalMin) &&
        Number.isFinite(r.serviceMin) &&
        r.serviceMin > 0
    )
    .sort((a, b) => a.arrivalMin - b.arrivalMin);

  if (!items.length) return [];

  const firstArrival = items[0].arrivalMin;
  const normalizedItems = items.map((item) => ({
    ...item,
    arrivalMin: item.arrivalMin - firstArrival,
  }));

  let serverAvailableAt = normalizedItems[0].arrivalMin;

  return normalizedItems.map((item) => {
    const startMin = Math.max(item.arrivalMin, serverAvailableAt);
    const endMin = startMin + item.serviceMin;
    const waitMin = startMin - item.arrivalMin;
    serverAvailableAt = endMin;

    return {
      ...item,
      startMin,
      endMin,
      waitMin,
    };
  });
}