const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});

app.use(express.json());

app.post('/webhook', (req, res) => {
  const { transferAmount } = req.body;
  const authHeader = req.headers['authorization'];
  
  let clientCode = null;
  if (authHeader && authHeader.startsWith('Apikey ')) {
      clientCode = authHeader.split(' ')[1];
  }

  // Handle SePay payment data
  if (transferAmount !== undefined) {
    console.log(`Received payment: ${transferAmount} - Code: ${clientCode}`);
    
    // Emit full data to client
    io.emit('payment_received', { 
        clientCode: clientCode,
        transaction: req.body
    });

    return res.status(200).send({ success: true });
  }

  res.status(400).send({ status: 'invalid data' });
});

io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
