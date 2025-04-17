import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './SensorChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SensorChart = ({ timestamps, history }) => {
  const chartData = {
    labels: timestamps,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: history.map(item => item.temperature),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
        borderWidth: 2
      },
      {
        label: 'Humidity (%)',
        data: history.map(item => item.humidity),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.1,
        borderWidth: 2
      },
      {
        label: 'Light Level',
        data: history.map(item => item.light),
        borderColor: 'rgb(255, 206, 86)',
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
        tension: 0.1,
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'График показателей',
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  return (
    <div className="sensor-chart">
      <Line options={options} data={chartData} />
    </div>
  );
};

export default SensorChart;