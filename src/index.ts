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
    client.subscribe('setTemp', () => {
        console.log('Subscribed to setTemp topic');
    });
});

client.on('message', async (topic, message) => {
    console.log(`Received message on topic ${topic}: ${message.toString()}`);
    if (topic === 'authorization') {
        const user = await prisma.user.findUnique({
            where: {
                rfid: message.toString()
            }
        })
        if (user) {
            client.publish('serve', user.temperature.toString());
            console.log("User authorized")
        }

    }
    if (topic === 'setTemp') {
        const rfid = message.toString().split(',')[0];
        const temperature = message.toString().split(',')[1];
        console.log(rfid, temperature);
        prisma.user.update({
            where: {
                rfid: rfid
            },
            data: {
                temperature: parseInt(temperature)
            }
        })
    }
});