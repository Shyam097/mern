
export type TableRow = Record<string, string | number>;

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter';

export const chartTypes: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'scatter', label: 'Scatter Chart' },
];
