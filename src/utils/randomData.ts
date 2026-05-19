import type { ParsedFile } from "../types/index";

function minutesToClock(totalMinutes: number): string {
  const baseHour = 5;
  const h = Math.floor(totalMinutes / 60) + baseHour;
  const m = Math.floor(totalMinutes % 60);
  const s = Math.floor((totalMinutes - Math.floor(totalMinutes)) * 60);

  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");

  return `${hh}:${mm}:${ss}`;
}

function exponentialRandom(rate: number): number {
  const u = 1 - Math.random();
  return -Math.log(u) / rate;
}

function normalRandom(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function lognormalFromMeanVariance(mean: number, variance: number): number {
  const sigma2 = Math.log(1 + variance / (mean * mean));
  const mu = Math.log(mean) - sigma2 / 2;
  const z = normalRandom();
  return Math.exp(mu + Math.sqrt(sigma2) * z);
}

export function generateRandomFile(params: {
  count: number;
  lambdaPerMin: number;
  meanServiceMin: number;
  varianceService: number;
}): ParsedFile {
  const { count, lambdaPerMin, meanServiceMin, varianceService } = params;

  const rows: Record<string, any>[] = [];
  let currentArrival = 0;

  for (let i = 0; i < count; i++) {
    const interarrival = i === 0 ? 0 : exponentialRandom(lambdaPerMin);
    currentArrival += interarrival;

    let service = lognormalFromMeanVariance(meanServiceMin, varianceService);

    if (!Number.isFinite(service) || service <= 0) {
      service = meanServiceMin;
    }

    rows.push({
      ID: i + 1,
      "Hora llegada": minutesToClock(currentArrival),
      "Tiempo servicio (min)": Number(service.toFixed(2)),
    });
  }

  return {
    fileName: "datos_aleatorios_generados",
    headers: ["ID", "Hora llegada", "Tiempo servicio (min)"],
    rows,
  };
}