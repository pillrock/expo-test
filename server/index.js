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


//   {
//     "id": 92704,                              // ID giao dịch trên SePay
//     "gateway":"Vietcombank",                  // Brand name của ngân hàng
//     "transactionDate":"2023-03-25 14:02:37",  // Thời gian xảy ra giao dịch phía ngân hàng
//     "accountNumber":"0123499999",              // Số tài khoản ngân hàng
//     "code":null,                               // Mã code thanh toán (sepay tự nhận diện dựa vào cấu hình tại Công ty -> Cấu hình chung)
//     "content":"chuyen tien mua iphone",        // Nội dung chuyển khoản
//     "transferType":"in",                       // Loại giao dịch. in là tiền vào, out là tiền ra
//     "transferAmount":2277000,                  // Số tiền giao dịch
//     "accumulated":19077000,                    // Số dư tài khoản (lũy kế)
//     "subAccount":null,                         // Tài khoản ngân hàng phụ (tài khoản định danh),
//     "referenceCode":"MBVCB.3278907687",         // Mã tham chiếu của tin nhắn sms
//     "description":""                           // Toàn bộ nội dung tin nhắn sms
// }
// Webhook endpoint for 3rd party
app.post('/webhook', (req, res) => {
  const { transferAmount } = req.body;

  // Handle SePay payment data
  if (transferAmount !== undefined) {
    const speechText = `Đã nhận được ${transferAmount} đồng`;
    io.emit('tts-message', { text: speechText });
    return res.status(200).send({ status: 'sent to app', message: speechText });
  }

  res.status(400).send({ status: 'no transferAmount provided' });
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
