import React from 'react'
import './Humidity.css'
import Button from '../Button/Button'

const Humidity = ({ humidity }) => {
  const colors = {
    dry: '#F6BB42',
    ideal: '#4FC1E9',
    moist: '#37BC9B',
    saturated: '#3BAFDA',
    danger: '#E9573F',
    textDark: '#2C3E50'
  };

  const getHumidityColor = (hum) => {
    if (hum === null) return colors.textDark
    if (hum < 30) return colors.dry
    if (hum < 60) return colors.ideal
    if (hum < 80) return colors.moist
    return colors.saturated
  };

  return (
    <div className="humidity-card">
      <div className="humidity-header">
        <h2 className="humidity-title">
          <span className="icon">💧</span> Влажность
        </h2>
        <div className="weather-icons">
          <span className="icon">☀️</span>
          <span className="icon">🌧️</span>
        </div>
      </div>

      <div className="humidity-display">
        <div className="humidity-value" style={{ color: getHumidityColor(humidity) }}>
          {humidity !== null ? humidity.toFixed(0) : '--'}
          <span className="humidity-unit">%</span>
        </div>
        <div className="humidity-scale">
          <span style={{ color: colors.dry }}>0%</span>
          <div className="scale-bar">
            <div 
              className="scale-progress" 
              style={{
                width: humidity ? `${humidity}%` : '0%',
                background: getHumidityColor(humidity)
              }}
            />
          </div>
          <span style={{ color: colors.saturated }}>100%</span>
        </div>
      </div>

      <div className="humidity-footer">
        {humidity !== null && (
          <p className="status-message">
            {humidity < 30 ? '🏜️ Сухо' :
             humidity < 60 ? '🌱 Норма' :
             humidity < 80 ? '🌧️ Влажно' : '☔️ Сыро'}
          </p>
        )}
        <Button />
      </div>
    </div>
  )
}

export default Humidity