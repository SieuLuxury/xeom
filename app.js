// Trạm Dịu Dàng — interactive scratch-card experience

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCOKO3ozY3osEiFHD3Y8E-zbwaewJfk2Vw",
    authDomain: "loi-nhan.firebaseapp.com",
    projectId: "loi-nhan",
    storageBucket: "loi-nhan.firebasestorage.app",
    messagingSenderId: "171700974856",
    appId: "1:171700974856:web:7016cf3aca9c8dd71968bd",
};

const STORAGE = {
    scratched: "tramdiudang_scratched_v2",
    legacyScratched: "xeom_scratched",
    saved: "tramdiudang_saved",
    mood: "tramdiudang_mood",
    theme: "tramdiudang_theme",
    pending: "tramdiudang_pending_thanks",
};

const CATEGORY_STYLES = {
    encouragement: { background: "#c8b9ff", from: "#7555f7", to: "#a990ff", sticker: "you got this!" },
    reminders: { background: "#baf18a", from: "#3bc894", to: "#9ee8ca", sticker: "easy does it ✦" },
    wishes: { background: "#ffadd0", from: "#ff5f9e", to: "#ffae84", sticker: "lucky energy ♡" },
    philosophy: { background: "#9ee4ff", from: "#50bce8", to: "#9685ff", sticker: "feel it all ✦" },
};

const MOOD_COPY = {
    tired: "Đã ghi nhận: hôm nay cần được ôm nhẹ 🫶",
    okay: "Một ngày bình yên cũng rất đáng quý 🌿",
    happy: "Giữ chiếc mood này thật lâu nhé ✨",
    chaos: "Không sao, mình gỡ từng nút một thôi 🫧",
};

const state = {
    currentCat: null,
    currentMsg: "",
    isRevealed: false,
    scratchPercent: 0,
    scratchPoints: [],
    coveredCells: new Set(),
    grid: null,
    mood: null,
    db: null,
    audio: null,
    breathingTimer: null,
    lastSendAt: 0,
};

const $ = (id) => document.getElementById(id);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.addEventListener("DOMContentLoaded", init);

function init() {
    initFirebase();
    migrateLegacyScratchData();
    initTheme();
    initMood();
    bindUI();
    renderCategories();
    updateProgress();
    renderSavedMessages();
    initParticles();
    loadStats();
    flushPendingThanks();
    $("homeTotal").textContent = getTotalMessages();
}

function initFirebase() {
    if (!window.firebase) return;
    try {
        if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
        state.db = firebase.firestore();
    } catch (error) {
        console.warn("Không thể khởi tạo Firebase:", error);
    }
}

function bindUI() {
    $("brandHome").addEventListener("click", (event) => { event.preventDefault(); goHome(); });
    $("backBtn").addEventListener("click", goHome);
    $("anotherBtn").addEventListener("click", goHome);
    $("surpriseBtn").addEventListener("click", openSurprise);
    $("shareBtn").addEventListener("click", shareMessage);
    $("saveBtn").addEventListener("click", toggleCurrentSaved);
    $("heartMessage").addEventListener("click", toggleCurrentSaved);
    $("revealAccessible").addEventListener("click", revealCard);
    $("btnSend").addEventListener("click", sendThankYou);
    $("themeToggle").addEventListener("click", toggleTheme);
    $("soundToggle").addEventListener("click", toggleSound);
    $("volumeSlider").addEventListener("input", updateVolume);
    $("savedToggle").addEventListener("click", openSavedDrawer);
    $("savedClose").addEventListener("click", closeSavedDrawer);
    $("drawerBackdrop").addEventListener("click", closeSavedDrawer);
    $("clearSaved").addEventListener("click", clearSavedMessages);
    $("breathingOrb").addEventListener("click", toggleBreathing);

    $("moodList").addEventListener("click", (event) => {
        const button = event.target.closest("button[data-mood]");
        if (button) selectMood(button.dataset.mood);
    });

    $("quickReplies").addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button) return;
        $("tyInput").value = button.textContent.trim();
        updateCharacterCount();
        $("tyInput").focus();
    });

    $("tyInput").addEventListener("input", updateCharacterCount);

    document.addEventListener("keydown", (event) => {
        if ($("savedDrawer").classList.contains("is-open") && event.key === "Tab") trapDrawerFocus(event);
        if (event.key === "Escape") {
            closeSavedDrawer();
            hideSoundPanel();
        }
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".sound-wrap")) hideSoundPanel();
    });

    window.addEventListener("resize", debounce(() => {
        if (!$("screenScratch").hidden && !state.isRevealed && state.currentCat) initScratchCanvas(state.currentCat, true);
    }, 180));
    window.addEventListener("online", flushPendingThanks);
}

// ---------- Home, mood and categories ----------

