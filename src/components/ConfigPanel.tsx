import type { ChangeEvent } from "react";
import { useState } from "react";
import type { ParsedFile, ColumnMapping } from "../types/index";

type ManualParamsForm = {
  count: string;
  lambdaPerMin: string;
  meanServiceMin: string;
  varianceService: string;
};

type Props = {
  parsed: ParsedFile | null;
  mapping: ColumnMapping;
  onFileChange: (file: File) => void;
  onMappingChange: (mapping: ColumnMapping) => void;
  onUseManualParams: (params: {
    count: number;
    lambdaPerMin: number;
    meanServiceMin: number;
    varianceService: number;
  }) => void;
};

export default function ConfigPanel({
  parsed,
  mapping,
  onFileChange,
  onMappingChange,
  onUseManualParams,
}: Props) {
  const [manualParams, setManualParams] = useState<ManualParamsForm>({
    count: "160",
    lambdaPerMin: "1.33",
    meanServiceMin: "0.72",
    varianceService: "2",
  });

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileChange(file);
  };

  const handleUseManual = () => {
    const count = Number(manualParams.count);
    const lambdaPerMin = Number(manualParams.lambdaPerMin);
    const meanServiceMin = Number(manualParams.meanServiceMin);
    const varianceService = Number(manualParams.varianceService);

    if (
      !Number.isFinite(count) ||
      !Number.isFinite(lambdaPerMin) ||
      !Number.isFinite(meanServiceMin) ||
      !Number.isFinite(varianceService) ||
      count <= 0 ||
      lambdaPerMin <= 0 ||
      meanServiceMin <= 0 ||
      varianceService < 0
    ) {
      alert("Por favor ingresa valores numéricos válidos.");
      return;
    }

    onUseManualParams({
      count,
      lambdaPerMin,
      meanServiceMin,
      varianceService,
    });
  };

  return (
    <div className="card">
      <h2 className="card-title">Configuración de datos</h2>

      <h3 className="section-title">Opción 1: Cargar Excel</h3>
      <input className="file-input" type="file" accept=".xlsx,.xls,.csv" onChange={handleInput} />

      <hr className="section-divider" />

      <h3 className="section-title">Opción 2: Ingresar datos manualmente</h3>

      <div className="form-grid">
        <label className="label-block">
          Número de búfalas
          <input
            className="input"
            type="number"
            value={manualParams.count}
            onChange={(e) =>
              setManualParams({
                ...manualParams,
                count: e.target.value,
              })
            }
          />
        </label>

        <label className="label-block">
          λ (Tasa de llegada)
          <input
            className="input"
            type="number"
            step="0.01"
            value={manualParams.lambdaPerMin}
            onChange={(e) =>
              setManualParams({
                ...manualParams,
                lambdaPerMin: e.target.value,
              })
            }
          />
        </label>

        <label className="label-block">
          Tiempo promedio de servicio (min)
          <input
            className="input"
            type="number"
            step="0.01"
            value={manualParams.meanServiceMin}
            onChange={(e) =>
              setManualParams({
                ...manualParams,
                meanServiceMin: e.target.value,
              })
            }
          />
        </label>

        <label className="label-block">
          Varianza del tiempo de servicio (σ²)
          <input
            className="input"
            type="number"
            step="0.01"
            value={manualParams.varianceService}
            onChange={(e) =>
              setManualParams({
                ...manualParams,
                varianceService: e.target.value,
              })
            }
          />
        </label>

        <div className="button-row">
          <button className="btn btn-primary" onClick={handleUseManual}>
            Usar estos datos
          </button>
        </div>
      </div>

      {parsed && (
        <>
          <hr className="section-divider" />
          <div className="source-box">
            <strong>Fuente cargada:</strong> {parsed.fileName}
          </div>

          <div className="form-grid" style={{ marginTop: 14 }}>
            <label className="label-block">
              Columna de llegada
              <select
                className="select"
                value={mapping.arrival}
                onChange={(e) =>
                  onMappingChange({ ...mapping, arrival: e.target.value })
                }
              >
                <option value="">Selecciona</option>
                {parsed.headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </label>

            <label className="label-block">
              Columna de servicio
              <select
                className="select"
                value={mapping.service}
                onChange={(e) =>
                  onMappingChange({ ...mapping, service: e.target.value })
                }
              >
                <option value="">Selecciona</option>
                {parsed.headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </>
      )}
    </div>
  );
}