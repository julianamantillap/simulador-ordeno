import { useEffect, useMemo, useState } from "react";
import ConfigPanel from "./components/ConfigPanel";
import MetricsPanel from "./components/MetricsPanel";
import QueueView from "./components/QueueView";
import { parseExcelFile } from "./utils/excel";
import { calculateMG1Metrics } from "./utils/metrics";
import { buildSingleServerSimulation } from "./utils/simulation";
import type { ParsedFile, ColumnMapping, SimCustomer, Metrics } from "./types/index";

type ManualParams = {
  count: number;
  lambdaPerMin: number;
  meanServiceMin: number;
  varianceService: number;
};

function minutesToClock(totalMinutes: number): string {
  const baseHour = 5;
  const h = Math.floor(totalMinutes / 60) + baseHour;
  const m = Math.floor(totalMinutes % 60);
  const s = Math.floor((totalMinutes - Math.floor(totalMinutes)) * 60);

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function normalRandom(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function exponentialRandom(rate: number): number {
  const u = 1 - Math.random();
  return -Math.log(u) / rate;
}

function lognormalFromMeanVariance(mean: number, variance: number): number {
  const sigma2 = Math.log(1 + variance / (mean * mean));
  const mu = Math.log(mean) - sigma2 / 2;
  return Math.exp(mu + Math.sqrt(sigma2) * normalRandom());
}

function buildManualParsedFile(params: ManualParams): ParsedFile {
  const rows: Record<string, any>[] = [];
  let currentArrival = 0;

  for (let i = 0; i < params.count; i++) {
    const interarrival = i === 0 ? 0 : exponentialRandom(params.lambdaPerMin);
    currentArrival += interarrival;

    let service = lognormalFromMeanVariance(
      params.meanServiceMin,
      params.varianceService
    );

    if (!Number.isFinite(service) || service <= 0) {
      service = params.meanServiceMin;
    }

    rows.push({
      ID: i + 1,
      "Hora llegada": minutesToClock(currentArrival),
      "Tiempo servicio (min)": Number(service.toFixed(2)),
    });
  }

  return {
    fileName: "datos_ingresados_manualmente",
    headers: ["ID", "Hora llegada", "Tiempo servicio (min)"],
    rows,
  };
}

export default function App() {
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({
    arrival: "",
    service: "",
  });
  const [simTime, setSimTime] = useState(0);
  const [started, setStarted] = useState(false);

  async function handleFile(file: File) {
    const result = await parseExcelFile(file);
    setParsed(result);

    const arrival =
      result.headers.find((h) => h.toLowerCase().includes("llegada")) || "";
    const service =
      result.headers.find((h) => h.toLowerCase().includes("servicio")) || "";

    setMapping({ arrival, service });
    setSimTime(0);
    setStarted(false);
  }

  function handleUseManualParams(params: ManualParams) {
    const result = buildManualParsedFile(params);
    setParsed(result);
    setMapping({
      arrival: "Hora llegada",
      service: "Tiempo servicio (min)",
    });
    setSimTime(0);
    setStarted(false);
  }

  const metrics: Metrics | null = useMemo(() => {
    if (!parsed || !mapping.arrival || !mapping.service) return null;
    return calculateMG1Metrics(parsed.rows, mapping);
  }, [parsed, mapping]);

  const simulation: SimCustomer[] = useMemo(() => {
    if (!parsed || !mapping.arrival || !mapping.service) return [];
    return buildSingleServerSimulation(parsed.rows, mapping);
  }, [parsed, mapping]);

  const totalDuration = simulation.length
    ? simulation[simulation.length - 1].endMin - simulation[0].arrivalMin
    : 0;

  useEffect(() => {
    if (!started) return;

    const id = setInterval(() => {
      setSimTime((prev) => {
        if (prev >= totalDuration) return prev;
        return prev + 0.25;
      });
    }, 200);

    return () => clearInterval(id);
  }, [started, totalDuration]);

  return (
    <div className="app-shell">
      <div className="app-container">
        <header className="app-header">
          <div className="app-badge">Simulación formal del modelo M/G/1</div>
          <h1 className="app-title">Simulador del proceso de ordeño</h1>
          <p className="app-subtitle">
            Herramienta para cargar datos desde Excel o ingresar parámetros manualmente,
            calcular las métricas del modelo M/G/1 y visualizar el comportamiento de la
            cola y del servidor dentro de una simulación estructurada.
          </p>
        </header>

        <main className="main-grid">
          <ConfigPanel
            parsed={parsed}
            mapping={mapping}
            onFileChange={handleFile}
            onMappingChange={setMapping}
            onUseManualParams={handleUseManualParams}
          />

          <div className="card">
            <h2 className="card-title">Control de simulación</h2>
            <div className="button-row">
              <button
                className="btn btn-primary"
                onClick={() => setStarted(true)}
                disabled={!simulation.length}
              >
                Iniciar simulación
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setStarted(false);
                  setSimTime(0);
                }}
              >
                Reiniciar
              </button>
            </div>
          </div>

          <MetricsPanel metrics={metrics} />
          <QueueView customers={simulation} simTime={simTime} />
        </main>
      </div>
    </div>
  );
}