function initMood() {
    const savedMood = readStorage(STORAGE.mood, null);
    if (savedMood && MOOD_COPY[savedMood]) selectMood(savedMood, false);
}

function selectMood(mood, announce = true) {
    state.mood = mood;
    writeStorage(STORAGE.mood, mood);
    $("moodList").querySelectorAll("button").forEach((button) => {
        const selected = button.dataset.mood === mood;
        button.classList.toggle("is-selected", selected);
        button.setAttribute("aria-pressed", String(selected));
    });
    $("moodResponse").textContent = MOOD_COPY[mood];
    if (announce) showToast(MOOD_COPY[mood]);
}

function renderCategories() {
    const grid = $("catGrid");
    grid.replaceChildren();
    CATEGORIES.forEach((cat, index) => {
        const scratched = isCatScratched(cat.id);
        const style = CATEGORY_STYLES[cat.id] || CATEGORY_STYLES.encouragement;
        const button = document.createElement("button");
        button.type = "button";
        button.className = `cat-card${scratched ? " cat-done" : ""}`;
        button.style.setProperty("--cat-bg", style.background);
        button.setAttribute("aria-label", `${cat.label}: ${scratched ? "đã mở" : cat.desc}`);
        button.innerHTML = `
            <span class="cat-index"><span>0${index + 1}</span><span class="cat-status">${scratched ? "ĐÃ MỞ ✓" : "CHẠM ĐỂ CHỌN"}</span></span>
            <span class="cat-emoji" aria-hidden="true">${cat.emoji}</span>
            <span class="cat-label">${cat.label}</span>
            <span class="cat-desc">${scratched ? "Xem lại lời nhắn của bạn" : cat.desc}</span>
            <span class="cat-arrow" aria-hidden="true">↗</span>`;
        button.addEventListener("click", () => openCategory(cat));
        grid.appendChild(button);
    });
}

function openSurprise() {
    const moodMap = {
        tired: ["encouragement", "reminders"],
        okay: ["philosophy", "wishes"],
        happy: ["wishes", "philosophy"],
        chaos: ["reminders", "encouragement"],
    };
    const preferred = moodMap[state.mood] || CATEGORIES.map((cat) => cat.id);
    const unopened = CATEGORIES.filter((cat) => preferred.includes(cat.id) && !isCatScratched(cat.id));
    const fallback = CATEGORIES.filter((cat) => !isCatScratched(cat.id));
    const pool = unopened.length ? unopened : (fallback.length ? fallback : CATEGORIES);
    openCategory(pool[Math.floor(Math.random() * pool.length)]);
}

function openCategory(cat) {
    state.currentCat = cat;
    state.currentMsg = getSavedMessage(cat.id) || getRandomMessage(cat.id);
    state.isRevealed = false;
    state.scratchPercent = 0;
    state.scratchPoints = [];
    state.coveredCells = new Set();

    $("scratchIcon").textContent = cat.emoji;
    $("scratchName").textContent = cat.label;
    $("scratchText").textContent = state.currentMsg;
    $("scratchSticker").textContent = CATEGORY_STYLES[cat.id]?.sticker || "take it easy ✦";
    $("scratchLead").textContent = state.mood
        ? `Mình đã chọn lời nhắn hợp với mood ${getMoodEmoji(state.mood)} của bạn. Cào thật chậm để mở nhé.`
        : "Dùng ngón tay cào lớp màu để mở lời nhắn. Cứ từ từ thôi, điều tử tế không cần vội.";

    resetScratchUI();
    $("screenHome").hidden = true;
    $("screenHome").classList.remove("is-active");
    $("screenScratch").hidden = false;
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
    updateMiniProgress(cat.id);

    if (isCatScratched(cat.id)) {
        showPreviouslyRevealed();
    } else {
        requestAnimationFrame(() => initScratchCanvas(cat));
        recordView();
    }
}

function goHome() {
    stopBreathing();
    $("screenScratch").hidden = true;
    $("screenHome").hidden = false;
    $("screenHome").classList.add("is-active");
    renderCategories();
    updateProgress();
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
}

function resetScratchUI() {
    $("scratchCard").classList.remove("revealed");
    $("scratchCanvas").style.display = "";
    $("scratchCanvas").style.opacity = "1";
    $("scratchCanvas").style.transform = "";
    $("scratchCanvas").removeAttribute("aria-hidden");
    $("scratchMessage").setAttribute("aria-hidden", "true");
    $("heartMessage").hidden = true;
    $("scratchHint").hidden = false;
    $("scratchPercentText").textContent = "đã mở 0%";
    $("revealPanel").hidden = true;
    $("tySuccess").hidden = true;
    $("btnSend").hidden = false;
    $("btnSend").disabled = false;
    $("btnSend").innerHTML = "<span>gửi lời nhắn</span><i>→</i>";
    $("tyInput").value = "";
    updateCharacterCount();
    updateSavedControls();
}

