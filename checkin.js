// Check-in theo nhịp hiện tại, độc lập với kho lời nhắn bên dưới.

const CHECKIN_STATE_KEYS = ["low", "steady", "bright", "overwhelmed"];

const CHECKIN_PERIODS = {
    morning: {
        question: "Sáng nay bạn cảm thấy thế nào?",
        prompt: "Không cần đoán cả ngày sẽ ra sao.",
        options: {
            low: {
                emoji: "🥹",
                label: "hơi mệt",
                responses: [
                    "Buổi sáng chưa có nhiều năng lượng cũng không sao. Có mặt để bắt đầu đã là một điểm cộng rồi ☀️",
                    "Bạn không cần tỉnh táo và xuất sắc ngay từ phút đầu tiên. Cứ bắt đầu từ từ thôi.",
                ],
            },
            steady: {
                emoji: "😌",
                label: "bình thường",
                responses: [
                    "Một khởi đầu không vội cũng có nét đẹp riêng. Cứ giữ nhịp vừa vặn này nhé 🌿",
                    "Sáng nay đang trôi khá êm. Mong những điều tiếp theo cũng nhẹ nhàng như thế.",
                ],
            },
            bright: {
                emoji: "😊",
                label: "đang vui",
                responses: [
                    "Nguồn năng lượng này đã được xác nhận: chính hãng và rất hợp với bạn ✨",
                    "Một cú bật năng lượng đẹp đấy. Mong hôm nay có chỗ cho bạn tỏa sáng.",
                ],
            },
            overwhelmed: {
                emoji: "😟",
                label: "hơi căng thẳng",
                responses: [
                    "Ngày mới mà suy nghĩ đã hơi nhiều nhỉ? Chưa cần xử lý tất cả cùng lúc đâu.",
                    "Trong đầu đang có nhiều việc chen nhau. Chọn một việc gần nhất cũng đã là bắt đầu rồi.",
                ],
            },
        },
    },
    noon: {
        question: "Đến lúc này, bạn cảm thấy thế nào?",
        prompt: "Dừng một chút để nghe mình.",
        options: {
            low: {
                emoji: "🥹",
                label: "hơi mệt",
                responses: [
                    "Bạn đã đi được gần nửa ngày rồi. Hơi mệt một chút không làm những cố gắng ấy nhỏ đi 🫶",
                    "Bạn đã dùng nhiều năng lượng cả buổi rồi. Đừng quên ghi nhận quãng mình vừa đi.",
                ],
            },
            steady: {
                emoji: "😌",
                label: "bình thường",
                responses: [
                    "Không quá nhanh, không quá chậm — một chiếc nhịp khá vừa vặn cho hôm nay 🌿",
                    "Có vẻ mọi thứ đang tìm được nhịp riêng. Mong phần còn lại tiếp tục dễ chịu.",
                ],
            },
            bright: {
                emoji: "😊",
                label: "đang vui",
                responses: [
                    "Năng lượng giữa ngày vẫn còn sáng đẹp. Nhớ dành một phần cho điều làm bạn vui nhé ✨",
                    "Đến giờ này vẫn còn phong độ — hôm nay bạn đang phát sóng năng lượng tốt đấy.",
                ],
            },
            overwhelmed: {
                emoji: "😟",
                label: "hơi căng thẳng",
                responses: [
                    "Mọi thứ đang chen nhau hơi nhiều. Chọn một việc gần nhất thôi cũng là tiến triển.",
                    "Không cần giải quyết cả buổi chiều trong một phút. Một việc, một nhịp, rồi tiếp.",
                ],
            },
        },
    },
    afternoon: {
        question: "Chiều nay, bạn cảm thấy thế nào?",
        prompt: "Không cần trả lời cho đẹp.",
        options: {
            low: {
                emoji: "🥹",
                label: "hơi mệt",
                responses: [
                    "Đi đến đây đã là một kiểu cố gắng. Phần còn lại, cứ nhẹ với mình một chút nhé 🫶",
                    "Hơi mệt không có nghĩa hôm nay của bạn kém đi. Bạn đã mang nó đi khá xa rồi.",
                ],
            },
            steady: {
                emoji: "😌",
                label: "bình thường",
                responses: [
                    "Một buổi chiều không cao trào nhưng vừa vặn — đôi khi thế là đủ đẹp rồi 🌿",
                    "“Cũng ổn” là một nơi khá dễ chịu để đứng. Không cần biến nó thành điều gì lớn hơn.",
                ],
            },
            bright: {
                emoji: "😊",
                label: "đang vui",
                responses: [
                    "Niềm vui này hợp với bạn đấy. Mong nó theo bạn thêm vài đoạn đường ✨",
                    "Một chiếc ngày đang có điểm sáng. Cứ tận hưởng trước khi vội giải thích vì sao.",
                ],
            },
            overwhelmed: {
                emoji: "😟",
                label: "hơi căng thẳng",
                responses: [
                    "Một ngày nhiều chuyện không có nghĩa bạn đã xử lý nó chưa đủ tốt.",
                    "Đầu hơi đông khách rồi nhỉ? Những việc chưa xong vẫn có quyền xếp hàng.",
                ],
            },
        },
    },
    evening: {
        question: "Hôm nay để lại trong bạn cảm giác gì?",
        prompt: "Không cần tổng kết cho thật hoàn hảo.",
        options: {
            low: {
                emoji: "🥹",
                label: "hơi mệt",
                responses: [
                    "Bạn đã mang ngày hôm nay đi đến tận đây rồi. Giờ có thể đặt xuống một chút 🫶",
                    "Tặng bạn một vé miễn phải mạnh mẽ thêm tối nay. Hôm nay đến đây là đáng ghi nhận rồi.",
                ],
            },
            steady: {
                emoji: "😌",
                label: "bình thường",
                responses: [
                    "Ngày đang hạ giọng, và bạn cũng có thể như thế. Một nhịp yên yên rất đáng quý 🌿",
                    "Không phải buổi tối nào cũng cần đặc biệt. Dễ chịu và bình thường đã là món quà.",
                ],
            },
            bright: {
                emoji: "😊",
                label: "đang vui",
                responses: [
                    "Ngày hôm nay có vẻ đã để lại một chút lấp lánh. Mong bạn giữ được phần đẹp nhất ✨",
                    "Một ngày khá vui đã được đóng dấu. Hy vọng dư âm tốt còn ở lại lâu thêm.",
                ],
            },
            overwhelmed: {
                emoji: "😟",
                label: "hơi căng thẳng",
                responses: [
                    "Chưa gỡ hết cũng không sao. Một ngày có thể kết thúc trước khi mọi câu hỏi có đáp án.",
                    "Những nút rối còn lại không cần theo bạn đi khắp buổi tối. Để mai nhìn tiếp cũng được.",
                ],
            },
        },
    },
    lateNight: {
        question: "Giờ này, bạn cảm thấy thế nào?",
        prompt: "Chọn điều gần với bạn nhất lúc này.",
        options: {
            low: {
                emoji: "🥹",
                label: "hơi mệt",
                responses: [
                    "Bạn đã làm đủ phần của mình rồi. Không cần mang thêm cố gắng vào phần còn lại của đêm 🌙",
                    "Hết năng lượng là lời nhắc cần nghỉ, không phải một lời chê trách. Khi có thể, cho mình một khoảng nghỉ nhé.",
                ],
            },
            steady: {
                emoji: "😌",
                label: "bình thường",
                responses: [
                    "Một chút yên vào giờ này là thứ đáng được giữ thật khẽ 🌙",
                    "Không cần thêm cao trào nữa. Mong đoạn còn lại chỉ có những điều mềm và nhẹ.",
                ],
            },
            bright: {
                emoji: "😊",
                label: "đang vui",
                responses: [
                    "Niềm vui còn thức cùng bạn à? Mong nó theo bạn thêm một đoạn thật êm.",
                    "Ngày đã muộn mà lòng vẫn sáng — một món quà nhỏ đẹp đấy ✨",
                ],
            },
            overwhelmed: {
                emoji: "😟",
                label: "hơi căng thẳng",
                responses: [
                    "Đầu óc vẫn còn căng cũng dễ hiểu. Những chuyện chưa xong có thể đợi một lúc sáng hơn.",
                    "Trong đầu đang lặp lại hơi nhiều chuyện. Tối nay chưa cần giải quyết hết đâu 🌙",
                ],
            },
        },
    },
};

function getCheckinPeriod(date = new Date()) {
    const minutes = date.getHours() * 60 + date.getMinutes();
    if (minutes >= 300 && minutes < 630) return "morning";
    if (minutes >= 630 && minutes < 840) return "noon";
    if (minutes >= 840 && minutes < 1110) return "afternoon";
    if (minutes >= 1110 && minutes < 1380) return "evening";
    return "lateNight";
}
