
export interface CandleData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  putVolume?: number;
  callVolume?: number;
}

export interface ChartApiResponse {
  status: string;
  data: CandleData[];
}