function showPreviouslyRevealed() {
    state.isRevealed = true;
    $("scratchCanvas").style.display = "none";
    $("scratchCanvas").setAttribute("aria-hidden", "true");
    $("scratchHint").hidden = true;
    $("scratchMessage").removeAttribute("aria-hidden");
    $("heartMessage").hidden = false;
    $("scratchCard").classList.add("revealed");
    $("revealPanel").hidden = false;
    updateSavedControls();
}

function updateProgress() {
    const count = CATEGORIES.filter((cat) => isCatScratched(cat.id)).length;
    const percent = Math.round((count / CATEGORIES.length) * 100);
    $("progressOrbit").style.setProperty("--progress", percent);
    $("progressNumber").textContent = `${count}/${CATEGORIES.length}`;
    $("progressMessage").textContent = count === CATEGORIES.length
        ? "Bạn đã đi đủ 4 trạm hôm nay. Bộ sưu tập sẽ làm mới vào ngày mai — còn bây giờ, lưu lại lời bạn cần nhất nhé."
        : `Còn ${CATEGORIES.length - count} trạm nhỏ đang chờ. Mỗi vibe chỉ mở một lần trong hôm nay.`;
}

function updateMiniProgress(catId) {
    const index = Math.max(0, CATEGORIES.findIndex((cat) => cat.id === catId));
    $("miniProgressFill").style.width = `${((index + 1) / CATEGORIES.length) * 100}%`;
    $("miniProgressText").textContent = `vibe 0${index + 1} / 0${CATEGORIES.length}`;
}

// ---------- Scratch canvas ----------

function initScratchCanvas(cat, replay = false) {
    const oldCanvas = $("scratchCanvas");
    const canvas = oldCanvas.cloneNode(true);
    oldCanvas.replaceWith(canvas);

    const card = $("scratchCard");
    const rect = card.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawScratchSurface(ctx, rect.width, rect.height, cat);

    const cellSize = 17;
    state.grid = {
        cellSize,
        columns: Math.ceil(rect.width / cellSize),
        rows: Math.ceil(rect.height / cellSize),
        width: rect.width,
        height: rect.height,
    };
    state.coveredCells = new Set();

    if (replay && state.scratchPoints.length) {
        state.scratchPoints.forEach((point, index) => {
            eraseSegment(ctx, state.scratchPoints[index - 1] || point, point, false);
        });
        updateScratchProgress();
    }

    let drawing = false;
    let previous = null;

    canvas.addEventListener("pointerdown", (event) => {
        if (state.isRevealed) return;
        drawing = true;
        canvas.setPointerCapture?.(event.pointerId);
        previous = pointerPosition(event, canvas);
        eraseSegment(ctx, previous, previous);
    });

    canvas.addEventListener("pointermove", (event) => {
        if (!drawing || state.isRevealed) return;
        const current = pointerPosition(event, canvas);
        eraseSegment(ctx, previous, current);
        previous = current;
    });

    const finish = (event) => {
        if (!drawing) return;
        drawing = false;
        try { canvas.releasePointerCapture?.(event.pointerId); } catch (_) { /* already released */ }
        if (state.scratchPercent >= 41) revealCard();
    };
    canvas.addEventListener("pointerup", finish);
    canvas.addEventListener("pointercancel", finish);
    canvas.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            revealCard();
        }
    });
}

function drawScratchSurface(ctx, width, height, cat) {
    const style = CATEGORY_STYLES[cat.id] || CATEGORY_STYLES.encouragement;
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, style.from);
    gradient.addColorStop(1, style.to);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = .16;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    for (let x = -height; x < width + height; x += 22) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + height, height);
        ctx.stroke();
    }

    ctx.globalAlpha = .24;
    ctx.fillStyle = "#ffffff";
    for (let x = 24; x < width; x += 48) {
        for (let y = 22; y < height; y += 48) {
            ctx.beginPath();
            ctx.arc(x + ((y / 48) % 2) * 12, y, 2.4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,.96)";
    ctx.font = `700 ${Math.min(34, Math.max(25, width / 14))}px "Bricolage Grotesque", sans-serif`;
    ctx.fillText("cào nhẹ ở đây", width / 2, height / 2 - 9);
    ctx.font = "700 11px DM Sans, sans-serif";
    ctx.letterSpacing = "1px";
    ctx.fillStyle = "rgba(255,255,255,.72)";
    ctx.fillText("MỘT LỜI NHẮN ĐANG ĐỢI BẠN ✦", width / 2, height / 2 + 21);

    ctx.font = "24px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.72)";
    ctx.fillText("✦", width * .16, height * .22);
    ctx.fillText("♡", width * .84, height * .78);
    ctx.fillText("☻", width * .82, height * .2);
    ctx.fillText("↗", width * .18, height * .79);
}

function pointerPosition(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: Math.max(0, Math.min(rect.width, event.clientX - rect.left)),
        y: Math.max(0, Math.min(rect.height, event.clientY - rect.top)),
    };
}

