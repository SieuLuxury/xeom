const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCOKO3ozY3osEiFHD3Y8E-zbwaewJfk2Vw",
    authDomain: "loi-nhan.firebaseapp.com",
    projectId: "loi-nhan",
    storageBucket: "loi-nhan.firebasestorage.app",
    messagingSenderId: "171700974856",
    appId: "1:171700974856:web:7016cf3aca9c8dd71968bd",
};

const FIREBASE_APP_CHECK_SITE_KEY = String(window.TRAM_FIREBASE_SECURITY?.appCheckSiteKey || "").trim();
const MAX_INBOX_MESSAGES = 100;
const MAX_PUBLISHED_RELAY_MESSAGES = 20;
const LOCAL_DRIVER_URL = "http://127.0.0.1:8765/driver.html";
const state = {
    db: null,
    auth: null,
    messages: [],
    relayMessages: [],
    publishedRelayMessages: [],
    dateFilter: "all",
    search: "",
    unsubscribers: [],
    appCheckMode: "checking",
};
const $ = (id) => document.getElementById(id);

initTheme();
bindUI();
void initInbox();

function initTheme() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem("tramdiudang_theme")); } catch (_) { /* use default */ }
    const hour = new Date().getHours();
    applyTheme(saved || (hour >= 20 || hour < 6 ? "night" : "day"));
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("tramdiudang_theme", JSON.stringify(theme)); } catch (_) { /* optional */ }
    $("toolTheme").textContent = theme === "night" ? "☀" : "☾";
    $("toolTheme").setAttribute("aria-label", theme === "night" ? "Chuyển giao diện sáng" : "Chuyển giao diện tối");
    document.querySelector('meta[name="theme-color"]').content = theme === "night" ? "#121019" : "#f8f6ff";
}

function bindUI() {
    $("toolTheme").addEventListener("click", () => applyTheme(document.documentElement.dataset.theme === "night" ? "day" : "night"));
    $("syncBtn").addEventListener("click", syncNow);
    $("signInBtn").addEventListener("click", signInDriver);
    $("signOutBtn").addEventListener("click", signOutDriver);
    $("dateFilterRow").addEventListener("click", (event) => {
        const button = event.target.closest("button[data-date-filter]");
        if (!button) return;
        state.dateFilter = button.dataset.dateFilter;
        $("dateFilterRow").querySelectorAll("button").forEach((item) => {
            const active = item === button;
            item.classList.toggle("is-active", active);
            item.setAttribute("aria-pressed", String(active));
        });
        renderMessages();
    });
    $("searchInput").addEventListener("input", (event) => {
        state.search = event.target.value.trim().toLocaleLowerCase("vi");
        renderMessages();
    });
}

async function initInbox() {
    if (window.location.protocol === "file:") {
        showLocalServerRequired();
        return;
    }
    try {
        if (!window.firebase) throw new Error("Firebase SDK chưa tải được");
        if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
        initAppCheck();

        state.auth = firebase.auth();
        state.auth.useDeviceLanguage();
        await state.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
        state.db = firebase.firestore();
        state.auth.onAuthStateChanged(handleAuthState);
    } catch (error) {
        console.error("Không thể khởi tạo Driver Inbox:", error);
        showAuthMessage(
            "Không thể mở phiên bảo mật.",
            "Trình duyệt chưa cho phép tạo phiên đăng nhập riêng. Hãy tải lại trang hoặc thử một trình duyệt khác.",
            true,
        );
    }
}

function initAppCheck() {
    if (!FIREBASE_APP_CHECK_SITE_KEY) {
        state.appCheckMode = "warning";
        updateAppCheckStatus();
        return;
    }
    try {
        if (typeof firebase.appCheck !== "function") throw new Error("Firebase App Check SDK chưa tải được");
        firebase.appCheck().activate(
            new firebase.appCheck.ReCaptchaEnterpriseProvider(FIREBASE_APP_CHECK_SITE_KEY),
            true,
        );
        state.appCheckMode = "ready";
    } catch (error) {
        state.appCheckMode = "error";
        console.error("Không thể khởi tạo App Check:", error);
    }
    updateAppCheckStatus();
}

