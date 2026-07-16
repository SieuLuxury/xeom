const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function createClassList() {
    const values = new Set();
    return {
        add: (...names) => names.forEach((name) => values.add(name)),
        remove: (...names) => names.forEach((name) => values.delete(name)),
        toggle: (name, force) => {
            if (force === true) values.add(name);
            else if (force === false) values.delete(name);
            else if (values.has(name)) values.delete(name);
            else values.add(name);
        },
        contains: (name) => values.has(name),
    };
}

function createButton(value) {
    const emoji = { textContent: "" };
    const label = { textContent: "" };
    return {
        dataset: { checkin: value },
        classList: createClassList(),
        attributes: {},
        querySelector: (selector) => (selector === "span" ? label : emoji),
        setAttribute(name, content) { this.attributes[name] = content; },
        emoji,
        label,
    };
}

function createRuntime() {
    const buttons = ["low", "steady", "bright", "overwhelmed"].map(createButton);
    const elements = {
        checkinLabel: { textContent: "" },
        checkinPrompt: { textContent: "" },
        checkinResponse: { textContent: "" },
        checkinChoice: { hidden: false },
        checkinResult: { hidden: true },
        checkinPanel: { dataset: {} },
        checkinSelectedEmoji: { textContent: "" },
        checkinSelectedLabel: { textContent: "" },
        checkinList: {
            attributes: {},
            setAttribute(name, content) { this.attributes[name] = content; },
            querySelectorAll: () => buttons,
            querySelector: () => buttons[0],
        },
    };
    const session = new Map();
    const context = vm.createContext({
        console,
        navigator: {},
        window: { matchMedia: () => ({ matches: false }) },
        document: {
            addEventListener: () => {},
            getElementById: (id) => elements[id],
        },
        localStorage: { getItem: () => null, setItem: () => {} },
        sessionStorage: {
            getItem: (key) => session.get(key) ?? null,
            setItem: (key, value) => session.set(key, value),
            removeItem: (key) => session.delete(key),
        },
    });
    const checkinSource = fs.readFileSync(path.join(__dirname, "..", "checkin.js"), "utf8");
    const appSource = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
    vm.runInContext(checkinSource, context);
    vm.runInContext(`${appSource}
globalThis.__app = { state, renderCheckin, selectCheckin, refreshCheckinPeriod, STORAGE };`, context);
    return { ...context.__app, buttons, elements, session };
}

test("UI chỉ giữ một lựa chọn và hiện đúng phản hồi của khung giờ", () => {
    const runtime = createRuntime();
    runtime.renderCheckin(new Date(2026, 6, 16, 19, 0));

    assert.equal(runtime.elements.checkinLabel.textContent, "Hôm nay để lại trong bạn cảm giác gì?");
    assert.deepEqual(runtime.buttons.map((button) => button.label.textContent), [
        "hơi mệt", "bình thường", "đang vui", "hơi căng thẳng",
    ]);

    runtime.selectCheckin("low");
    assert.equal(runtime.buttons.filter((button) => button.classList.contains("is-selected")).length, 1);
    assert.equal(runtime.buttons[0].attributes["aria-pressed"], "true");
    assert.equal(runtime.elements.checkinChoice.hidden, true);
    assert.equal(runtime.elements.checkinResult.hidden, false);
    assert.equal(runtime.elements.checkinSelectedLabel.textContent, "hơi mệt");
    assert.ok(runtime.elements.checkinResponse.textContent.length > 35);
    assert.ok(runtime.session.has(runtime.STORAGE.checkin));

    runtime.selectCheckin("bright");
    assert.equal(runtime.buttons.filter((button) => button.classList.contains("is-selected")).length, 1);
    assert.ok(runtime.buttons[0].classList.contains("is-selected"), "không thể đổi trực tiếp sau khi đã chọn");
});

test("đổi khung giờ sẽ xóa lựa chọn cũ của chuyến", () => {
    const runtime = createRuntime();
    runtime.renderCheckin(new Date(2026, 6, 16, 18, 45));
    runtime.selectCheckin("steady");
    runtime.refreshCheckinPeriod(new Date(2026, 6, 16, 23, 0));

    assert.equal(runtime.state.checkin, null);
    assert.equal(runtime.state.checkinPeriod, "lateNight");
    assert.equal(runtime.elements.checkinLabel.textContent, "Giờ này, bạn cảm thấy thế nào?");
    assert.equal(runtime.buttons.some((button) => button.classList.contains("is-selected")), false);
    assert.equal(runtime.session.has(runtime.STORAGE.checkin), false);
});