function eraseSegment(ctx, from, to, remember = true) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 58;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();

    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.ceil(distance / 8));
    for (let i = 0; i <= steps; i += 1) {
        const point = {
            x: from.x + ((to.x - from.x) * i) / steps,
            y: from.y + ((to.y - from.y) * i) / steps,
        };
        markCoveredCells(point.x, point.y, 29);
        if (remember) state.scratchPoints.push(point);
    }
    updateScratchProgress();
}

function markCoveredCells(x, y, radius) {
    if (!state.grid) return;
    const { cellSize, columns, rows } = state.grid;
    const minCol = Math.max(0, Math.floor((x - radius) / cellSize));
    const maxCol = Math.min(columns - 1, Math.floor((x + radius) / cellSize));
    const minRow = Math.max(0, Math.floor((y - radius) / cellSize));
    const maxRow = Math.min(rows - 1, Math.floor((y + radius) / cellSize));
    for (let row = minRow; row <= maxRow; row += 1) {
        for (let col = minCol; col <= maxCol; col += 1) {
            const centerX = (col + .5) * cellSize;
            const centerY = (row + .5) * cellSize;
            if (Math.hypot(centerX - x, centerY - y) <= radius) state.coveredCells.add(`${col}:${row}`);
        }
    }
}

function updateScratchProgress() {
    if (!state.grid) return;
    const total = state.grid.columns * state.grid.rows;
    state.scratchPercent = Math.min(100, Math.round((state.coveredCells.size / total) * 100));
    $("scratchPercentText").textContent = `đã mở ${state.scratchPercent}%`;
    if (state.scratchPercent >= 41 && !state.isRevealed) revealCard();
}

function revealCard() {
    if (state.isRevealed || !state.currentCat) return;
    state.isRevealed = true;
    const canvas = $("scratchCanvas");
    const card = $("scratchCard");

    if (navigator.vibrate) navigator.vibrate([35, 25, 70]);
    canvas.style.opacity = "0";
    canvas.style.transform = "scale(1.04)";
    canvas.setAttribute("aria-hidden", "true");
    $("scratchMessage").removeAttribute("aria-hidden");
    $("heartMessage").hidden = false;
    card.classList.add("revealed");
    markCatScratched(state.currentCat.id, state.currentMsg);
    renderCategories();
    updateProgress();
    $("scratchHint").hidden = true;
    updateSavedControls();

    if (!reducedMotion.matches) {
        launchFlash();
        launchEmojiBurst(card);
        setTimeout(launchConfetti, 160);
    }

    setTimeout(() => {
        canvas.style.display = "none";
        $("revealPanel").hidden = false;
        $("scratchMessage").focus({ preventScroll: true });
    }, reducedMotion.matches ? 0 : 480);
}

// ---------- Saved messages ----------

function getSavedMessages() {
    const value = readStorage(STORAGE.saved, []);
    return Array.isArray(value) ? value : [];
}

function toggleCurrentSaved() {
    if (!state.currentMsg || !state.currentCat) return;
    const saved = getSavedMessages();
    const index = saved.findIndex((item) => item.message === state.currentMsg);
    if (index >= 0) {
        saved.splice(index, 1);
        showToast("Đã bỏ khỏi túi lời nhắn");
    } else {
        saved.unshift({
            message: state.currentMsg,
            category: state.currentCat.id,
            label: state.currentCat.label,
            emoji: state.currentCat.emoji,
            savedAt: Date.now(),
        });
        showToast("Đã cất lời nhắn vào túi ♡");
    }
    writeStorage(STORAGE.saved, saved.slice(0, 30));
    updateSavedControls();
    renderSavedMessages();
}

function isCurrentSaved() {
    return getSavedMessages().some((item) => item.message === state.currentMsg);
}

function updateSavedControls() {
    const saved = isCurrentSaved();
    [$("heartMessage"), $("saveBtn")].forEach((button) => {
        button.classList.toggle("is-saved", saved);
        button.setAttribute("aria-pressed", String(saved));
    });
    $("heartMessage").textContent = saved ? "♥" : "♡";
    $("saveBtn").innerHTML = `<span>${saved ? "♥" : "♡"}</span> ${saved ? "đã lưu" : "lưu lại"}`;
}