function updateAppCheckStatus() {
    const box = $("appCheckStatus");
    const text = $("appCheckText");
    if (!box || !text) return;
    box.classList.remove("is-ready", "is-warning", "is-error");
    if (state.appCheckMode === "ready") {
        box.classList.add("is-ready");
        text.textContent = "App Check client đã bật; chỉ bật enforcement sau khi kiểm tra metrics.";
    } else if (state.appCheckMode === "error") {
        box.classList.add("is-error");
        text.textContent = "App Check khởi tạo lỗi. Chưa nên dùng hộp thư ở production.";
    } else {
        box.classList.add("is-warning");
        text.textContent = "App Check chưa có site key. Chưa nên bật enforcement ở Firebase.";
    }
}

async function handleAuthState(user) {
    stopSubscriptions();
    if (!user) {
        $("authGate").hidden = false;
        $("driverDashboard").hidden = true;
        $("signOutBtn").hidden = true;
        $("syncBtn").hidden = true;
        showAuthMessage(
            "Mở hộp thư của bạn.",
            "Đăng nhập bằng tài khoản Google đã được cấp quyền tài xế. Tin nhắn chỉ được tải sau khi quyền được xác minh.",
            true,
        );
        return;
    }

    try {
        const token = await user.getIdTokenResult(true);
        const hasDriverClaim = token.claims.driver === true;
        const hasVerifiedEmail = token.claims.email_verified === true && user.emailVerified === true;
        if (!hasDriverClaim || !hasVerifiedEmail) {
            $("authGate").hidden = false;
            $("driverDashboard").hidden = true;
            $("signOutBtn").hidden = false;
            $("syncBtn").hidden = true;
            showAuthMessage(
                "Tài khoản chưa có quyền mở hộp thư.",
                hasDriverClaim
                    ? "Email của tài khoản này chưa được xác minh. Hãy xác minh email rồi đăng nhập lại."
                    : "Tài khoản này chưa được quản trị viên cấp quyền tài xế. Hãy đổi sang đúng tài khoản đã được phê duyệt.",
                false,
            );
            return;
        }

        renderDriverAccount(user);
        updateAppCheckStatus();
        $("authGate").hidden = true;
        $("driverDashboard").hidden = false;
        $("signOutBtn").hidden = false;
        $("syncBtn").hidden = false;
        restartSubscriptions();
    } catch (error) {
        console.error("Không thể xác minh quyền tài xế:", error);
        showAuthMessage(
            "Chưa xác minh được quyền.",
            "Phiên đăng nhập có thể đã hết hạn hoặc mạng đang gián đoạn. Hãy đăng xuất rồi thử lại.",
            false,
        );
    }
}

function renderDriverAccount(user) {
    const displayName = String(user.displayName || "Tài xế").trim().slice(0, 80) || "Tài xế";
    const email = String(user.email || "Tài khoản Google đã xác minh").trim().slice(0, 120);
    const initials = displayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(-2)
        .map((part) => part[0]?.toLocaleUpperCase("vi") || "")
        .join("") || "TX";
    $("driverName").textContent = displayName;
    $("driverEmail").textContent = email;
    $("driverAvatar").textContent = initials.slice(0, 2);
}

function showLocalServerRequired() {
    showAuthMessage(
        "Trang đang được mở sai cách.",
        "Google không cho phép đăng nhập từ địa chỉ file://. Bấm nút bên dưới để mở lại hộp thư qua localhost an toàn.",
        true,
    );
    $("signInBtn").firstElementChild.textContent = "mở trang đăng nhập đúng";
    $("authFootnote").textContent = "Local server dùng cổng 8765; không có tin nhắn nào được tải ở trang file:// này.";
    $("signInBtn").setAttribute("aria-label", "Mở Driver Inbox qua localhost để đăng nhập Google");
}
async function signInDriver() {
    if (window.location.protocol === "file:") {
        window.location.assign(LOCAL_DRIVER_URL);
        return;
    }
    if (!state.auth) return showToast("Dịch vụ đăng nhập chưa sẵn sàng — hãy tải lại trang");
    const button = $("signInBtn");
    button.disabled = true;
    try {
        if (state.auth.currentUser) await state.auth.signOut();
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        await state.auth.signInWithPopup(provider);
    } catch (error) {
        if (error.code !== "auth/popup-closed-by-user") {
            console.warn("Đăng nhập Driver Inbox thất bại:", error.code);
            showAuthMessage("Đăng nhập chưa thành công.", friendlyAuthError(error), true);
        }
    } finally {
        button.disabled = false;
    }
}

async function signOutDriver() {
    if (state.auth) await state.auth.signOut();
    showToast("Đã đăng xuất khỏi hộp thư");
}

