const amqplib = require('amqplib');
const WebSocket = require('ws');
const sharp = require('sharp');

amqplib.connect('amqp://guest:guest@localhost:5672').then((connection) => {
  connection.createChannel().then((channel) => {
    let recieverQueueName = 'blackAndWhite';
    channel.assertQueue(recieverQueueName);

    channel.consume(recieverQueueName, (msg) => {
      // Преобразование изображения в черно-белое
      sharp(msg.content)
        .grayscale() // Преобразование в черно-белое
        .toBuffer() // Возвращаем обработанное изображение как Buffer
        .then((bwImageBuffer) => {
          console.log('Image converted to black and white');

          // Создание соединения WebSocket для отправки изображения
          const ws = new WebSocket('ws://localhost:8080');

          ws.on('open', function open() {
            console.log('Connected to the WebSocket server');
            // Отправляем черно-белое изображение
            ws.send(bwImageBuffer);
          });

          ws.on('error', function error(err) {
            console.log('WebSocket error: ' + err.message);
          });
        })
        .catch((err) => {
          console.error('Error converting image to black and white:', err);
        });
    });
  }).catch(e => { throw e; });
}).catch(e => { throw e; });