# Trạm Dịu Dàng 🏍️

Một trải nghiệm web dành cho hành khách: cào thẻ để nhận lời nhắn tử tế từ tài xế.

## Có gì trong bản này?

- Giao diện Gen Z soft-maximalist với sticker, aurora background và motion tôn trọng `prefers-reduced-motion`.
- Scratch card hỗ trợ touch, chuột và keyboard.
- Ambient radio tạo bằng Web Audio, mood check-in, lưu lời nhắn, dark mode và bài thở 30 giây.
- QR Studio để tạo/in QR cho hành khách.
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

Không commit service-account key hoặc file `.env`.