function renderSavedMessages() {
    const saved = getSavedMessages();
    $("savedCount").textContent = saved.length;
    const list = $("savedList");
    list.replaceChildren();
    $("clearSaved").hidden = saved.length === 0;

    if (!saved.length) {
        const empty = document.createElement("div");
        empty.className = "saved-empty";
        empty.innerHTML = "<span>♡</span>Chưa có lời nhắn nào trong túi.<br>Gặp câu nào chạm đúng tim thì lưu lại nhé.";
        list.appendChild(empty);
        return;
    }

    saved.forEach((item) => {
        const card = document.createElement("article");
        card.className = "saved-item";
        const head = document.createElement("div");
        head.className = "saved-item-head";
        const label = document.createElement("span");
        label.textContent = `${item.emoji || "✦"} ${item.label || "Lời nhắn"}`;
        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "xoá";
        remove.setAttribute("aria-label", `Xoá lời nhắn ${item.label || "đã lưu"}`);
        remove.addEventListener("click", () => removeSavedMessage(item.message));
        const message = document.createElement("p");
        message.textContent = item.message;
        head.append(label, remove);
        card.append(head, message);
        list.appendChild(card);
    });
}

function removeSavedMessage(message) {
    writeStorage(STORAGE.saved, getSavedMessages().filter((item) => item.message !== message));
    renderSavedMessages();
    updateSavedControls();
}

function clearSavedMessages() {
    writeStorage(STORAGE.saved, []);
    renderSavedMessages();
    updateSavedControls();
    showToast("Đã dọn trống túi lời nhắn");
}

function openSavedDrawer() {
    renderSavedMessages();
    $("drawerBackdrop").hidden = false;
    $("savedDrawer").classList.add("is-open");
    $("savedDrawer").inert = false;
    $("savedToggle").setAttribute("aria-expanded", "true");
    document.querySelector(".topbar").inert = true;
    $("app").inert = true;
    document.body.style.overflow = "hidden";
    setTimeout(() => $("savedClose").focus(), 100);
}

function closeSavedDrawer() {
    if (!$("savedDrawer").classList.contains("is-open")) return;
    $("savedDrawer").classList.remove("is-open");
    $("savedDrawer").inert = true;
    $("savedToggle").setAttribute("aria-expanded", "false");
    document.querySelector(".topbar").inert = false;
    $("app").inert = false;
    $("drawerBackdrop").hidden = true;
    document.body.style.overflow = "";
    $("savedToggle").focus({ preventScroll: true });
}

function trapDrawerFocus(event) {
    const focusable = [...$("savedDrawer").querySelectorAll("button:not([hidden]), [href], input, textarea, [tabindex]:not([tabindex='-1'])")]
        .filter((element) => !element.disabled);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

function hideSoundPanel() {
    $("soundPanel").hidden = true;
    $("soundToggle").setAttribute("aria-expanded", "false");
}

// ---------- Theme and procedural ambient music ----------

function initTheme() {
    const saved = readStorage(STORAGE.theme, null);
    const theme = saved || (new Date().getHours() >= 20 || new Date().getHours() < 6 ? "night" : "day");
    applyTheme(theme);
}

function toggleTheme() {
    applyTheme(document.body.dataset.theme === "night" ? "day" : "night");
}

function applyTheme(theme) {
    document.body.dataset.theme = theme;
    writeStorage(STORAGE.theme, theme);
    $("themeToggle").textContent = theme === "night" ? "☀" : "☾";
    $("themeToggle").setAttribute("aria-label", theme === "night" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối");
    document.querySelector('meta[name="theme-color"]').content = theme === "night" ? "#121019" : "#f4f0ff";
}

async function toggleSound(event) {
    event.stopPropagation();
    $("soundPanel").hidden = false;
    $("soundToggle").setAttribute("aria-expanded", "true");
    if (state.audio?.playing) stopAmbientMusic();
    else await startAmbientMusic();
}

async function startAmbientMusic() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
        showToast("Thiết bị này chưa hỗ trợ soft ride radio");
        return;
    }
    try {
        const context = new AudioContext();
        await context.resume();
        const master = context.createGain();
        const compressor = context.createDynamicsCompressor();
        const convolver = context.createConvolver();
        convolver.buffer = createReverbImpulse(context, 2.5, 2.4);
        master.gain.value = getVolumeGain();
        master.connect(compressor);
        convolver.connect(master);
        compressor.connect(context.destination);

        state.audio = { context, master, compressor, convolver, playing: true, chordIndex: 0, timer: null };
        scheduleAmbientChord();
        state.audio.timer = window.setInterval(scheduleAmbientChord, 6200);
        $("soundToggle").classList.add("is-playing");
        $("soundToggle").setAttribute("aria-pressed", "true");
        $("soundToggle").setAttribute("aria-label", "Tắt nhạc nhẹ");
        showToast("Soft ride radio đang phát ♫");
    } catch (error) {
        console.warn("Không thể phát nhạc:", error);
        showToast("Chạm lại để bật nhạc nhé");
    }
}

