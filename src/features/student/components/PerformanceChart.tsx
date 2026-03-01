import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

interface PerformanceChartProps {
  data: number[];
  labels: string[];
  isDark?: boolean;
}

export function PerformanceChart({ data, labels, isDark = false }: PerformanceChartProps) {
  const chartRef = useRef<any>(null);
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    datasets: [],
  });

  useEffect(() => {
    const canvas = chartRef.current?.canvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    if (isDark) {
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.5)'); // Emerald-500 equivalent
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
    } else {
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.5)'); // Emerald-500 equivalent
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
    }

    setChartData({
      labels,
      datasets: [
        {
          label: 'Overall Score',
          data: data,
          fill: true,
          backgroundColor: gradient,
          borderColor: '#10B981', // Emerald-500
          borderWidth: 2,
          pointBackgroundColor: isDark ? '#1f2937' : '#ffffff',
          pointBorderColor: '#10B981',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4, // Smooth curve
        },
      ],
    });
  }, [data, labels, isDark]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        titleColor: isDark ? '#f3f4f6' : '#111827',
        bodyColor: isDark ? '#d1d5db' : '#4b5563',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
            label: function(context) {
                return context.parsed.y + '% Score';
            }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
        },
      },
      y: {
        grid: {
          color: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.4)',
        },
        border: {
          display: false,
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          stepSize: 20
        },
        beginAtZero: true,
        max: 100,
      },
    },
    interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
    }
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <Line ref={chartRef} options={options} data={chartData} />
    </div>
  );
}
