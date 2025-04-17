import React from 'react';
import './LightIntensity.css';
import Button from '../Button/Button';

const LightIntensity = ({ lightLevel }) => {
  // Цветовая палитра на основе природных оттенков света
  const colors = {
    dark: '#4A4A4A',        // Темный (недостаток света)
    low: '#8CC152',         // Зеленый (низкий уровень)
    ideal: '#FFCE54',       // Желтый (идеальный уровень)
    high: '#FC6E51',        // Оранжевый (высокий уровень)
    danger: '#ED5565',      // Красный (опасный уровень)
    textDark: '#2C3E50',
    textLight: '#F5F7FA'
  };

  // Определение цвета освещенности
  const getLightColor = (light) => {
    if (light === null) return colors.textDark;
    if (light < 2000) return colors.dark;      // Слишком темно
    if (light < 10000) return colors.low;     // Низкий уровень
    if (light < 30000) return colors.ideal;   // Идеально
    if (light < 50000) return colors.high;    // Высокий уровень
    return colors.danger;                     // Опасно
  };

  // Градиент на основе солнечного света
  const getBackground = () => {
    return `linear-gradient(135deg, ${colors.ideal}20 0%, ${colors.high}20 100%)`;
  };

  // Перевод в проценты для шкалы
  const getPercentage = (light) => {
    if (!light) return 0;
    return Math.min(100, (light / 50000) * 100);
  };

  return (
    <div 
      className="light-card"
      style={{ background: getBackground() }}
    >
      <div className="light-header">
        <h1 className="light-title">
          <span className="icon">☀️</span> Освещенние аквапоники 
        </h1>
        <div className="light-icons">
          <span className="icon">🌑</span>
          <span className="icon">🌤️</span>
          <span className="icon">🔆</span>
        </div>
      </div>

      <div className="light-display">
        <div className="light-value" style={{ color: getLightColor(lightLevel) }}>
          {lightLevel !== null ? lightLevel.toLocaleString() : '--'}
          <span className="light-unit">lux</span>
        </div>
        <div className="light-scale">
          <span style={{ color: colors.dark }}>0</span>
          <div className="scale-bar">
            <div 
              className="scale-progress" 
              style={{
                width: `${getPercentage(lightLevel)}%`,
                background: getLightColor(lightLevel)
              }}
            />
          </div>
          <span style={{ color: colors.danger }}>50k</span>
        </div>
      </div>

      <div className="light-footer">
        {lightLevel !== null && (
          <p className="status-message">
            {lightLevel < 2000 ? (
              <>🌑 Слишком темно для растений</>
            ) : lightLevel < 10000 ? (
              <>🌥️ Низкая освещенность</>
            ) : lightLevel < 30000 ? (
              <>🌞 Идеальный уровень</>
            ) : lightLevel < 50000 ? (
              <>⚠️ Яркий свет</>
            ) : (
              <>🔥 Опасная интенсивность</>
            )}
          </p>
        )}
        <Button />
      </div>
    </div>
  );
};

export default LightIntensity;