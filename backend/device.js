const mqtt = require('mqtt');

// Подключение к брокеру test.mosquitto.org
const client = mqtt.connect('mqtt://test.mosquitto.org');

client.on('connect', () => {
  console.log('Device connected to MQTT broker');

  setInterval(() => {
    // Генерация температуры (20–40 °C)
    const temperature = (8 + Math.random() * 35).toFixed(1);
    client.publish('aquaponics/temperature', temperature);
    console.log(`Sent temperature: ${temperature}`);

    // Генерация влажности (30–80 %)
    const humidity = (30 + Math.random() * 50).toFixed(1);
    client.publish('aquaponics/humidity', humidity);
    console.log(`Sent humidity: ${humidity}`);

    // Генерация освещения (0–1000 люкс)
    const light = (Math.random() * 50000).toFixed(1);
    client.publish('aquaponics/light', light);
    console.log(`Sent light: ${light}`);
  }, 3000);
});

client.on('error', (err) => {
  console.error('MQTT error:', err);
});