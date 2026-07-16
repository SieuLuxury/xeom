# Bảo mật Driver Inbox

Driver Inbox chỉ an toàn khi **cả client và Firebase Console** được cấu hình. Việc giữ bí mật URL hoặc Firebase Web `apiKey` không phải là lớp phân quyền.

## 1. Bật đăng nhập Google

Trong Firebase Console:

1. Authentication → Sign-in method → bật Google.
2. Authentication → Settings → Authorized domains → thêm domain production, ví dụ `sieuluxury.github.io` (và custom domain nếu có).
3. Chỉ cấp quyền cho đúng tài khoản tài xế, không dùng chung tài khoản.

## 2. Gán custom claim `driver`

Chỉ chạy Admin SDK trong môi trường quản trị tin cậy. Không đặt service-account key, Admin credential hoặc private key trong repo/static site.

```js
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

initializeApp({ credential: applicationDefault() });

const uid = "FIREBASE_AUTH_UID_CUA_TAI_XE";
const auth = getAuth();
const user = await auth.getUser(uid);
await auth.setCustomUserClaims(uid, {
  ...(user.customClaims || {}),
  driver: true,
});
```

Sau khi cấp claim, đăng xuất và đăng nhập lại. `driver.js` cũng force-refresh ID token trước khi mở dữ liệu.

## 3. Bật App Check trước khi mở ghi công khai

1. Google Cloud Console → reCAPTCHA Enterprise → tạo **Website score-based key** cho domain production.
2. Firebase Console → App Check → đăng ký web app với reCAPTCHA Enterprise.
3. Dán site key public vào `firebase-security.js`:

```js
window.TRAM_FIREBASE_SECURITY = Object.freeze({
    appCheckSiteKey: "SITE_KEY_RECAPTCHA_ENTERPRISE",
});
```

4. Deploy client, theo dõi App Check metrics để chắc traffic thật đã có token hợp lệ.
5. Sau đó mới bật enforcement cho Cloud Firestore và Authentication trong Firebase Console.

Site key là public; không đưa secret key hoặc service-account credential vào file này.

## 4. Deploy Firestore Rules

```powershell
firebase deploy --only firestore:rules --project loi-nhan
```

Rules hiện tại bảo đảm:

- Chỉ tài khoản có `driver: true` và email đã xác minh mới đọc được `thankyou_messages`.
- Lời cảm ơn là immutable: tài xế chỉ đọc, không sửa hoặc xoá.
- Tài xế chỉ đổi trạng thái kiểm duyệt của lời nối chuyến; không sửa nội dung.
- Lời đã công khai có thể chuyển sang `rejected` để thu hồi, nhưng không thể bị client xoá.
- Mọi collection/path không khai báo đều bị từ chối.

## 5. Kiểm tra trước production

- Mở `driver.html` khi chưa đăng nhập: không được phát sinh read dữ liệu tin nhắn.
- Đăng nhập tài khoản không có claim: dashboard không được mở và Firestore phải trả `permission-denied`.
- Đăng nhập tài xế hợp lệ: chỉ đọc được inbox và đổi đúng trạng thái relay.
- Thử update/delete một `thankyou_messages`: phải bị từ chối.
- Thử gửi document thừa field, quá giới hạn ký tự hoặc timestamp giả: phải bị từ chối.
- Sau khi bật App Check enforcement, thử request từ client không có token: phải bị từ chối.

## Giới hạn còn lại

App Check giảm request giả mạo nhưng không phải rate limiter theo người/IP. Nếu hộp thư bị spam dù App Check đã enforcement, cần chuyển thao tác gửi sang Cloud Functions/Cloud Run và áp dụng rate limit phía server. Bộ lọc SĐT/email trong `app.js` chỉ là UX guard, không nên coi là bộ lọc PII tuyệt đối.