function scheduleAmbientChord() {
    const audio = state.audio;
    if (!audio?.playing) return;
    const chords = [
        [220.00, 261.63, 329.63],
        [196.00, 246.94, 293.66],
        [174.61, 220.00, 261.63],
        [196.00, 246.94, 329.63],
    ];
    const chord = chords[audio.chordIndex % chords.length];
    const now = audio.context.currentTime;

    chord.forEach((frequency, index) => {
        const oscillator = audio.context.createOscillator();
        const gain = audio.context.createGain();
        const filter = audio.context.createBiquadFilter();
        oscillator.type = index === 0 ? "sine" : "triangle";
        oscillator.frequency.value = frequency;
        oscillator.detune.value = index * 2 - 2;
        filter.type = "lowpass";
        filter.frequency.value = 920 + index * 130;
        gain.gain.setValueAtTime(.0001, now);
        gain.gain.exponentialRampToValueAtTime(index === 0 ? .17 : .075, now + 1.5);
        gain.gain.setValueAtTime(index === 0 ? .17 : .075, now + 4.2);
        gain.gain.exponentialRampToValueAtTime(.0001, now + 6.5);
        oscillator.connect(filter);
        filter.connect(gain);
        gain.connect(audio.master);
        gain.connect(audio.convolver);
        oscillator.start(now);
        oscillator.stop(now + 6.6);
    });

    if (audio.chordIndex % 2 === 0) scheduleSoftChime(chord[1] * 2, now + 2.7);
    audio.chordIndex += 1;
}

function scheduleSoftChime(frequency, when) {
    const audio = state.audio;
    if (!audio?.playing) return;
    const oscillator = audio.context.createOscillator();
    const gain = audio.context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.0001, when);
    gain.gain.exponentialRampToValueAtTime(.04, when + .08);
    gain.gain.exponentialRampToValueAtTime(.0001, when + 2.1);
    oscillator.connect(gain);
    gain.connect(audio.master);
    oscillator.start(when);
    oscillator.stop(when + 2.2);
}

function createReverbImpulse(context, seconds, decay) {
    const length = Math.floor(context.sampleRate * seconds);
    const impulse = context.createBuffer(2, length, context.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
        const data = impulse.getChannelData(channel);
        for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
    return impulse;
}

function stopAmbientMusic() {
    const audio = state.audio;
    if (!audio) return;
    audio.playing = false;
    window.clearInterval(audio.timer);
    const now = audio.context.currentTime;
    audio.master.gain.cancelScheduledValues(now);
    audio.master.gain.setValueAtTime(Math.max(.0001, audio.master.gain.value), now);
    audio.master.gain.exponentialRampToValueAtTime(.0001, now + .35);
    setTimeout(() => audio.context.close(), 450);
    state.audio = null;
    $("soundToggle").classList.remove("is-playing");
    $("soundToggle").setAttribute("aria-pressed", "false");
    $("soundToggle").setAttribute("aria-label", "Bật nhạc nhẹ");
}

function updateVolume() {
    if (!state.audio) return;
    state.audio.master.gain.setTargetAtTime(getVolumeGain(), state.audio.context.currentTime, .08);
}

function getVolumeGain() {
    return Math.max(.0001, (Number($("volumeSlider").value) / 100) * .28);
}

// ---------- Share, thanks and breathing ----------

async function shareMessage() {
    if (!state.currentMsg || !state.currentCat) return;
    const text = `${state.currentCat.emoji} “${state.currentMsg}”\n\n— Trạm Dịu Dàng, từ tài xế của bạn 🏍️`;
    try {
        if (navigator.share) await navigator.share({ title: "Một lời nhắn dành cho bạn", text });
        else await copyText(text);
    } catch (error) {
        if (error?.name !== "AbortError") await copyText(text);
    }
}

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (_) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
    }
    showToast("Đã sao chép lời nhắn ✦");
}

function updateCharacterCount() {
    $("tyCount").textContent = `${$("tyInput").value.length}/200`;
}