function showAuthMessage(title, copy, canSignIn) {
    $("authTitle").textContent = title;
    $("authCopy").textContent = copy;
    $("signInBtn").hidden = !canSignIn && !state.auth?.currentUser;
    $("signInBtn").firstElementChild.textContent = state.auth?.currentUser
        ? "đổi tài khoản Google"
        : "đăng nhập với Google";
}

function friendlyAuthError(error) {
    if (error.code === "auth/operation-not-allowed") return "Google Sign-In chưa được bật trong Firebase Authentication.";
    if (error.code === "auth/unauthorized-domain") return "Domain này chưa nằm trong danh sách Authorized domains của Firebase.";
    if (error.code === "auth/network-request-failed") return "Mạng đang chập chờn. Hãy thử lại sau.";
    if (error.code === "auth/popup-blocked") return "Trình duyệt đã chặn cửa sổ đăng nhập. Hãy cho phép popup rồi thử lại.";
    return "Không thể hoàn tất đăng nhập. Hãy thử lại bằng tài khoản tài xế.";
}

function restartSubscriptions() {
    stopSubscriptions();
    setConnectionState("connecting", "đang kết nối realtime");
    subscribeStats();
    subscribeMessages();
    subscribeRelayMessages();
    subscribePublishedRelayMessages();
}

function subscribeStats() {
    const unsubscribe = state.db.collection("stats").doc("global").onSnapshot((doc) => {
        const data = doc.exists ? doc.data() : {};
        $("statViews").textContent = compactNumber(safeNumber(data.totalViews));
        $("statThanks").textContent = compactNumber(safeNumber(data.totalThanks));
    }, (error) => {
        console.warn("Không tải được thống kê:", error.code);
        $("statViews").textContent = "—";
        $("statThanks").textContent = "—";
    });
    state.unsubscribers.push(unsubscribe);
}

function subscribeMessages() {
    const unsubscribe = state.db.collection("thankyou_messages")
        .orderBy("createdAt", "desc")
        .limit(MAX_INBOX_MESSAGES)
        .onSnapshot((snapshot) => {
            state.messages = snapshot.docs.map((doc) => normalizeMessage(doc.id, doc.data()));
            $("messageList").setAttribute("aria-busy", "false");
            setConnectionState("live", "đã kết nối realtime");
            markSyncedNow();
            updateTodayCount();
            renderMessages();
        }, (error) => {
            console.error("Không tải được thankyou_messages:", error.code);
            setConnectionState("offline", "mất kết nối");
            showInboxError(error);
        });
    state.unsubscribers.push(unsubscribe);
}

function subscribeRelayMessages() {
    const unsubscribe = state.db.collection("relay_messages")
        .where("status", "==", "pending")
        .limit(100)
        .onSnapshot((snapshot) => {
            state.relayMessages = snapshot.docs
                .map((doc) => normalizeRelayMessage(doc.id, doc.data()))
                .sort(sortNewestFirst);
            $("relayReviewList").setAttribute("aria-busy", "false");
            $("statRelayPending").textContent = compactNumber(state.relayMessages.length);
            renderRelayMessages();
        }, (error) => {
            console.error("Không tải được relay_messages pending:", error.code);
            $("statRelayPending").textContent = "—";
            showRelayError(error);
        });
    state.unsubscribers.push(unsubscribe);
}

function subscribePublishedRelayMessages() {
    const unsubscribe = state.db.collection("relay_messages")
        .where("status", "==", "approved")
        .limit(MAX_PUBLISHED_RELAY_MESSAGES)
        .onSnapshot((snapshot) => {
            state.publishedRelayMessages = snapshot.docs
                .map((doc) => normalizeRelayMessage(doc.id, doc.data()))
                .sort(sortNewestFirst);
            renderPublishedRelayMessages();
        }, (error) => {
            console.error("Không tải được relay_messages approved:", error.code);
            $("publishedRelayCount").textContent = "—";
            $("publishedRelayList").replaceChildren(createInlineState("Chưa tải được danh sách đã công khai."));
        });
    state.unsubscribers.push(unsubscribe);
}

function stopSubscriptions() {
    state.unsubscribers.forEach((unsubscribe) => {
        try { unsubscribe(); } catch (_) { /* already stopped */ }
    });
    state.unsubscribers = [];
    state.messages = [];
    state.relayMessages = [];
    state.publishedRelayMessages = [];
}

