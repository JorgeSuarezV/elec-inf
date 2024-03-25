import mqtt from 'mqtt';
import {PrismaClient} from '@prisma/client';

const ip = "localhost";
const client = mqtt.connect(`mqtt://${ip}:1883`)

const prisma = new PrismaClient();

client.on('connect', () => {
  console.log('Connected to MQTT broker');
    client.subscribe('authorization', () => {
        console.log('Subscribed to authorization topic');
    });
});

client.on('message', async (topic, message) => {
    if (topic === 'authorization') {
        const user = await prisma.user.findUnique({
            where: {
                rfid: message.toString()
            }
        })
        if (user) client.publish('serve', user.temperature.toString());

        console.log(`Received message on topic ${topic}: ${message.toString()}`);
    }
    if (topic === 'setTemp'){
        prisma.user.update({
            where: {
                rfid: message.toString()
            },
            data: {
                temperature: parseInt(message.toString())
            }
        })
        console.log(`Received message on topic ${topic}: ${message.toString()}`);
    }
});