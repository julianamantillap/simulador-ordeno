import type { SimCustomer } from "../types/index";
import SimulationScene from "./SimulationScene";

type Props = {
  customers: SimCustomer[];
  simTime: number;
};

export default function QueueView({ customers, simTime }: Props) {
  const queue = customers.filter((c) => c.arrivalMin <= simTime && c.startMin > simTime);
  const inService = customers.find((c) => c.startMin <= simTime && c.endMin > simTime);
  const processed = customers.filter((c) => c.endMin <= simTime);

  return (
    <div className="card">
      <h2 className="card-title">Simulación del sistema</h2>

      <div className="sim-grid">
        <div className="sim-summary">
          <div className="sim-chip">
            <div className="sim-chip-title">Tiempo simulado</div>
            <div className="sim-chip-value">{simTime.toFixed(2)} min</div>
          </div>

          <div className="sim-chip">
            <div className="sim-chip-title">Búfalas en cola</div>
            <div className="sim-chip-value">{queue.length}</div>
          </div>

          <div className="sim-chip">
            <div className="sim-chip-title">Búfalas ordeñadas</div>
            <div className="sim-chip-value">{processed.length}</div>
          </div>

          <div className="sim-chip">
            <div className="sim-chip-title">Servidor</div>
            <div className="sim-chip-value">
              {inService ? `Atendiendo búfala ${inService.id}` : "Libre"}
            </div>
          </div>
        </div>

        <SimulationScene customers={customers} simTime={simTime} />
      </div>
    </div>
  );
}