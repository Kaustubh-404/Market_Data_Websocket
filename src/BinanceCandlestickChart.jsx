import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chart, CategoryScale, LinearScale, TimeScale, Tooltip } from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import 'chartjs-plugin-zoom';
import { Moon, Sun } from 'lucide-react';

Chart.register(CategoryScale, LinearScale, TimeScale, CandlestickController, CandlestickElement, Tooltip);

const COINS = ['ethusdt', 'bnbusdt', 'dotusdt'];
const INTERVALS = ['1m', '3m', '5m'];
const MAX_CANDLES = 100;

const BinanceCandlestickChart = () => {
  const [selectedCoin, setSelectedCoin] = useState('ethusdt');
  const [selectedInterval, setSelectedInterval] = useState('1m');
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode !== null ? JSON.parse(savedMode) : true;
  });
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const historicalDataRef = useRef({});

  const createChart = useCallback(() => {
    const ctx = document.getElementById('candlestickChart').getContext('2d');
    const chartData = historicalDataRef.current[selectedCoin]?.[selectedInterval] || [];

    chartInstanceRef.current = new Chart(ctx, {
      type: 'candlestick',
      data: {
        datasets: [{
          label: `${selectedCoin.toUpperCase()} Candlestick`,
          data: chartData,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: { unit: 'minute', tooltipFormat: 'PP pp' },
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
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                const candle = context.raw;
                return [
                  `Open: ${candle.o.toFixed(2)}`,
                  `High: ${candle.h.toFixed(2)}`,
                  `Low: ${candle.l.toFixed(2)}`,
                  `Close: ${candle.c.toFixed(2)}`,
                ];
              },
            },
            backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            titleColor: darkMode ? 'white' : 'black',
            bodyColor: darkMode ? 'white' : 'black',
            borderColor: darkMode ? 'white' : 'black',
            borderWidth: 1,
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
        interaction: {
          intersect: false,
          mode: 'index',
        },
      },
    });
  }, [selectedCoin, selectedInterval, darkMode]);

  const updateChartData = useCallback((newCandle) => {
    if (!historicalDataRef.current[selectedCoin]) {
      historicalDataRef.current[selectedCoin] = {};
    }
    if (!historicalDataRef.current[selectedCoin][selectedInterval]) {
      historicalDataRef.current[selectedCoin][selectedInterval] = [];
    }

    const dataset = historicalDataRef.current[selectedCoin][selectedInterval];
    const lastCandle = dataset[dataset.length - 1];

    if (lastCandle && lastCandle.x === newCandle.time) {
      lastCandle.o = newCandle.open;
      lastCandle.h = Math.max(lastCandle.h, newCandle.high);
      lastCandle.l = Math.min(lastCandle.l, newCandle.low);
      lastCandle.c = newCandle.close;
    } else {
      dataset.push({
        x: newCandle.time,
        o: newCandle.open,
        h: newCandle.high,
        l: newCandle.low,
        c: newCandle.close,
      });

      if (dataset.length > MAX_CANDLES) {
        dataset.shift();
      }
    }

    if (chartInstanceRef.current) {
      chartInstanceRef.current.data.datasets[0].data = dataset;
      chartInstanceRef.current.update('none');
    }
  }, [selectedCoin, selectedInterval]);

  const fetchInitialData = useCallback(async () => {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${selectedCoin.toUpperCase()}&interval=${selectedInterval}&limit=${MAX_CANDLES}`);
      const data = await response.json();
      const initialCandles = data.map(candle => ({
        x: candle[0],
        o: parseFloat(candle[1]),
        h: parseFloat(candle[2]),
        l: parseFloat(candle[3]),
        c: parseFloat(candle[4]),
      }));

      if (!historicalDataRef.current[selectedCoin]) {
        historicalDataRef.current[selectedCoin] = {};
      }
      historicalDataRef.current[selectedCoin][selectedInterval] = initialCandles;

      if (chartInstanceRef.current) {
        chartInstanceRef.current.data.datasets[0].data = initialCandles;
        chartInstanceRef.current.update('none');
      } else {
        createChart();
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  }, [selectedCoin, selectedInterval, createChart]);

  useEffect(() => {
    fetchInitialData();

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedCoin}@kline_${selectedInterval}`);

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

    return () => ws.close();
  }, [selectedCoin, selectedInterval, updateChartData, fetchInitialData]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    createChart();
  }, [darkMode, createChart]);

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

        <div className="pt-6 flex items-center">
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