
# Binance Market Data WebSocket Implementation

This project provides a real-time candlestick chart visualization for cryptocurrency market data using Binance's WebSocket API. It supports toggling between multiple cryptocurrencies, selecting time intervals, and maintaining historical data for each coin.

## Features

1. **Real-time Market Data from Binance**:
   - Connects to the Binance WebSocket to receive live market data.
   - WebSocket URL: `wss://stream.binance.com:9443/ws/<symbol>@kline_<interval>`.

2. **Cryptocurrency Toggle**:
   - Supports the following coins:
     - ETH/USDT
     - BNB/USDT
     - DOT/USDT
   - Allows switching between different coins while maintaining their historical chart data.
   - Uses local storage or in-memory data to preserve chart data across coin switches.

3. **Candlestick Chart Visualization**:
   - Displays a live candlestick chart for the selected cryptocurrency.
   - Maintains the previously loaded chart data when switching between coins.
   - Built using `Chart.js` and `chartjs-chart-financial`.

4. **Candlestick Timeframes**:
   - Users can choose between 1-minute, 3-minute, and 5-minute intervals for the chart.
   - Interval options: `1m`, `3m`, `5m`.

5. **Data Persistence**:
   - Uses local storage or an in-memory solution to persist candlestick data for each coin.
   - Restores the chart with previously received data when switching back to a coin.
   - Updates the chart in real-time as new WebSocket messages are received.

6. **User Interface**:
   - Clean and responsive UI built with `React` and `Tailwind CSS`.
   - Dropdown selectors for choosing cryptocurrency and time intervals.
   - Dark mode toggle with persistence using local storage.

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Charting Library**: Chart.js, chartjs-chart-financial
- **WebSocket API**: Binance WebSocket API
- **State Management**: useState, useEffect, useRef, useCallback
- **Real-time Data Handling**: WebSockets
- **Data Storage**: Local storage and in-memory cache

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/binance-websocket-chart.git
   cd binance-websocket-chart
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:3000` to view the application.

## Usage

### 1. Select Cryptocurrency

- Use the dropdown in the UI to switch between ETH/USDT, BNB/USDT, and DOT/USDT pairs.
- The chart will automatically update with the selected coin's candlestick data.

### 2. Select Time Interval

- Use the time interval dropdown to choose between `1 minute`, `3 minutes`, and `5 minutes`.
- The chart will reflect the candlestick data for the selected interval.

### 3. Dark Mode

- Toggle between light and dark modes using the provided switch.
- The selected mode is saved in local storage and will persist across sessions.

## WebSocket Details

The application connects to Binance's WebSocket API for real-time data updates. The WebSocket URL used to connect follows the format:

```
wss://stream.binance.com:9443/ws/<symbol>@kline_<interval>
```

Where:
- `<symbol>` is the trading pair (e.g., `ethusdt`, `bnbusdt`, or `dotusdt`).
- `<interval>` is the candlestick interval (e.g., `1m`, `3m`, `5m`).

For example, to receive ETH/USDT data for 1-minute candlesticks, the WebSocket URL would be:

```
wss://stream.binance.com:9443/ws/ethusdt@kline_1m
```

## Data Persistence

- The app stores historical chart data in local storage. When you switch back to a previously selected cryptocurrency, the chart will reload the saved data and append new candlesticks in real-time.
  
## Project Structure

```plaintext
src/
├── components/
│   ├── Chart.js               # Candlestick chart component
│   ├── CoinSelector.js        # Dropdown for selecting cryptocurrencies
│   ├── IntervalSelector.js    # Dropdown for selecting time intervals
│   ├── DarkModeToggle.js      # Dark mode switch component
├── styles/
│   └── tailwind.css           # Tailwind CSS styles
├── App.js                     # Root component
├── index.js                   # Entry point of the React app
```

## Future Enhancements

- **Additional Cryptocurrencies**: Add more cryptocurrency pairs to the dropdown.
- **Chart Customization**: Allow users to customize chart views (e.g., add technical indicators).
- **Error Handling**: Improve WebSocket error handling and implement reconnection strategies.
- **Performance Optimization**: Optimize chart rendering for high-frequency data updates.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
```




