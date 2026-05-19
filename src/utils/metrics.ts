import type { Metrics, ExcelRow, ColumnMapping } from "../types/index";

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

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function variance(values: number[]): number {
  const m = mean(values);
  return values.reduce((acc, v) => acc + (v - m) ** 2, 0) / values.length;
}

export function calculateMG1Metrics(
  rows: ExcelRow[],
  mapping: ColumnMapping
): Metrics | null {
  const rawArrivals = rows
    .map((r) => arrivalToMinutes(r[mapping.arrival]))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);

  const services = rows
    .map((r) => serviceToMinutes(r[mapping.service]))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (rawArrivals.length < 2 || services.length < 2) return null;


  const firstArrival = rawArrivals[0];
  const arrivals = rawArrivals.map((a) => a - firstArrival);

  const duration = arrivals[arrivals.length - 1] - arrivals[0];
  if (duration <= 0) return null;

  const lambdaPerMin = (arrivals.length - 1) / duration;
  const meanServiceMin = mean(services);
  const varianceService = variance(services);
  const muPerMin = 1 / meanServiceMin;
  const rho = lambdaPerMin / muPerMin;

  if (!Number.isFinite(rho) || rho >= 1) {
    return {
      lambdaPerMin,
      meanServiceMin,
      varianceService,
      muPerMin,
      rho,
      p0: NaN,
      lq: NaN,
      wq: NaN,
      l: NaN,
      w: NaN,
    };
  }

  const p0 = 1 - rho;
  const lq =
    ((lambdaPerMin ** 2) * varianceService + rho ** 2) /
    (2 * (1 - rho));
  const wq = lq / lambdaPerMin;
  const l = lq + lambdaPerMin / muPerMin;
  const w = wq + 1 / muPerMin;

  return {
    lambdaPerMin,
    meanServiceMin,
    varianceService,
    muPerMin,
    rho,
    p0,
    lq,
    wq,
    l,
    w,
  };
}