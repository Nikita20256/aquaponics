import React, { useState, useEffect } from 'react'
import axios from 'axios';
import './App.css';
import Temperature from './components/Temperature/temperature'
import Humidity from './components/Humidity/Humidity'

function App() {
  const [temperature, setTemperature] = useState(0)
  const [humidity, setHumidity] = useState(0)

  const fetchTemperature = async () => {
    try {
      const response = await axios.get('http://192.168.248.109:3000/temperature')
      setTemperature(response.data.temperature)
    } catch (error) {
      console.error('Error fetching temperature:', error)
    }
  }

  const fetchHumidity = async () => {
    try {
      const response = await axios.get('http://192.168.248.109:3000/humidity')
      setHumidity(response.data.humidity)
    } catch (error) {
      console.error('Error fetching humidity:', error)
    }
  }

  useEffect(() => {
    fetchTemperature();
    const tempInterval = setInterval(fetchTemperature, 3000)

    fetchHumidity();
    const humInterval = setInterval(fetchHumidity, 3000)

    return () => {
      clearInterval(tempInterval)
      clearInterval(humInterval)
    }
  }, [])

  return (
    <div className="App">
      <Temperature temperature={temperature} />
      <Humidity humidity={humidity} />
    </div>
  );
}

export default App


