const express = require('express');
const amqp = require('amqplib');
const winston = require('winston');

const app = express();
const port = 3000;

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'microservice_1' },
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'microservice_1.log' })
    ]
});

async function connectToRabbitMQ() {
    try {
        const url = 'amqp://guest:guest@pop-os.localdomain';
        const connection = await amqp.connect(url);

        const channel = await connection.createChannel();

        const requestQueue = 'request_queue';
        const resultQueue = 'result_queue';

        await channel.assertQueue(requestQueue, { durable: true });
        await channel.assertQueue(resultQueue, { durable: true });

        app.set('rabbitMQChannel', channel);
        app.set('resultQueue', resultQueue);

        logger.info('Microservice M1 - Connected to RabbitMQ.');
        console.log('Microservice M1 - Connected to RabbitMQ.');
    } catch (err) {
        logger.error(`Microservice M1 - Error connecting to RabbitMQ: ${err}`);
        console.log(`Microservice M1 - Error connecting to RabbitMQ: ${err}`);
        process.exit(1);
    }
}

app.get('/', async (req, res) => {
    const message = JSON.stringify(req.query);

    try {
        const channel = app.get('rabbitMQChannel');
        const resultQueue = app.get('resultQueue');

        channel.sendToQueue('request_queue', Buffer.from(message), { persistent: true });

        logger.info(`Microservice M1 - Sent message to RabbitMQ: ${message}`);
        console.log(`Microservice M1 - Sent message to RabbitMQ: ${message}`);

        channel.consume(resultQueue, (msg) => {
            if (msg.properties.correlationId === req.id) {
                const result = msg.content.toString();
                logger.info(`Microservice M1 - Received result from RabbitMQ: ${result}`);
                console.log(`Microservice M1 - Received result from RabbitMQ: ${result}`);
                res.send(result);
            }
        }, { noAck: true });
    } catch (err) {
        logger.error(`Microservice M1 - Error sending message to RabbitMQ: ${err}`);
        console.log(`Microservice M1 - Error sending message to RabbitMQ: ${err}`);
        res.status(500).send('Microservice M1 - Error processing the request.');
    }
});

async function startServer() {
    await connectToRabbitMQ();
    app.listen(port, () => {
        logger.info(`Microservice M1 - Listening at http://localhost:${port}`);
        console.log(`Microservice M1 - Listening at http://localhost:${port}`);
    });
}
startServer().then(r => console.log(`Server started`));