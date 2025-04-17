const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const mqtt = require('mqtt');
const cors = require('cors');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.static('public'));

// Логирование в файл
const logStream = fs.createWriteStream('server.log', { flags: 'a' });
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  console.log(logMessage.trim());
  logStream.write(logMessage);
};

// SQLite подключение
const db = new sqlite3.Database('aquaponics.db', (err) => {
  if (err) {
    log(`SQLite error: ${err.message}`);
    process.exit(1);
  }
  log('SQLite connected');
});
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS temperature (id INTEGER PRIMARY KEY AUTOINCREMENT, value REAL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
  db.run("CREATE TABLE IF NOT EXISTS humidity (id INTEGER PRIMARY KEY AUTOINCREMENT, value REAL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
  db.run("CREATE TABLE IF NOT EXISTS light (id INTEGER PRIMARY KEY AUTOINCREMENT, value REAL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

// MQTT подключение
const mqttClient = mqtt.connect('mqtt://test.mosquitto.org', {
  reconnectPeriod: 1000,
});
let latestTemperature = 0;
let latestHumidity = 0;
let latestLight = 0;

mqttClient.on('connect', () => {
  log('MQTT connected');
  mqttClient.subscribe(['aquaponics/temperature', 'aquaponics/humidity', 'aquaponics/light'], (err) => {
    if (err) {
      log(`MQTT subscribe error: ${err.message}`);
    } else {
      log('Subscribed to MQTT topics');
    }
  });
});

mqttClient.on('message', (topic, message) => {
  const value = parseFloat(message.toString());
  if (isNaN(value)) {
    log(`Invalid MQTT message on ${topic}: ${message}`);
    return;
  }

  if (topic === 'aquaponics/temperature') {
    latestTemperature = value;
    db.run("INSERT INTO temperature (value) VALUES (?)", [value], (err) => {
      if (err) log(`SQLite insert error (temp): ${err.message}`);
      else log(`Received temperature: ${value}`);
    });
  } else if (topic === 'aquaponics/humidity') {
    latestHumidity = value;
    db.run("INSERT INTO humidity (value) VALUES (?)", [value], (err) => {
      if (err) log(`SQLite insert error (humid): ${err.message}`);
      else log(`Received humidity: ${value}`);
    });
  } else if (topic === 'aquaponics/light') {
    latestLight = value;
    db.run("INSERT INTO light (value) VALUES (?)", [value], (err) => {
      if (err) log(`SQLite insert error (light): ${err.message}`);
      else log(`Received light: ${value}`);
    });
  }
});

mqttClient.on('error', (err) => {
  log(`MQTT error: ${err.message}`);
});

// API маршруты для актуальных данных
app.get('/temperature', (req, res) => {
  res.json({ temperature: latestTemperature });
});

app.get('/humidity', (req, res) => {
  res.json({ humidity: latestHumidity });
});

app.get('/lightlevel', (req, res) => {
  res.json({ light: latestLight });
});

// API для исторических данных по датчикам
app.get('/data/temperature', (req, res) => {
  const { start, end, limit } = req.query;
  const queryLimit = parseInt(limit) || 100;
  const startTime = start ? new Date(start).toISOString() : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const endTime = end ? new Date(end).toISOString() : new Date().toISOString();

  db.all(
    "SELECT value, timestamp FROM temperature WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp ASC LIMIT ?",
    [startTime, endTime, queryLimit],
    (err, rows) => {
      if (err) {
        log(`SQLite select error (temperature): ${err.message}`);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

app.get('/data/humidity', (req, res) => {
  const { start, end, limit } = req.query;
  const queryLimit = parseInt(limit) || 100;
  const startTime = start ? new Date(start).toISOString() : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const endTime = end ? new Date(end).toISOString() : new Date().toISOString();

  db.all(
    "SELECT value, timestamp FROM humidity WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp ASC LIMIT ?",
    [startTime, endTime, queryLimit],
    (err, rows) => {
      if (err) {
        log(`SQLite select error (humidity): ${err.message}`);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

app.get('/data/light', (req, res) => {
  const { start, end, limit } = req.query;
  const queryLimit = parseInt(limit) || 100;
  const startTime = start ? new Date(start).toISOString() : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const endTime = end ? new Date(end).toISOString() : new Date().toISOString();

  db.all(
    "SELECT value, timestamp FROM light WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp ASC LIMIT ?",
    [startTime, endTime, queryLimit],
    (err, rows) => {
      if (err) {
        log(`SQLite select error (light): ${err.message}`);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

// Запуск сервера
const server = app.listen(3000, '0.0.0.0', () => {
  log('Server running on http://0.0.0.0:3000');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('Received SIGTERM. Shutting down gracefully...');
  server.close(() => {
    db.close((err) => {
      if (err) log(`Error closing SQLite: ${err.message}`);
      mqttClient.end();
      logStream.end();
      log('Server stopped');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  log('Received SIGINT. Shutting down gracefully...');
  server.close(() => {
    db.close((err) => {
      if (err) log(`Error closing SQLite: ${err.message}`);
      mqttClient.end();
      logStream.end();
      log('Server stopped');
      process.exit(0);
    });
  });
});