function normalizeMessage(id, raw) {
    return {
        id,
        text: typeof raw.text === "string" ? raw.text.trim().slice(0, 200) : "",
        context: typeof raw.messageShown === "string" ? raw.messageShown.trim().slice(0, 120) : "",
        createdAt: toDate(raw.createdAt),
    };
}

function normalizeRelayMessage(id, raw) {
    return {
        id,
        text: typeof raw.text === "string" ? raw.text.trim().slice(0, 140) : "",
        moment: typeof raw.moment === "string" ? raw.moment : "daytime",
        createdAt: toDate(raw.createdAt),
        reviewedAt: toDate(raw.reviewedAt),
    };
}

function toDate(value) {
    try { return value && typeof value.toDate === "function" ? value.toDate() : null; }
    catch (_) { return null; }
}

function sortNewestFirst(a, b) {
    return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
}

function renderMessages() {
    const list = $("messageList");
    const filtered = state.messages.filter(matchesDateFilter).filter((message) => {
        if (!state.search) return true;
        return message.text.toLocaleLowerCase("vi").includes(state.search)
            || message.context.toLocaleLowerCase("vi").includes(state.search);
    });
    $("resultCount").textContent = `${filtered.length} lời nhắn`;
    list.replaceChildren();

    if (!filtered.length) {
        const hasFilter = state.search || state.dateFilter !== "all";
        list.appendChild(createStateBox(
            hasFilter ? "⌕" : "📭",
            hasFilter ? "Không tìm thấy lời nhắn" : "Hộp thư đang yên tĩnh",
            hasFilter ? "Thử bỏ bộ lọc hoặc dùng một từ khoá khác." : "Lời cảm ơn mới sẽ tự xuất hiện ở đây.",
        ));
        return;
    }

    filtered.forEach((message, index) => list.appendChild(createMessageCard(message, index)));
}

function matchesDateFilter(message) {
    if (state.dateFilter === "all") return true;
    if (!(message.createdAt instanceof Date)) return false;
    const now = new Date();
    if (state.dateFilter === "today") {
        return message.createdAt.toDateString() === now.toDateString();
    }
    if (state.dateFilter === "week") {
        return message.createdAt.getTime() >= now.getTime() - (7 * 24 * 60 * 60 * 1000);
    }
    return true;
}

function createMessageCard(message, index) {
    const card = document.createElement("article");
    card.className = "msg-card";
    card.style.setProperty("--mood-color", "#7453ff");
    card.style.animationDelay = `${Math.min(index * 35, 280)}ms`;

    const header = document.createElement("div");
    header.className = "msg-header";
    const sourcePill = document.createElement("div");
    sourcePill.className = "msg-mood";
    const emoji = document.createElement("span");
    emoji.textContent = "♡";
    const label = document.createElement("span");
    label.textContent = "lời từ hành khách";
    sourcePill.append(emoji, label);

    const meta = document.createElement("div");
    meta.className = "msg-meta";
    const time = document.createElement("time");
    time.className = "msg-time";
    time.textContent = formatTime(message.createdAt);
    if (message.createdAt) {
        time.dateTime = message.createdAt.toISOString();
        time.title = formatFullTime(message.createdAt);
    }
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "copy-message";
    copy.textContent = "sao chép";
    copy.setAttribute("aria-label", "Sao chép lời nhắn của hành khách");
    copy.addEventListener("click", () => copyMessage(message.text, copy));
    meta.append(time, copy);
    header.append(sourcePill, meta);

    const text = document.createElement("p");
    text.className = "msg-text";
    text.textContent = message.text || "Một lời cảm ơn không có nội dung.";
    card.append(header, text);

    if (message.context) {
        const context = document.createElement("div");
        context.className = "msg-context";
        const strong = document.createElement("strong");
        strong.textContent = "Thẻ hành khách đã mở: ";
        const value = document.createElement("span");
        value.textContent = `“${message.context}${message.context.length >= 120 ? "…" : ""}”`;
        context.append(strong, value);
        card.appendChild(context);
    }
    return card;
}

async function copyMessage(text, button) {
    if (!text) return showToast("Lời nhắn này đang trống");
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            const area = document.createElement("textarea");
            area.value = text;
            area.setAttribute("readonly", "");
            area.className = "clipboard-fallback";
            document.body.appendChild(area);
            area.select();
            const copied = document.execCommand("copy");
            area.remove();
            if (!copied) throw new Error("copy command failed");
        }
        const original = button.textContent;
        button.textContent = "đã chép ✓";
        window.setTimeout(() => { button.textContent = original; }, 1400);
        showToast("Đã sao chép lời nhắn");
    } catch (_) {
        showToast("Trình duyệt chưa cho phép sao chép");
    }
}