async function sendThankYou() {
    const text = $("tyInput").value.trim();
    if (!text) {
        showToast("Viết một chút gì đó cho tài xế nhé ✍️");
        $("tyInput").focus();
        return;
    }
    if (containsSensitiveInfo(text)) {
        showToast("Đừng để số điện thoại hoặc email trong lời nhắn nhé 🔒");
        $("tyInput").focus();
        return;
    }
    if (Date.now() - state.lastSendAt < 15000) {
        showToast("Lời nhắn vừa được gửi rồi nhé 💛");
        return;
    }

    const payload = {
        text,
        category: state.currentCat?.id || "unknown",
        categoryEmoji: state.currentCat?.emoji || "💛",
        messageShown: state.currentMsg,
        mood: state.mood || "unknown",
        moodEmoji: getMoodEmoji(state.mood),
    };

    const button = $("btnSend");
    button.disabled = true;
    button.innerHTML = "<span>đang gửi...</span><i>•••</i>";

    try {
        if (!state.db || !navigator.onLine) throw new Error("offline");
        await writeThankYou(payload);
        completeThankYou("Đã gửi tới tài xế rồi. Cảm ơn bạn đã tử tế! 💛");
    } catch (error) {
        queuePendingThank(payload);
        completeThankYou("Mạng đang chập chờn nên lời nhắn đã được giữ trên máy và sẽ tự gửi lại khi có kết nối. 💛");
    }
}

async function writeThankYou(payload) {
    await state.db.collection("thankyou_messages").add({
        text: String(payload.text || "").slice(0, 200),
        category: String(payload.category || "unknown"),
        categoryEmoji: String(payload.categoryEmoji || "💛").slice(0, 8),
        messageShown: String(payload.messageShown || "").slice(0, 500),
        mood: String(payload.mood || "unknown"),
        moodEmoji: String(payload.moodEmoji || "😊").slice(0, 8),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    await state.db.collection("stats").doc("global").set({
        totalThanks: firebase.firestore.FieldValue.increment(1),
    }, { merge: true });
}

function completeThankYou(message) {
    state.lastSendAt = Date.now();
    $("btnSend").hidden = true;
    $("tySuccess").textContent = message;
    $("tySuccess").hidden = false;
    showToast("Tử tế đã được gửi đi ♡");
}

function queuePendingThank(payload) {
    const pending = readStorage(STORAGE.pending, []);
    pending.push({ ...payload, queuedAt: Date.now() });
    writeStorage(STORAGE.pending, pending.slice(-20));
}

async function flushPendingThanks() {
    if (!state.db || !navigator.onLine) return;
    const pending = readStorage(STORAGE.pending, []);
    if (!Array.isArray(pending) || !pending.length) return;
    const remaining = [];
    for (const item of pending) {
        try { await writeThankYou(item); }
        catch (_) { remaining.push(item); }
    }
    writeStorage(STORAGE.pending, remaining);
}

function toggleBreathing() {
    if (state.breathingTimer) stopBreathing();
    else startBreathing();
}

function startBreathing() {
    const orb = $("breathingOrb");
    const start = Date.now();
    const duration = 30000;
    orb.classList.add("is-breathing");
    orb.setAttribute("aria-label", "Dừng bài tập thở");

    const tick = () => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
        const phase = elapsed % 8000;
        $("breathingText").textContent = phase < 4000 ? "hít vào..." : "thở ra...";
        $("breathingTime").textContent = `00:${String(remaining).padStart(2, "0")}`;
        $("breathingHint").textContent = phase < 4000 ? "Hít chậm bằng mũi." : "Thả lỏng vai và thở ra.";
        if (elapsed >= duration) {
            stopBreathing(true);
            showToast("Bạn vừa dành 30 giây cho chính mình 🫧");
        }
    };
    tick();
    state.breathingTimer = window.setInterval(tick, 200);
}

function stopBreathing(completed = false) {
    if (state.breathingTimer) window.clearInterval(state.breathingTimer);
    state.breathingTimer = null;
    $("breathingOrb")?.classList.remove("is-breathing");
    if ($("breathingOrb")) $("breathingOrb").setAttribute("aria-label", "Bắt đầu bài tập thở 30 giây");
    if ($("breathingText")) $("breathingText").textContent = completed ? "xong rồi ♡" : "bắt đầu";
    if ($("breathingTime")) $("breathingTime").textContent = "00:30";
    if ($("breathingHint")) $("breathingHint").textContent = completed ? "Nhẹ hơn một chút rồi nhé." : "Chạm vào vòng tròn và thở theo nhịp.";
}

// ---------- Stats, storage and effects ----------

async function loadStats() {
    if (!state.db) return;
    try {
        const doc = await state.db.collection("stats").doc("global").get();
        if (doc.exists) $("homeViews").textContent = formatCompactNumber(doc.data().totalViews || 0);
    } catch (_) { /* Stats are decorative; keep the local fallback. */ }
}

async function recordView() {
    if (!state.db) return;
    try {
        await state.db.collection("stats").doc("global").set({
            totalViews: firebase.firestore.FieldValue.increment(1),
        }, { merge: true });
        const current = Number(String($("homeViews").textContent).replace(/\D/g, "")) || 0;
        $("homeViews").textContent = formatCompactNumber(current + 1);
    } catch (_) { /* Do not block the experience for analytics. */ }
}

function getScratchData() {
    const data = readStorage(STORAGE.scratched, {});
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
}

function markCatScratched(catId, message) {
    const data = getScratchData();
    data[catId] = { message, date: localDateKey(), time: Date.now() };
    writeStorage(STORAGE.scratched, data);
}

function isCatScratched(catId) {
    const item = getScratchData()[catId];
    return Boolean(item && (item.date === localDateKey() || (!item.date && isTimestampToday(item.time))));
}

function getSavedMessage(catId) {
    const item = getScratchData()[catId];
    return isCatScratched(catId) ? (item.message || item.msg || null) : null;
}

function migrateLegacyScratchData() {
    if (localStorage.getItem(STORAGE.scratched)) return;
    const legacy = readStorage(STORAGE.legacyScratched, {});
    const migrated = {};
    Object.entries(legacy || {}).forEach(([id, value]) => {
        if (value && isTimestampToday(value.time)) migrated[id] = { message: value.msg, date: localDateKey(), time: value.time };
    });
    writeStorage(STORAGE.scratched, migrated);
}

function initParticles() {
    if (reducedMotion.matches) return;
    const container = $("particles");
    const glyphs = ["✦", "♡", "☻", "★", "↗", "~"];
    for (let i = 0; i < 10; i += 1) {
        const particle = document.createElement("span");
        particle.className = "particle";
        particle.textContent = glyphs[i % glyphs.length];
        particle.style.left = `${4 + Math.random() * 92}%`;
        particle.style.top = `${40 + Math.random() * 80}%`;
        particle.style.setProperty("--duration", `${18 + Math.random() * 15}s`);
        particle.style.setProperty("--delay", `${-Math.random() * 20}s`);
        particle.style.setProperty("--drift", `${-70 + Math.random() * 140}px`);
        container.appendChild(particle);
    }
}

function launchFlash() {
    const flash = document.createElement("div");
    flash.className = "reveal-flash";
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 700);
}

