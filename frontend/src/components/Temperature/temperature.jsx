import React from 'react';
import './Temperature.css';
import Button from '../Button/Button';

const Temperature = ({ temperature }) => {
  const colors = {
    water: '#4A89DC',
    plant: '#8CC152',
    fish: '#3BAFDA',
    soil: '#A37F6B',
    danger: '#E9573F',
    textDark: '#2C3E50',
    textLight: '#F5F7FA'
  };

  const getTempColor = (temp) => {
    if (temp === null) return colors.textDark;
    if (temp < 14) return colors.water;
    if (temp < 26) return colors.plant;
    if (temp < 30) return colors.fish;
    return colors.danger;
  };

  return (
    <div className="temperature-card">
      <div className="temperature-header">
        <h2 className="temperature-title">
          <span className="icon">🌱</span> Температура
        </h2>
        <div className="ecosystem-icons">
          <span className="icon">💧</span>
          <span className="icon">🐟</span>
        </div>
      </div>

      <div className="temperature-display">
        <div className="temperature-value" style={{ color: getTempColor(temperature) }}>
          {temperature !== null ? temperature.toFixed(1) : '--'}
          <span className="temperature-unit">°C</span>
        </div>
        <div className="temperature-scale">
          <span style={{ color: colors.water }}>10°</span>
          <div className="scale-bar">
            <div 
              className="scale-progress" 
              style={{
                width: temperature ? `${Math.min(100, Math.max(0, (temperature - 10) / 40 * 100))}%` : '0%',
                background: getTempColor(temperature)
              }}
            />
          </div>
          <span style={{ color: colors.danger }}>50°</span>
        </div>
      </div>

      <div className="temperature-footer">
        {temperature !== null && (
          <p className="status-message">
            {temperature < 14 ? '❄️ Прохладно' :
             temperature < 26 ? '🌿 Норма' :
             temperature < 30 ? '⚠️ Тепло' : '🔥 Опасно'}
          </p>
        )}
      </div>
    </div>
  );
};

export default Temperature;