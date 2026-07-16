const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const html = read("driver.html");
const driver = read("driver.js");
const app = read("app.js");
const rules = read("firestore.rules");

test("Driver Inbox không chứa inline application script và có CSP", () => {
    assert.doesNotMatch(html, /<script>\s*const FIREBASE_CONFIG/);
    assert.match(html, /Content-Security-Policy/);
    assert.match(html, /script-src 'self'/);
    assert.match(html, /<script src="driver\.js"><\/script>/);
});

test("phiên Auth dùng SESSION trước khi lắng nghe auth state", () => {
    const persistence = driver.indexOf("Auth.Persistence.SESSION");
    const observer = driver.indexOf("onAuthStateChanged(handleAuthState)");
    assert.ok(persistence > 0);
    assert.ok(observer > persistence);
});

test("App Check được khởi tạo trước Firestore trên trang khách và tài xế", () => {
    const appProvider = app.indexOf("ReCaptchaEnterpriseProvider");
    const appFirestore = app.indexOf("firebase.firestore()");
    assert.ok(appProvider > 0 && appFirestore > appProvider);

    const driverInitCall = driver.indexOf("initAppCheck();");
    const driverFirestore = driver.indexOf("state.db = firebase.firestore()");
    assert.ok(driverInitCall > 0 && driverFirestore > driverInitCall);
    assert.match(driver, /function initAppCheck\(\)[\s\S]*ReCaptchaEnterpriseProvider/);
    assert.match(html, /firebase-app-check-compat\.js/);
    assert.match(read("index.html"), /firebase-app-check-compat\.js/);
});

test("mọi DOM id mà driver.js dùng đều tồn tại", () => {
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
    const references = new Set([...driver.matchAll(/\$\("([A-Za-z0-9_-]+)"\)/g)].map((match) => match[1]));
    const missing = [...references].filter((id) => !ids.has(id));
    assert.deepEqual(missing, []);
});

test("Rules giữ lời cảm ơn immutable và chỉ tài xế email verified được đọc", () => {
    assert.match(rules, /request\.auth\.token\.driver == true/);
    assert.match(rules, /request\.auth\.token\.email_verified == true/);
    assert.match(rules, /match \/thankyou_messages\/\{messageId\}[\s\S]*allow read: if isDriver\(\);[\s\S]*allow update, delete: if false;/);
});

test("lời nối chuyến chỉ đổi trạng thái và lời đã duyệt có thể thu hồi", () => {
    assert.match(rules, /affectedKeys\(\)[\s\S]*hasOnly\(\['status', 'reviewedAt'\]\)/);
    assert.match(rules, /resource\.data\.status == 'approved'[\s\S]*request\.resource\.data\.status == 'rejected'/);
    assert.match(rules, /match \/relay_messages\/\{messageId\}[\s\S]*allow delete: if false;/);
});

test("hộp thư không đưa nhãn cảm xúc của khách vào bộ lọc", () => {
    assert.doesNotMatch(html, /Hơi đuối|Cũng ổn|Đang vui|Chaos|tâm trạng/i);
    assert.doesNotMatch(driver, /activeFilter|data-filter="tired"|MOODS/);
    assert.match(html, /data-date-filter="today"/);
});