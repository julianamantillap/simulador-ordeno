export type ExcelRow = Record<string, any>;

export type ParsedFile = {
  rows: ExcelRow[];
  headers: string[];
  fileName: string;
};

export type ColumnMapping = {
  arrival: string;
  service: string;
};

export type Metrics = {
  lambdaPerMin: number;
  meanServiceMin: number;
  varianceService: number;
  muPerMin: number;
  rho: number;
  p0: number;
  lq: number;
  wq: number;
  l: number;
  w: number;
};

export type SimCustomer = {
  id: number;
  arrivalMin: number;
  serviceMin: number;
  startMin: number;
  endMin: number;
  waitMin: number;
};