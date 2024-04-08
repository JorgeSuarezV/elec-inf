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

function createDateInTimezone(offset: number): Date {
    // Create a new date object
    const date = new Date();
    // Calculate the offset in milliseconds
    const offsetInMilliseconds = offset * 60 * 60 * 1000;
    // Adjust the date to the specified timezone
    return new Date(date.getTime() + offsetInMilliseconds);
}

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
        await prisma.user.update({
            where: {
                rfid: rfid
            },
            data: {
                temperature: parseInt(temperature)
            }
        })
        client.publish('temperatures_stats', temperature);
        const avgTemp = await prisma.user.aggregate({
            _avg: {
                temperature: true
            }
        })
        // @ts-ignore
        client.publish('avg_temp', String(avgTemp._avg.temperature))
        const arg = createDateInTimezone(-3)
        console.log(arg)
        client.publish('last_serve', `${arg.getDay()}/${arg.getMonth()}   ${arg.getHours()}:${arg.getMinutes()}:${arg.getSeconds()}`)
    }
});


