const express = require('express');
const { Router } = require('express');
const cors = require('cors');
const amqplib = require('amqplib');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
const fileUpload = require('express-fileupload'); // Добавьте это

const PORT = 5000;
const app = express();

app.use(fileUpload({ // Используйте express-fileupload
  createParentPath: true,
}));
app.use(cors({
  credentials: true,
  origin: 3000
}));
app.use(express.json());

const router = Router();

async function startModifications(req, res, next) {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    let uploadedImage = req.files.image; // Предполагаем, что название поля для файла - image

    console.log('File received: ', uploadedImage.name);

    amqplib.connect('amqp://guest:guest@localhost:5672').then((connection) => { 
      connection.createChannel().then((channel) => {
        let queueName = 'blackAndWhite';
        let message = uploadedImage.data; // Используем буфер данных изображения
        channel.assertQueue(queueName);
        channel.sendToQueue(queueName, Buffer.from(message));
        console.log('API image sent: ' + uploadedImage.name);
      }).catch(e => { throw e; });

    }).catch(e => { throw e; });

    return res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}

router.post('/', startModifications);
app.use('/api', router);

const start = async () => {
  try {
    app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`));

    wss.on('connection', function connection(ws) {
      console.log('A new client connected');
      
      ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        wss.clients.forEach(function each(client) {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      });    
      ws.on('close', () => console.log('Client has disconnected'));
    });
    
  } catch (error) {
    console.log(error);
  }
}

start();