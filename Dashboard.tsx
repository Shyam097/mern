
import React, { useState, useCallback, useRef, useMemo } from 'react';
import { BarChart, LineChart, PieChart, ScatterChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line, Pie, Cell, Scatter, ResponsiveContainer } from 'recharts';
import { Download, Bot, Loader2, XCircle, FileText } from 'lucide-react';
import { toPng } from 'html-to-image';
import type { TableRow, ChartType } from '../types';
import { chartTypes } from '../types';

interface DashboardProps {
  fileName: string;
  data: TableRow[];
  headers: string[];
  onReset: () => void;
}

const COLORS = ['#00F5D4', '#778DA9', '#1B263B', '#415A77', '#E0E1DD'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-secondary/80 backdrop-blur-sm border border-accent rounded-md shadow-lg text-text-primary">
                <p className="label font-bold">{`${label}`}</p>
                {payload.map((pld: any, index: number) => (
                    <div key={index} style={{ color: pld.color }}>{`${pld.name}: ${pld.value}`}</div>
                ))}
            </div>
        );
    }
    return null;
};

const Dashboard: React.FC<DashboardProps> = ({ fileName, data, headers, onReset }) => {
  const [xAxis, setXAxis] = useState<string>(headers[0] || '');
  const [yAxis, setYAxis] = useState<string>(headers[1] || headers[0] || '');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const chartRef = useRef<HTMLDivElement>(null);

  const handleGenerateSummary = useCallback(async () => {
    setIsAiLoading(true);
    setAiError(null);
    setAiSummary(null);
    try {
      // To avoid sending huge amounts of data, we'll sample it.
      const dataSample = data.length > 50 ? data.slice(0, 50) : data;
      
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: dataSample }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to generate AI summary from server.");
      }

      setAiSummary(result.summary);
    } catch (error: any) {
      console.error("AI summary generation failed:", error);
      setAiError(error.message || "Failed to generate AI summary. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  }, [data]);

  const handleDownloadChart = useCallback(() => {
    if (chartRef.current === null) {
      return;
    }
    toPng(chartRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${fileName.split('.')[0]}-${chartType}-chart.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error(err);
      });
  }, [chartRef, chartType, fileName]);
  
  const pieData = useMemo(() => {
    if (chartType !== 'pie' || !xAxis || !yAxis) return [];

    // Filter out rows that can't be used, and check if the Y axis is numeric.
    const potentialData = data.filter(d => d[yAxis] != null && String(d[yAxis]).trim() !== '');
    if (potentialData.length === 0) return [];
    
    const isNumeric = potentialData.every(d => !isNaN(parseFloat(String(d[yAxis]).replace(/,/g, ''))));
    if (!isNumeric) return [];

    const groupedData = potentialData.reduce<Record<string, number>>((acc, row) => {
        const key = String(row[xAxis]);
        // Robustly parse number, handling strings and commas.
        const value = parseFloat(String(row[yAxis]).replace(/,/g, ''));
        
        if (!isNaN(value)) {
            // Use nullish coalescing to fix the TypeScript error and handle aggregation correctly.
            acc[key] = (acc[key] ?? 0) + value;
        }
        return acc;
    }, {});

    return Object.entries(groupedData).map(([name, value]) => ({ name, value }));
  }, [data, xAxis, yAxis, chartType]);

  const renderChart = () => {
    const showChart = xAxis && yAxis;
    if (!showChart) {
      return <div className="flex items-center justify-center h-full text-highlight">Select X and Y axes to display the chart.</div>
    }

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#415A77" />
              <XAxis dataKey={xAxis} stroke="#E0E1DD" tick={{ fill: '#E0E1DD' }} />
              <YAxis stroke="#E0E1DD" tick={{ fill: '#E0E1DD' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(119, 141, 169, 0.2)' }}/>
              <Legend wrapperStyle={{ color: '#E0E1DD' }} />
              <Bar dataKey={yAxis} fill="#00F5D4" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#415A77" />
              <XAxis dataKey={xAxis} stroke="#E0E1DD" tick={{ fill: '#E0E1DD' }}/>
              <YAxis stroke="#E0E1DD" tick={{ fill: '#E0E1DD' }}/>
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#00F5D4', strokeWidth: 1 }}/>
              <Legend wrapperStyle={{ color: '#E0E1DD' }} />
              <Line type="monotone" dataKey={yAxis} stroke="#00F5D4" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }}/>
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        if(pieData.length === 0) {
            return <div className="flex items-center justify-center h-full text-highlight">For Pie charts, Y-Axis must contain numeric data.</div>
        }
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={'80%'} fill="#8884d8">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#E0E1DD' }} />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#415A77" />
              <XAxis type="category" dataKey={xAxis} name={xAxis} stroke="#E0E1DD" tick={{ fill: '#E0E1DD' }}/>
              <YAxis type="number" dataKey={yAxis} name={yAxis} stroke="#E0E1DD" tick={{ fill: '#E0E1DD' }}/>
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Legend wrapperStyle={{ color: '#E0E1DD' }} />
              <Scatter name="Data points" data={data} fill="#00F5D4" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };
  
  const renderSelect = (id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[]) => (
    <div className="mb-4">
        <label htmlFor={id} className="block mb-2 text-sm font-medium text-highlight">{label}</label>
        <select
          id={id}
          value={value}
          onChange={onChange}
          className="bg-primary border border-accent text-text-primary text-sm rounded-lg focus:ring-cyan-flare focus:border-cyan-flare block w-full p-2.5"
        >
          <option value="">Select option</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
  );


  return (
    <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-secondary rounded-lg shadow-md">
            <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-cyan-flare"/>
                <span className="font-semibold text-lg">{fileName}</span>
            </div>
            <button
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 bg-red-900/50 border border-red-500 rounded-lg hover:bg-red-800/50 transition-colors"
            >
                <XCircle className="h-4 w-4" />
                Start Over
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 bg-secondary p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-6 text-text-primary border-b-2 border-accent pb-2">Customize View</h2>
                {renderSelect('x-axis-select', 'X-Axis', xAxis, (e) => setXAxis(e.target.value), headers)}
                {renderSelect('y-axis-select', 'Y-Axis', yAxis, (e) => setYAxis(e.target.value), headers)}
                
                <div className="mb-6">
                    <label htmlFor="chart-type-select" className="block mb-2 text-sm font-medium text-highlight">Chart Type</label>
                    <select
                        id="chart-type-select"
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value as ChartType)}
                        className="bg-primary border border-accent text-text-primary text-sm rounded-lg focus:ring-cyan-flare focus:border-cyan-flare block w-full p-2.5"
                    >
                        {chartTypes.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>

                <div className="space-y-4">
                    <button onClick={handleDownloadChart} className="w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold text-primary bg-cyan-flare rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                        <Download className="h-5 w-5" />
                        Download as Image
                    </button>
                    <button onClick={handleGenerateSummary} disabled={isAiLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold text-text-primary bg-accent rounded-lg hover:bg-highlight transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isAiLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : <Bot className="h-5 w-5" />}
                        {isAiLoading ? "Thinking..." : "Ask AI for Insights"}
                    </button>
                </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
                <div className="bg-secondary p-6 rounded-lg shadow-md min-h-[500px]">
                    <div ref={chartRef} className="h-[500px] bg-secondary">
                        {renderChart()}
                    </div>
                </div>

                {(isAiLoading || aiSummary || aiError) && (
                    <div className="bg-secondary p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold mb-4 text-text-primary flex items-center gap-2"><Bot className="text-cyan-flare"/> AI Insights</h3>
                        {isAiLoading && (
                            <div className="flex items-center gap-4">
                                <Loader2 className="h-6 w-6 animate-spin text-cyan-flare"/>
                                <p className="text-highlight">The AI is analyzing your data. This might take a moment...</p>
                            </div>
                        )}
                        {aiError && <p className="text-red-400">{aiError}</p>}
                        <div className={`transition-opacity duration-700 ease-in-out ${aiSummary ? 'opacity-100' : 'opacity-0'}`}>
                           {aiSummary && <div className="prose prose-invert max-w-none text-text-primary whitespace-pre-wrap" dangerouslySetInnerHTML={{__html: aiSummary}}/>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Dashboard;
