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
  const [history, setHistory] = useState([]);
  const [timestamps, setTimestamps] = useState([]);

  const fetchAllData = async () => {
    try {
      const now = new Date();
      const timeString = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      
      const [tempResponse, humidResponse, lightResponse] = await Promise.all([
        axios.get('http://172.16.22.225:3000/temperature'),
        axios.get('http://172.16.22.225:3000/humidity'),
        axios.get('http://172.16.22.225:3000/lightlevel')
      ]);
      
      setTemperature(tempResponse.data.temperature)
      setHumidity(humidResponse.data.humidity)
      setLightLevel(lightResponse.data.light)
      
      setHistory(prev => {
        const newData = {
          time: timeString,
          temperature: tempResponse.data.temperature,
          humidity: humidResponse.data.humidity,
          light: lightResponse.data.light
        };
        return [...prev.slice(-9), newData];
      })
      
      setTimestamps(prev => [...prev.slice(-9), timeString]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 3000);
    return () => clearInterval(interval);
  }, [])

  return (
    <div className="App">
      <div className="sensors-container">
        <Temperature temperature={temperature}/>
        <Humidity humidity={humidity}/>
        <LightIntensity lightLevel={lightLevel}/>
      </div>
      <SensorChart timestamps={timestamps} history={history} />
    </div>
  )
}

export default App