function launchEmojiBurst(origin) {
    const rect = origin.getBoundingClientRect();
    const glyphs = ["💛", "✦", "★", "♡", "☻", "🌸", "✨", "💫"];
    for (let i = 0; i < 10; i += 1) {
        const item = document.createElement("span");
        item.className = "emoji-burst";
        item.textContent = glyphs[i % glyphs.length];
        item.style.left = `${rect.left + rect.width / 2}px`;
        item.style.top = `${rect.top + rect.height / 2}px`;
        item.style.setProperty("--ex", `${(Math.random() - .5) * 330}px`);
        item.style.setProperty("--ey", `${-70 - Math.random() * 210}px`);
        item.style.setProperty("--er", `${-90 + Math.random() * 180}deg`);
        document.body.appendChild(item);
        setTimeout(() => item.remove(), 1700);
    }
}

function launchConfetti() {
    const container = $("confetti");
    container.replaceChildren();
    const colors = ["#7453ff", "#ff68a8", "#c9f56a", "#ffe45e", "#8ddcff", "#ffffff"];
    for (let i = 0; i < 62; i += 1) {
        const piece = document.createElement("i");
        piece.className = "confetti-piece";
        const size = 5 + Math.random() * 8;
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.width = `${size}px`;
        piece.style.height = `${size * (Math.random() > .5 ? 1.8 : 1)}px`;
        piece.style.borderRadius = Math.random() > .7 ? "50%" : "2px";
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.setProperty("--sway", `${-80 + Math.random() * 160}px`);
        piece.style.setProperty("--fall-time", `${2.1 + Math.random() * 2.2}s`);
        piece.style.animationDelay = `${Math.random() * .55}s`;
        container.appendChild(piece);
    }
    setTimeout(() => container.replaceChildren(), 5200);
}

let toastTimer;
function showToast(message) {
    window.clearTimeout(toastTimer);
    $("toastText").textContent = message;
    $("toast").classList.add("show");
    toastTimer = window.setTimeout(() => $("toast").classList.remove("show"), 2600);
}

function getMoodEmoji(mood) {
    return { tired: "🥹", okay: "😌", happy: "😎", chaos: "🤯" }[mood] || "😊";
}

function containsSensitiveInfo(text) {
    const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
    const phone = /(?:\+?84|0)(?:[\s.-]*\d){8,10}\b/;
    return email.test(text) || phone.test(text);
}

function localDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function isTimestampToday(timestamp) {
    return Number.isFinite(Number(timestamp)) && localDateKey(new Date(Number(timestamp))) === localDateKey();
}

function readStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
    } catch (_) { return fallback; }
}

function writeStorage(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (_) { /* Private mode or full storage: keep the in-session experience working. */ }
}

function formatCompactNumber(value) {
    try { return new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(value); }
    catch (_) { return String(value); }
}

function debounce(fn, delay) {
    let timer;
    return (...args) => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => fn(...args), delay);
    };
}
