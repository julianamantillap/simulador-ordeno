import type { Metrics } from "../types/index";

type Props = {
  metrics: Metrics | null;
};

function show(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : "No estable";
}

export default function MetricsPanel({ metrics }: Props) {
  if (!metrics) {
    return (
      <div className="card">
        <h2 className="card-title">Métricas del modelo</h2>
        <p className="empty-state">No hay métricas calculadas todavía.</p>
      </div>
    );
  }

  const items = [
    { label: "λ (Tasa de llegada)", value: show(metrics.lambdaPerMin) },
    { label: "Tiempo promedio de servicio", value: show(metrics.meanServiceMin) },
    { label: "Varianza del tiempo de servicio (σ²)", value: show(metrics.varianceService) },
    { label: "μ (Tasa de servicio)", value: show(metrics.muPerMin) },
    { label: "ρ (Utilización del sistema)", value: show(metrics.rho) },
    { label: "P₀ (Probabilidad de sistema vacío)", value: show(metrics.p0) },
    { label: "Lq (Longitud promedio de la cola)", value: show(metrics.lq) },
    { label: "Wq (Tiempo promedio de espera en la cola)", value: show(metrics.wq) },
    { label: "L (Longitud promedio del sistema)", value: show(metrics.l) },
    { label: "W (Tiempo promedio en el sistema)", value: show(metrics.w) },
  ];

  return (
    <div className="card">
      <h2 className="card-title">Métricas del modelo M/G/1</h2>
      <div className="metrics-grid">
        {items.map((item) => (
          <div key={item.label} className="metric-card">
            <div className="metric-label">{item.label}</div>
            <div className="metric-value">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}