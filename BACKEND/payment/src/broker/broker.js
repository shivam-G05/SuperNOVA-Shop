const amqplib = require("amqplib");

let connection = null;
let channel = null;
let isConnecting = false;

async function connect() {
  if (channel || isConnecting) return channel;
  isConnecting = true;

  try {
    connection = await amqplib.connect(process.env.RABBIT_URL);

    connection.on("error", (err) => {
      console.error("🐇 RabbitMQ connection error:", err.message);
    });

    connection.on("close", () => {
      console.error("🐇 RabbitMQ connection closed. Reconnecting...");
      connection = null;
      channel = null;
      setTimeout(connect, 5000);
    });

    channel = await connection.createChannel();

    channel.on("error", (err) => {
      console.error("🐇 RabbitMQ channel error:", err.message);
    });

    channel.on("close", () => {
      console.warn("🐇 RabbitMQ channel closed");
    });

    console.log("✅ Connected to RabbitMQ");
    isConnecting = false;
    return channel;
  } catch (err) {
    isConnecting = false;
    console.error("❌ RabbitMQ connect failed:", err.message);
    setTimeout(connect, 5000);
  }
}

async function publishToQueue(queueName, data = {}) {
  if (!channel) await connect();

  await channel.assertQueue(queueName, { durable: true });

  channel.sendToQueue(
    queueName,
    Buffer.from(JSON.stringify(data)),
    { persistent: true }
  );

  console.log("📤 Sent:", queueName);
}

async function subscribeToQueue(queueName, callback) {
  if (!channel) await connect();

  await channel.assertQueue(queueName, { durable: true });

  channel.consume(queueName, async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString());
      await callback(data);
      channel.ack(msg);
    } catch (err) {
      console.error("❌ Consumer error:", err.message);
      channel.nack(msg, false, false);
    }
  });

  console.log(`📥 Subscribed to ${queueName}`);
}

module.exports = {
  connect,
  publishToQueue,
  subscribeToQueue,
};
