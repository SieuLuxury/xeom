const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const sourcePath = path.join(__dirname, "..", "checkin.js");
const source = `${fs.readFileSync(sourcePath, "utf8")}
globalThis.__checkin = { CHECKIN_STATE_KEYS, CHECKIN_PERIODS, getCheckinPeriod };`;
const context = vm.createContext({ Date });
vm.runInContext(source, context);

const { CHECKIN_STATE_KEYS, CHECKIN_PERIODS, getCheckinPeriod } = context.__checkin;

function at(hour, minute) {
    return new Date(2026, 6, 16, hour, minute, 0, 0);
}

test("chia đúng năm khung giờ tại các mốc biên", () => {
    const cases = [
        [4, 59, "lateNight"],
        [5, 0, "morning"],
        [10, 29, "morning"],
        [10, 30, "noon"],
        [13, 59, "noon"],
        [14, 0, "afternoon"],
        [18, 29, "afternoon"],
        [18, 30, "evening"],
        [22, 59, "evening"],
        [23, 0, "lateNight"],
    ];

    for (const [hour, minute, expected] of cases) {
        assert.equal(getCheckinPeriod(at(hour, minute)), expected);
    }
});

test("mỗi khung giờ có đủ bốn trạng thái và câu phản hồi", () => {
    const expectedLabels = ["hơi mệt", "bình thường", "đang vui", "hơi căng thẳng"];
    for (const [period, config] of Object.entries(CHECKIN_PERIODS)) {
        assert.ok(config.question.length > 0, `${period} thiếu câu hỏi`);
        assert.ok(config.prompt.length > 0, `${period} thiếu lời dẫn`);

        for (const state of CHECKIN_STATE_KEYS) {
            const option = config.options[state];
            assert.ok(option, `${period}/${state} chưa được cấu hình`);
            assert.ok(option.emoji.length > 0, `${period}/${state} thiếu emoji`);
            assert.ok(option.label.length <= 14, `${period}/${state} quá dài cho mobile`);
            assert.ok(option.responses.length >= 2, `${period}/${state} cần ít nhất hai câu phản hồi`);
            option.responses.forEach((response) => assert.ok(response.length >= 35));
        }
        assert.equal(CHECKIN_STATE_KEYS.map((state) => config.options[state].label).join("|"), expectedLabels.join("|"));
    }
});

test("câu phản hồi không hứa tài xế sẽ thay đổi chuyến đi", () => {
    const responses = Object.values(CHECKIN_PERIODS).flatMap((config) => (
        Object.values(config.options).flatMap((option) => option.responses)
    ));
    responses.forEach((response) => assert.doesNotMatch(response, /tài xế|mình sẽ chạy|chạy chậm/i));
});

test("nút chọn ngẫu nhiên thuộc khu lời nhắn, không nằm trong check-in", () => {
    const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
    const pickerStart = html.indexOf('<section class="message-picker"');
    const surpriseButton = html.indexOf('id="surpriseBtn"');
    const checkinEnd = html.indexOf('<div class="hero-visual');

    assert.ok(pickerStart > 0 && surpriseButton > pickerStart);
    assert.ok(surpriseButton > checkinEnd);
    assert.equal((html.match(/id="surpriseBtn"/g) || []).length, 1);
});
