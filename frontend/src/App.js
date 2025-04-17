import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Temperature from './components/Temperature/temperature';
import Humidity from './components/Humidity/Humidity';
import LightIntensity from './components/LightIntensity/LightIntensity';
import SensorChart from './components/SensorChart/SensorChart';

function App() {
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [lightLevel, setLightLevel] = useState(0);
  const [historicalData, setHistoricalData] = useState(null);
  const [timeRange, setTimeRange] = useState({
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 часа назад
    endDate: new Date()
  });

  // Функция для получения исторических данных
  const fetchHistoricalData = async (start, end) => {
    try {
      const [tempData, humidData, lightData] = await Promise.all([
        axios.get(`http://172.16.22.225:3000/data/temperature?start=${start.toISOString()}&end=${end.toISOString()}`),
        axios.get(`http://172.16.22.225:3000/data/humidity?start=${start.toISOString()}&end=${end.toISOString()}`),
        axios.get(`http://172.16.22.225:3000/data/light?start=${start.toISOString()}&end=${end.toISOString()}`)
      ]);
      
      setHistoricalData({
        temperature: tempData.data,
        humidity: humidData.data,
        light: lightData.data
      });
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  // Функция для получения текущих данных
  const fetchCurrentData = async () => {
    try {
      const [tempResponse, humidResponse, lightResponse] = await Promise.all([
        axios.get('http://172.16.22.225:3000/temperature'),
        axios.get('http://172.16.22.225:3000/humidity'),
        axios.get('http://172.16.22.225:3000/lightlevel')
      ]);
      
      setTemperature(tempResponse.data.temperature);
      setHumidity(humidResponse.data.humidity);
      setLightLevel(lightResponse.data.light);
    } catch (error) {
      console.error('Error fetching current data:', error);
    }
  };

  // Обработчик изменения диапазона времени
  const handleTimeRangeChange = (newStartDate, newEndDate) => {
    setTimeRange({
      startDate: newStartDate,
      endDate: newEndDate
    });
    fetchHistoricalData(newStartDate, newEndDate);
  };

  useEffect(() => {
    // Загружаем текущие данные сразу и каждые 3 секунды
    fetchCurrentData();
    const currentDataInterval = setInterval(fetchCurrentData, 3000);
    
    // Загружаем исторические данные при монтировании
    fetchHistoricalData(timeRange.startDate, timeRange.endDate);
    
    return () => {
      clearInterval(currentDataInterval);
    };
  }, []);

  return (
    <div className="App">
      <div className="sensors-container">
        <Temperature temperature={temperature}/>
        <Humidity humidity={humidity}/>
        <LightIntensity lightLevel={lightLevel}/>
      </div>
      <SensorChart 
        historicalData={historicalData}
        startDate={timeRange.startDate}
        endDate={timeRange.endDate}
        onTimeRangeChange={handleTimeRangeChange}
      />
    </div>
  );
}

export default App;