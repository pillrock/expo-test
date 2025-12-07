# Hướng dẫn gửi Push Notification từ Server (Node.js)

Để app có thể nhận thông báo khi đang tắt, Server của bạn cần gửi request đến Expo Push Service.

## 1. Cài đặt thư viện trên Server

Tại thư mục server (Node.js), chạy lệnh:

```bash
npm install expo-server-sdk
```

## 2. Code mẫu gửi thông báo

Thêm đoạn code sau vào logic xử lý giao dịch thành công (socket event `payment_received` hoặc webhook):

```javascript
const { Expo } = require("expo-server-sdk");

// Tạo Expo client
let expo = new Expo();

// Hàm gửi thông báo
async function sendPushNotification(pushToken, messageData) {
  // Kiểm tra token có hợp lệ không
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    return;
  }

  // Tạo nội dung thông báo
  // "sound": "default" giúp điện thoại phát tiếng 'ting'
  const messages = [
    {
      to: pushToken,
      sound: "default",
      title: "💸 Nhận tiền thành công!",
      body: `Đã nhận ${messageData.amount.toLocaleString()} VND. Nội dung: ${
        messageData.content
      }`,
      data: { transactionId: messageData.id },
    },
  ];

  try {
    // Gửi thông báo
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    for (let chunk of chunks) {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }
    console.log("Push notification sent:", tickets);
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}

// --- SỬ DỤNG ---
// Khi lưu clientCode/Token từ App gửi lên, hãy lưu kèm pushToken vào Database.
// const userPushToken = getUserPushToken(clientCode);
// const transactionData = { amount: 50000, content: "Chuyen tien", id: "123" };
// await sendPushNotification(userPushToken, transactionData);
```

## 3. Lưu ý quan trọng

- **Lấy Token**: App hiện tại đã log ra Token ở Console khi khởi động (`EXPO PUSH TOKEN: ...`). Bạn cần copy token này (hoặc code thêm api để App gửi token lên Server lưu vào DB) và dùng nó trong hàm `sendPushNotification`.
- **Âm thanh**: Trường `sound: 'default'` là bắt buộc để có tiếng báo.