function renderRelayMessages() {
    const list = $("relayReviewList");
    list.replaceChildren();
    if (!state.relayMessages.length) {
        list.appendChild(createStateBox(
            "🛵",
            "Không còn lời nào chờ duyệt",
            "Lời nối chuyến mới sẽ xuất hiện ở đây trước khi được công khai.",
        ));
        return;
    }
    state.relayMessages.forEach((message, index) => list.appendChild(createRelayReviewCard(message, index)));
}

function createRelayReviewCard(message, index) {
    const momentLabels = { early: "chuyến sớm", daytime: "giữa ngày", commute: "tan tầm", late: "chuyến khuya" };
    const card = document.createElement("article");
    card.className = "msg-card relay-review-card";
    card.style.setProperty("--mood-color", "#50bce8");
    card.style.animationDelay = `${Math.min(index * 35, 280)}ms`;

    const header = document.createElement("div");
    header.className = "msg-header";
    const pill = document.createElement("div");
    pill.className = "msg-mood";
    const icon = document.createElement("span");
    icon.textContent = "🛵";
    const label = document.createElement("span");
    label.textContent = momentLabels[message.moment] || "nối chuyến";
    pill.append(icon, label);
    const time = document.createElement("time");
    time.className = "msg-time";
    time.textContent = formatTime(message.createdAt);
    if (message.createdAt) time.dateTime = message.createdAt.toISOString();
    header.append(pill, time);

    const text = document.createElement("p");
    text.className = "msg-text";
    text.textContent = message.text || "Lời nhắn trống.";

    const actions = document.createElement("div");
    actions.className = "relay-review-actions";
    const approve = document.createElement("button");
    approve.type = "button";
    approve.className = "approve-relay";
    approve.textContent = "duyệt & công khai";
    const reject = document.createElement("button");
    reject.type = "button";
    reject.className = "reject-relay";
    reject.textContent = "ẩn lời này";
    approve.addEventListener("click", () => confirmRelayApproval(message.id, approve, reject));
    reject.addEventListener("click", () => reviewRelayMessage(message.id, "rejected", [approve, reject]));
    actions.append(approve, reject);
    card.append(header, text, actions);
    return card;
}

function confirmRelayApproval(id, approve, reject) {
    if (approve.dataset.confirmed === "true") {
        void reviewRelayMessage(id, "approved", [approve, reject]);
        return;
    }
    approve.dataset.confirmed = "true";
    approve.textContent = "bấm lại để công khai";
    approve.classList.add("needs-confirmation");
    showToast("Kiểm tra nội dung rồi bấm lại để công khai");
    window.setTimeout(() => {
        if (!approve.isConnected || approve.disabled) return;
        approve.dataset.confirmed = "false";
        approve.textContent = "duyệt & công khai";
        approve.classList.remove("needs-confirmation");
    }, 5000);
}

function renderPublishedRelayMessages() {
    const list = $("publishedRelayList");
    $("publishedRelayCount").textContent = state.publishedRelayMessages.length >= MAX_PUBLISHED_RELAY_MESSAGES
        ? `${MAX_PUBLISHED_RELAY_MESSAGES}+`
        : String(state.publishedRelayMessages.length);
    list.replaceChildren();
    if (!state.publishedRelayMessages.length) {
        list.appendChild(createInlineState("Chưa có lời nối chuyến nào đang công khai."));
        return;
    }
    state.publishedRelayMessages.forEach((message) => list.appendChild(createPublishedRelayCard(message)));
}

function createPublishedRelayCard(message) {
    const item = document.createElement("article");
    item.className = "published-relay-item";
    const copy = document.createElement("div");
    const text = document.createElement("p");
    text.textContent = message.text || "Lời nhắn trống.";
    const time = document.createElement("small");
    time.textContent = message.reviewedAt
        ? `công khai ${formatTime(message.reviewedAt)}`
        : `gửi ${formatTime(message.createdAt)}`;
    copy.append(text, time);
    const hide = document.createElement("button");
    hide.type = "button";
    hide.textContent = "ẩn khỏi trang khách";
    hide.addEventListener("click", () => reviewRelayMessage(message.id, "rejected", [hide]));
    item.append(copy, hide);
    return item;
}

