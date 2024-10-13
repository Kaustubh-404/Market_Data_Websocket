
import React, { useState, useEffect, useRef } from 'react';
import { Chart, CategoryScale, LinearScale, TimeScale } from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import 'chartjs-plugin-zoom';
import { Moon, Sun } from 'lucide-react';

Chart.register(CategoryScale, LinearScale, TimeScale, CandlestickController, CandlestickElement);

const COINS = ['ethusdt', 'bnbusdt', 'dotusdt'];
const INTERVALS = ['1m', '3m', '5m'];

const BinanceCandlestickChart = () => {
  const [selectedCoin, setSelectedCoin] = useState('ethusdt');
  const [selectedInterval, setSelectedInterval] = useState('1m');
  const [data, setData] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const chartRef = useRef(null);

  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedCoin}@kline_${selectedInterval}`);

      ws.onopen = () => console.log('WebSocket connection opened');

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message?.k) {
          const candle = {
            time: message.k.t,
            open: parseFloat(message.k.o),
            high: parseFloat(message.k.h),
            low: parseFloat(message.k.l),
            close: parseFloat(message.k.c),
          };
          updateChartData(candle);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setTimeout(connectWebSocket, 1000);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setTimeout(connectWebSocket, 1000);
      };

      return () => ws.close();
    };

    connectWebSocket();
  }, [selectedCoin, selectedInterval]);

  const updateChartData = (newCandle) => {
    if (chartRef.current) {
      const chart = chartRef.current;
      const dataset = chart.data.datasets[0];
      const lastCandle = dataset.data[dataset.data.length - 1];

      if (lastCandle && lastCandle.x === newCandle.time) {
        // Update the existing candle
        lastCandle.o = newCandle.open;
        lastCandle.h = Math.max(lastCandle.h, newCandle.high);
        lastCandle.l = Math.min(lastCandle.l, newCandle.low);
        lastCandle.c = newCandle.close;
      } else {
        // Add a new candle
        dataset.data.push({
          x: newCandle.time,
          o: newCandle.open,
          h: newCandle.high,
          l: newCandle.low,
          c: newCandle.close,
        });

       
        if (dataset.data.length > 100) { // Keep last 100 candles
          dataset.data.shift();
        }
      }

      chart.update('none'); 
    }
  };

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = document.getElementById('candlestickChart').getContext('2d');

    chartRef.current = new Chart(ctx, {
      type: 'candlestick',
      data: {
        datasets: [{
          label: `${selectedCoin.toUpperCase()} Candlestick`,
          data: [],
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: { unit: 'minute', tooltipFormat: 'll HH:mm' },
            title: { display: true, text: 'Time' },
            ticks: { color: darkMode ? 'white' : 'black' },
            grid: { color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' },
          },
          y: { 
            title: { display: true, text: 'Price' },
            position: 'right',
            ticks: { color: darkMode ? 'white' : 'black' },
            grid: { color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' },
          },
        },
        plugins: {
          zoom: {
            pan: { enabled: true, mode: 'x' },
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: 'x',
            },
          },
          legend: {
            display: false,
          },
        },
        animation: false, 
        transitions: {
          active: {
            animation: {
              duration: 0 
            }
          }
        },
        elements: {
          candlestick: {
            wickColor: darkMode ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.75)',
            color: {
              up: 'rgba(0, 255, 0, 1)',
              down: 'rgba(255, 0, 0, 1)',
            },
            borderColor: {
              up: 'rgba(0, 255, 0, 1)',
              down: 'rgba(255, 0, 0, 1)',
            },
          }
        },
      },
    });
  }, [selectedCoin, selectedInterval, darkMode]);

  return (
    <div className={`p-4 min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <h1 className="text-2xl font-bold mb-4 text-center">Binance Market Data WebSocket</h1>

      <div className="mb-4 flex justify-center space-x-4">
        <div className="w-full max-w-xs">
          <label className="block text-sm font-medium mb-1">
            Choose Cryptocurrency:
          </label>
          <select
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
            }`}
          >
            {COINS.map((coin) => (
              <option key={coin} value={coin}>
                {coin.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full max-w-xs">
          <label className="block text-sm font-medium mb-1">
            Choose Interval:
          </label>
          <select
            value={selectedInterval}
            onChange={(e) => setSelectedInterval(e.target.value)}
            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
            }`}
          >
            {INTERVALS.map((interval) => (
              <option key={interval} value={interval}>
                {interval}
              </option>
            ))}
          </select>
        </div>

        <div className=" pt-6 flex items-center">
          <label htmlFor="darkModeToggle" className="mr-2">
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
          </label>
          <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input
              type="checkbox"
              name="darkModeToggle"
              id="darkModeToggle"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            />
            <label
              htmlFor="darkModeToggle"
              className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                darkMode ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            ></label>
          </div>
        </div>
      </div>

      <div className={`p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="h-[600px]">
          <canvas id="candlestickChart"></canvas>
        </div>
      </div>
    </div>
  );
};

export default BinanceCandlestickChart;