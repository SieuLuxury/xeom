# Trạm Dịu Dàng 🏍️

Một trải nghiệm web dành cho hành khách: cào thẻ để nhận lời nhắn tử tế từ tài xế.

## Có gì trong bản này?

- Giao diện Gen Z soft-maximalist với sticker, aurora background và motion tôn trọng `prefers-reduced-motion`.
- Scratch card hỗ trợ touch, chuột và keyboard.
- 92 lời nhắn nguyên bản, đa dạng giữa động viên, nhắc nhẹ, lời chúc và suy ngẫm; tự đổi sắc thái theo buổi sớm, giữa ngày, cuối chiều và đêm muộn.
- Ambient radio tạo bằng Web Audio, mood check-in, lưu lời nhắn, dark mode và bài thở 30 giây.
- “Mang lời nhắn theo” tạo card PNG dọc 9:16, không chứa dữ liệu cá nhân.
- “Lời nhắn nối chuyến” có hàng chờ kiểm duyệt trong Driver Inbox; form tự khóa nếu production Rules còn hở.
- QR Studio để tạo/in QR, copy URL cho NFC và ghi NFC trực tiếp trên trình duyệt có Web NFC.
- Driver Inbox có Google sign-in gate và Firestore Rules chuẩn bị sẵn.

## Chạy local

Đây là static site. Mở `index.html` bằng một static server, ví dụ:

```powershell
python -m http.server 8765
```

Sau đó vào `http://127.0.0.1:8765/`.

## Lưu ý Firebase

Trước khi dùng Driver Inbox ở production, cần bật Google Sign-In, gán custom claim `driver: true` cho tài khoản tài xế và deploy Rules:

```powershell
firebase deploy --only firestore:rules --project loi-nhan
```

`apiKey` trong Firebase Web config là mã định danh public dành cho client; lớp bảo vệ dữ liệu nằm ở Authentication, Firestore Rules và App Check. Không commit service-account key, Admin SDK credential hoặc private key.

Số `totalViews` trên giao diện được ghi nhãn là **lượt mở thẻ**: mỗi lần một category chưa mở trong ngày được chọn sẽ tăng một lượt. Đây không phải số hành khách duy nhất hay số session duy nhất.
