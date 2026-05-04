const amqplib = require('amqplib');

let connection = null;
let channel = null;

async function connect() {
    if (connection && channel) return;

    const rabbitUrl = process.env.RABBIT_URL;
    if (!rabbitUrl) {
        console.log('RABBIT_URL not set — broker disabled');
        return;
    }

    connection = await amqplib.connect(
        rabbitUrl + '?heartbeat=60'
    );

    connection.on('error', (err) => {
        console.error('RabbitMQ error:', err.message);
    });

    connection.on('close', () => {
        console.log('RabbitMQ connection closed');

        connection = null;
        channel = null;

        setTimeout(connect, 5000);
    });

    channel = await connection.createChannel();

    console.log('Connected to RabbitMQ');
}

async function publishToQueue(queueName, data = {}) {
    if (!process.env.RABBIT_URL) return;

    await connect();
    if (!channel) return;

    await channel.assertQueue(queueName, { durable: true });

    channel.sendToQueue(
        queueName,
        Buffer.from(JSON.stringify(data))
    );
}

async function subscribeToQueue(queueName, callback) {
    if (!process.env.RABBIT_URL) return;

    await connect();
    if (!channel) return;

    await channel.assertQueue(queueName, { durable: true });

    channel.consume(queueName, async (msg) => {
        if (!msg) return;

        try {
            const data = JSON.parse(msg.content.toString());

            await callback(data);

            channel.ack(msg);
        } catch (err) {
            console.error(err);
            channel.nack(msg, false, false);
        }
    });
}

module.exports = {
    connect,
    publishToQueue,
    subscribeToQueue
};