async function reviewRelayMessage(id, status, buttons) {
    buttons.forEach((button) => { button.disabled = true; });
    try {
        await state.db.collection("relay_messages").doc(id).update({
            status,
            reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        showToast(status === "approved" ? "Đã công khai lời nối chuyến ✦" : "Đã ẩn lời nhắn");
    } catch (error) {
        console.error("Không cập nhật được trạng thái relay:", error.code);
        buttons.forEach((button) => { button.disabled = false; });
        showToast(error.code === "permission-denied" ? "Phiên này không có quyền kiểm duyệt" : "Chưa cập nhật được, thử lại nhé");
    }
}

function showInboxError(error) {
    const detail = error.code === "permission-denied"
        ? "Phiên đăng nhập không còn quyền đọc. Hãy đăng xuất rồi đăng nhập lại."
        : "Không kết nối được Firestore. Kiểm tra mạng rồi thử đồng bộ lại.";
    showErrorState($("messageList"), "Chưa mở được hộp thư", detail, restartSubscriptions);
}

function showRelayError(error) {
    const detail = error.code === "permission-denied"
        ? "Phiên đăng nhập không còn quyền kiểm duyệt."
        : "Không tải được hàng chờ kiểm duyệt.";
    showErrorState($("relayReviewList"), "Chưa mở được hàng chờ", detail, restartSubscriptions);
}

function showErrorState(target, titleText, detailText, retry) {
    target.setAttribute("aria-busy", "false");
    target.replaceChildren();
    const box = createStateBox("🛠️", titleText, detailText, "error-state");
    if (retry) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "state-action";
        button.textContent = "thử kết nối lại";
        button.addEventListener("click", retry);
        box.appendChild(button);
    }
    target.appendChild(box);
}

function createStateBox(iconText, titleText, copyText, className = "empty-state") {
    const box = document.createElement("div");
    box.className = className;
    const icon = document.createElement("span");
    icon.className = "state-icon";
    icon.textContent = iconText;
    const title = document.createElement("p");
    title.className = "state-title";
    title.textContent = titleText;
    const copy = document.createElement("p");
    copy.className = "state-copy";
    copy.textContent = copyText;
    box.append(icon, title, copy);
    return box;
}

function createInlineState(text) {
    const item = document.createElement("p");
    item.className = "published-empty";
    item.textContent = text;
    return item;
}

async function syncNow() {
    if (!state.db || !state.auth?.currentUser) return showToast("Hộp thư chưa kết nối");
    $("syncBtn").disabled = true;
    try {
        await Promise.all([
            state.db.collection("thankyou_messages").orderBy("createdAt", "desc").limit(1).get(),
            state.db.collection("relay_messages").where("status", "==", "pending").limit(1).get(),
            state.db.collection("relay_messages").where("status", "==", "approved").limit(1).get(),
        ]);
        markSyncedNow();
        showToast("Hộp thư đã được đồng bộ ✦");
    } catch (error) {
        console.warn("Đồng bộ thủ công thất bại:", error.code);
        showToast("Chưa thể đồng bộ, kiểm tra mạng rồi thử lại");
    } finally {
        $("syncBtn").disabled = false;
    }
}

function setConnectionState(mode, text) {
    const pill = $("connectionPill");
    pill.classList.remove("is-connecting", "is-live", "is-offline");
    pill.classList.add(`is-${mode}`);
    $("connectionText").textContent = text;
}

function markSyncedNow() {
    $("lastSyncText").textContent = `đồng bộ lúc ${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
}

function updateTodayCount() {
    const today = new Date().toDateString();
    const count = state.messages.filter((message) => message.createdAt?.toDateString() === today).length;
    $("statToday").textContent = compactNumber(count);
}

function formatTime(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "vừa xong";
    const diff = Math.max(0, Date.now() - date.getTime());
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "vừa xong";
    if (mins < 60) return `${mins} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN");
}

function formatFullTime(date) {
    return date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function compactNumber(value) {
    try { return new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(value); }
    catch (_) { return String(value); }
}

function safeNumber(value) {
    return Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : 0;
}

let toastTimer;
function showToast(message) {
    clearTimeout(toastTimer);
    $("toolToast").textContent = message;
    $("toolToast").classList.add("show");
    toastTimer = setTimeout(() => $("toolToast").classList.remove("show"), 2600);
}