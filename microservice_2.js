const amqp = require('amqplib');
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'microservice_2' },
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'microservice_2.log' })
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
        await channel.prefetch(1);

        logger.info('Microservice M2 - Connected to RabbitMQ.');
        console.log('Microservice M2 - Connected to RabbitMQ.');

        channel.consume(requestQueue, (msg) => {
            const content = msg.content.toString();
            logger.info(`Microservice M2 - Received message from RabbitMQ: ${content}`);
            console.log(`Microservice M2 - Received message from RabbitMQ: ${content}`);

            const result = 'Task processed successfully.';

            channel.sendToQueue(resultQueue, Buffer.from(result), {
                persistent: true,
                correlationId: msg.properties.correlationId,
            });

            channel.ack(msg);
        });
    } catch (err) {
        logger.error(`Microservice M2 - Error connecting to RabbitMQ: ${err}`);
        console.log(`Microservice M2 - Error connecting to RabbitMQ: ${err}`);
        process.exit(1);
    }
}

connectToRabbitMQ().then(r => console.log('Microservice M2 - Started processing tasks.'));