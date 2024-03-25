import mqtt from 'mqtt';

const ip = "localhost";
const client = mqtt.connect(`mqtt://${ip}:1883`)

client.on('connect', () => {
  console.log('Connected to MQTT broker');
    client.subscribe('authorization', () => {
        console.log('Subscribed to authorization topic');
    });
});

client.on('message', (topic, message) => {
    if (topic === 'authorization') {
        console.log(`Received message on topic ${topic}: ${message.toString()}`);
    }
    if (topic === 'setTemp'){
        console.log(`Received message on topic ${topic}: ${message.toString()}`);
    }
});