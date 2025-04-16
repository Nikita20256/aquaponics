const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const mqtt = require('mqtt');
const cors = require('cors');
const app = express();

test = "test";

app.use(cors());
app.use(express.static('public'));

const db = new sqlite3.Database('aquaponics.db', (err) => {
  if (err) console.error('SQLite error:', err);
  else console.log('SQLite connected');
});
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS temperature (id INTEGER PRIMARY KEY AUTOINCREMENT, value REAL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
  db.run("CREATE TABLE IF NOT EXISTS humidity (id INTEGER PRIMARY KEY AUTOINCREMENT, value REAL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
  db.run("CREATE TABLE IF NOT EXISTS light (id INTEGER PRIMARY KEY AUTOINCREMENT, value REAL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

const mqttClient = mqtt.connect('mqtt://test.mosquitto.org');
let latestTemperature = 0;
let latestHumidity = 0;
let latestLight = 0;

mqttClient.on('connect', () => {
  console.log('MQTT connected');
  mqttClient.subscribe('aquaponics/temperature', (err) => {
    if (err) console.error('MQTT subscribe error:', err);
    else console.log('Subscribed to temperature topic');
  });
  mqttClient.subscribe('aquaponics/humidity', (err) => {
    if (err) console.error('MQTT subscribe error:', err);
    else console.log('Subscribed to humidity topic');
  });
  mqttClient.subscribe('aquaponics/light', (err) => {
    if (err) console.error('MQTT subscribe error:', err);
    else console.log('Subscribed to light topic');
  });
});

mqttClient.on('message', (topic, message) => {
  const value = parseFloat(message.toString());
  if (topic === 'aquaponics/temperature') {
    latestTemperature = value;
    db.run("INSERT INTO temperature (value) VALUES (?)", [value], (err) => {
      if (err) console.error('SQLite insert error (temp):', err);
    });
    console.log(`Received temperature: ${value}`);
  } else if (topic === 'aquaponics/humidity') {
    latestHumidity = value;
    db.run("INSERT INTO humidity (value) VALUES (?)", [value], (err) => {
      if (err) console.error('SQLite insert error (humid):', err);
    });
    console.log(`Received humidity: ${value}`);
  } else if (topic === 'aquaponics/light') {
    latestLight = value;
    db.run("INSERT INTO light (value) VALUES (?)", [value], (err) => {
      if (err) console.error('SQLite insert error (light):', err);
    });
    console.log(`Received light: ${value}`);
  }
});

mqttClient.on('error', (err) => {
  console.error('MQTT error:', err);
});

app.get('/temperature', (req, res) => {
  res.json({ temperature: latestTemperature });
});

app.get('/humidity', (req, res) => {
  res.json({ humidity: latestHumidity });
});

app.get('/lightlevel', (req, res) => {
  res.json({ light: latestLight });
});

app.get('/history', (req, res) => {
  db.all("SELECT value, timestamp FROM temperature ORDER BY timestamp DESC LIMIT 10", (err, tempRows) => {
    if (err) {
      console.error('SQLite select error (temp):', err);
      res.status(500).json({ error: 'Database error' });
    } else {
      db.all("SELECT value, timestamp FROM humidity ORDER BY timestamp DESC LIMIT 10", (err, humidRows) => {
        if (err) {
          console.error('SQLite select error (humid):', err);
          res.status(500).json({ error: 'Database error' });
        } else {
          db.all("SELECT value, timestamp FROM light ORDER BY timestamp DESC LIMIT 10", (err, lightRows) => {
            if (err) {
              console.error('SQLite select error (light):', err);
              res.status(500).json({ error: 'Database error' });
            } else {
              res.json({ temperature: tempRows, humidity: humidRows, light: lightRows });
            }
          });
        }
      });
    }
  });
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:3000');
});