// Trạm Dịu Dàng — lời nhắn mang giọng của một người tài xế vừa chở bạn.

const CATEGORIES = [
    {
        id: "encouragement",
        emoji: "💪",
        label: "Động viên",
        desc: "Một câu cho đoạn đường khó",
        color: "#f0a500",
        gradient: "linear-gradient(135deg, #f0a500, #ffd700)",
        scratchColor: "#f0a500",
    },
    {
        id: "reminders",
        emoji: "🌿",
        label: "Nhắc nhẹ",
        desc: "Chậm lại trước khi đi tiếp",
        color: "#7ecfb3",
        gradient: "linear-gradient(135deg, #7ecfb3, #4ecdc4)",
        scratchColor: "#4ecdc4",
    },
    {
        id: "wishes",
        emoji: "⭐",
        label: "Lời chúc",
        desc: "Gửi theo bạn đến nơi",
        color: "#ff6b8a",
        gradient: "linear-gradient(135deg, #ff6b8a, #ff8e9e)",
        scratchColor: "#ff6b8a",
    },
    {
        id: "philosophy",
        emoji: "🌸",
        label: "Suy ngẫm",
        desc: "Nhìn đường, rồi nhìn lòng",
        color: "#b8a9c9",
        gradient: "linear-gradient(135deg, #b8a9c9, #d4a5ff)",
        scratchColor: "#9b8bb4",
    },
];

const MESSAGES = {
    encouragement: [
        "Mong chuyện khiến bạn im lặng suốt chuyến đi rồi cũng nhẹ xuống.",
        "Bạn không cần phải vui ngay đâu. Cứ về đến nơi an toàn trước đã.",
        "Nếu hôm nay là một đoạn đường xấu, cứ đi chậm. Chậm vẫn là đang đi.",
        "Mình không biết bạn vừa trải qua chuyện gì, nhưng cảm ơn bạn vì vẫn bước tiếp đến chuyến xe này.",
        "Có những hôm chỉ cần lên xe, ngồi yên và thở hết một quãng đường cũng đã là cố gắng rồi.",
        "Đừng vội trách mình vì chưa ổn. Xe cũng cần giảm ga khi đường nhiều ổ gà.",
        "Chuyện khó chưa chắc kết thúc ở ngã rẽ này. Mong đoạn tới có thêm một lối sáng cho bạn.",
        "Nếu lòng đang nặng, cứ để chuyến xe chở giúp một đoạn. Bạn không phải ôm mọi thứ cùng lúc.",
        "Bạn đã đến được đây rồi. Phần đường còn lại, mình mong bạn đi bằng nhịp vừa sức.",
        "Không sao nếu hôm nay bạn chỉ làm được điều tối thiểu. Miễn là bạn vẫn giữ mình an toàn.",
        "Mong tiếng xe ngoài đường đủ lớn để át bớt những lời làm bạn nghi ngờ chính mình.",
        "Một cú rẽ sai không quyết định cả hành trình. Mình vẫn có thể tìm đường khác.",
        "Nếu bạn đang bắt đầu lại, cứ coi đây là một điểm đón mới — không phải quay về số không.",
        "Có thể mình chỉ chở bạn một quãng ngắn, nhưng mình thật lòng mong chuyện của bạn rồi sẽ có lối ra.",
        "Bạn không cần chứng minh mình ổn với ai trên chuyến xe này. Cứ ngồi yên và là bạn thôi.",
    ],
    reminders: [
        "Trước khi xuống xe, thử kiểm tra điện thoại, ví và một nhịp thở của mình nhé.",
        "Hôm nay đường hơi đông, nhưng mong lòng bạn đừng quá vội.",
        "Nếu vai đang gồng từ đầu chuyến, thử thả lỏng một chút. Mình sắp đến nơi rồi.",
        "Bạn không cần trả lời mọi tin nhắn ngay khi vừa xuống xe. Cho mình vài phút chuyển nhịp cũng được.",
        "Nếu thấy mệt, hãy chọn cách chăm sóc cơ thể phù hợp với bạn — không cần theo một con số cứng nhắc nào.",
        "Trước khi bước tiếp, nhìn quanh cho chắc. Bình an quan trọng hơn vài phút vội vàng.",
        "Có chuyện chưa giải quyết được trên chuyến xe này thì để dành lúc đầu óc bớt ồn cũng không sao.",
        "Nếu bụng đang đói hoặc người đang mệt, mong bạn lắng nghe cơ thể và chăm mình theo điều bạn thật sự cần.",
        "Đến nơi rồi cũng đừng bật dậy quá nhanh. Một nhịp chậm đôi khi giúp mình nhớ mình đang ở đâu.",
        "Bạn có thể tắt bớt tiếng ồn sau chuyến đi — kể cả tiếng ồn từ kỳ vọng của người khác.",
        "Nếu trời đang nắng, mưa hoặc gió lớn, cứ ưu tiên một chỗ trú an toàn trước mọi lịch trình.",
        "Không phải cuộc gọi nào cũng cần bắt máy ngay. Bạn được quyền chọn lúc mình sẵn sàng.",
        "Trước chặng tiếp theo, thử hỏi: điều gì là cần thiết nhất với mình ngay lúc này?",
        "Nếu hôm nay đã đi quá nhiều nơi, mong điểm dừng sắp tới cho bạn được ngồi xuống thật sự.",
        "Nhớ mang theo đồ của bạn; còn điều không thuộc về mình, có thể để lại sau lưng chuyến xe.",
    ],
    wishes: [
        "Cảm ơn bạn vì đã bước lên chuyến xe này. Chúc đoạn đường tiếp theo dịu hơn.",
        "Mong nơi bạn sắp đến cho bạn cảm giác được thở ra, không phải tiếp tục gồng lên.",
        "Chúc lần mở cửa tiếp theo của bạn dẫn vào một nơi an toàn và dễ chịu.",
        "Mong sau tiếng máy xe là một khoảng yên vừa đủ đang chờ bạn.",
        "Chúc chuyện bạn đang mong có tín hiệu xanh vào đúng lúc.",
        "Mong người bạn sắp gặp nói với bạn bằng sự tử tế mà hôm nay bạn cần.",
        "Chúc đôi chân vừa chạm đất cũng thấy lòng mình bớt chông chênh.",
        "Mong chặng tới ít xóc hơn — cả ngoài đường lẫn trong lòng bạn.",
        "Chúc bạn gặp một điều nhỏ khiến mình mỉm cười trước khi ngày hôm nay khép lại.",
        "Mong bạn đến đúng nơi, đúng lúc, và không phải thu nhỏ mình để vừa với nơi ấy.",
        "Chúc chiếc đèn đỏ kế tiếp chỉ giữ bạn lại đủ lâu để thở, không đủ lâu để sốt ruột.",
        "Mong điều tử tế từ chuyến xe này đi cùng bạn xa hơn quãng đường mình vừa chở.",
        "Chúc bạn có một điểm dừng nơi mình không cần giải thích quá nhiều.",
        "Mong đoạn đường kế tiếp có người nhường bạn một lối, và cuộc đời cũng vậy.",
        "Chúc bạn rời chuyến xe với ít nhất một điều nhẹ hơn lúc bước lên.",
    ],
    philosophy: [
        "Đường đông không có nghĩa là mình đi sai. Có khi ai cũng chỉ đang tìm đường về.",
        "Gương chiếu hậu để nhìn lại, không phải để lái mãi về phía sau.",
        "Không phải đoạn đường nào ngắn hơn cũng khiến mình đến nơi nhẹ hơn.",
        "Có những ngã rẽ chỉ hiểu được sau khi đã đi qua. Lúc đang đứng trước nó, do dự là chuyện bình thường.",
        "Đi cùng một quãng không có nghĩa phải cùng một đích. Biết lúc nào nên xuống xe cũng là một lựa chọn.",
        "Bản đồ có thể chỉ đường, nhưng không biết hôm nay bạn mệt đến mức nào. Nhịp đi vẫn nên do bạn chọn.",
        "Đèn đỏ không phải sự từ chối. Đôi khi nó chỉ là một khoảng dừng để những hướng khác được đi qua.",
        "Một chuyến xe êm không phải vì đường luôn phẳng, mà vì người lái biết lúc nào cần chậm lại.",
        "Có nơi mình từng rất muốn đến, rồi giữa đường mới nhận ra mình đã đổi khác. Đổi đích không phải thất bại.",
        "Im lặng trên xe không hề khó xử. Có những người tử tế với nhau bằng cách để nhau được yên.",
        "Mưa làm đường khó đi hơn, nhưng cũng khiến thành phố có một mùi rất khác. Một ngày xấu vẫn có thể giữ lại điều đẹp.",
        "Không ai nhìn thấy hết đoạn đường bạn đã qua chỉ bằng cách nhìn lúc bạn xuống xe.",
        "Đôi khi mình cần đi một vòng mới biết nơi nào thật sự là chỗ muốn quay về.",
        "Không phải ai vượt lên trước cũng đến đúng nơi hơn. Mỗi người đang theo một tuyến khác nhau.",
        "Chuyến xe nào cũng kết thúc. Điều đang làm bạn nặng lòng hôm nay rồi cũng sẽ đổi hình theo thời gian.",
    ],
};

const MOMENT_MESSAGES = {
    early: {
        encouragement: [
            "Sáng còn sớm mà bạn đã ở trên đường rồi. Mong hôm nay đối xử với bạn nhẹ tay một chút.",
            "Thành phố vừa thức, bạn không cần phải sẵn sàng cho mọi thứ ngay lập tức.",
        ],
        reminders: [
            "Buổi sáng chưa cần chạy hết tốc lực. Cho mình một quãng để cơ thể và tâm trí cùng thức dậy.",
            "Trước khi lao vào lịch hôm nay, mong bạn kịp nhận ra mình đang cần điều gì.",
        ],
        wishes: [
            "Chúc điểm đến đầu ngày của bạn có một khởi đầu không quá gấp.",
            "Mong chuyến xe sớm này mở đầu cho một ngày có nhiều tín hiệu xanh.",
        ],
        philosophy: [
            "Buổi sáng nào cũng có vẻ như một trang mới, nhưng bạn không bắt buộc phải viết thật đẹp ngay dòng đầu.",
            "Thành phố bắt đầu bằng những chuyến xe nhỏ. Một ngày mới cũng bắt đầu bằng những bước vừa sức như vậy.",
        ],
    },
    daytime: {
        encouragement: [
            "Ngày vẫn còn dài. Một đoạn không như ý chưa quyết định phần đường còn lại.",
            "Nếu buổi hôm nay đang trật nhịp, mình mong chuyến xe này là một dấu phẩy để bạn bắt đầu lại.",
        ],
        reminders: [
            "Giữa một ngày nhiều việc, chuyến xe này có thể là vài phút bạn không cần làm gì cả.",
            "Nắng ngoài đường đã đủ gắt rồi; mong bạn đừng nói với mình bằng giọng quá khắt khe.",
        ],
        wishes: [
            "Mong phần còn lại của ngày bớt ồn hơn đoạn đường mình vừa đi qua.",
            "Chúc cuộc hẹn tiếp theo của bạn diễn ra bằng sự tôn trọng và dễ chịu.",
        ],
        philosophy: [
            "Giữa ban ngày, ai cũng trông như biết mình đang đi đâu. Thật ra nhiều người cũng đang vừa đi vừa tìm.",
            "Một ngày bận không nhất thiết là một ngày có ý nghĩa. Điều đáng giữ lại có khi chỉ là vài phút được yên.",
        ],
    },
    commute: {
        encouragement: [
            "Tan làm rồi. Nếu hôm nay chưa trọn vẹn, bạn vẫn được phép khép nó lại ở đây.",
            "Bạn vừa đi qua một ngày dài. Chặng về không cần mang theo hết những điều ở chỗ làm.",
        ],
        reminders: [
            "Giờ tan tầm ai cũng muốn về nhanh. Mình cứ về an toàn trước, nhanh chậm tính sau.",
            "Khi xuống xe, thử để công việc ở lại sau lưng vài phút trước khi bước vào phần đời còn lại.",
        ],
        wishes: [
            "Mong nơi bạn về tối nay có một góc cho bạn được thôi cố gắng.",
            "Chúc đoạn đường sau giờ tan làm dẫn bạn gần hơn tới cảm giác được nghỉ ngơi.",
        ],
        philosophy: [
            "Dòng xe tan tầm nhắc rằng rất nhiều người đang mệt theo những cách mình không nhìn thấy.",
            "Rời chỗ làm không phải lúc nào cũng rời được những suy nghĩ về nó. Tâm trí đôi khi cần thêm một quãng đường.",
        ],
    },
    late: {
        encouragement: [
            "Đêm đã khuya mà bạn vẫn đang trên đường. Mong phần khó nhất của hôm nay đã ở phía sau.",
            "Nếu tối nay lòng còn ồn, cứ về đến nơi an toàn trước. Chuyện còn lại để ngày mai cùng bạn xử lý.",
        ],
        reminders: [
            "Đường khuya thoáng nhưng không cần vội. Mình ưu tiên đến nơi bình an nhé.",
            "Khi xuống xe, hãy nhìn quanh và chọn lối vào đủ sáng, đủ an toàn cho bạn.",
        ],
        wishes: [
            "Chúc cánh cửa cuối ngày mở ra một nơi bạn có thể thả lỏng.",
            "Mong đêm nay cho bạn một khoảng nghỉ thật sự, dù ngày vừa rồi đã diễn ra thế nào.",
        ],
        philosophy: [
            "Thành phố về khuya bớt tiếng người, nên tiếng lòng nghe rõ hơn. Không phải điều gì nghe thấy cũng cần giải quyết ngay.",
            "Có những chuyến về muộn không cần một bài học lớn; đến nơi an toàn đã là một kết thúc đẹp.",
        ],
    },
};

function getRideMoment(date = new Date()) {
    const hour = date.getHours();
    if (hour >= 5 && hour < 9) return "early";
    if (hour >= 16 && hour < 20) return "commute";
    if (hour >= 20 || hour < 5) return "late";
    return "daytime";
}

function getRideMomentLabel(date = new Date()) {
    return {
        early: "chuyến sớm",
        daytime: "chuyến giữa ngày",
        commute: "chuyến tan tầm",
        late: "chuyến khuya",
    }[getRideMoment(date)];
}

function getRandomMessage(categoryId, date = new Date()) {
    const baseMessages = MESSAGES[categoryId] || [];
    const momentMessages = MOMENT_MESSAGES[getRideMoment(date)]?.[categoryId] || [];
    const pool = momentMessages.length && Math.random() < 0.55 ? momentMessages : baseMessages;
    if (!pool.length) return "Cảm ơn bạn đã đi cùng chuyến xe này. Mong đoạn tiếp theo dịu hơn.";
    return pool[Math.floor(Math.random() * pool.length)];
}

function getTotalMessages() {
    const baseTotal = Object.values(MESSAGES).reduce((total, messages) => total + messages.length, 0);
    const momentTotal = Object.values(MOMENT_MESSAGES).reduce((total, groups) => (
        total + Object.values(groups).reduce((subtotal, messages) => subtotal + messages.length, 0)
    ), 0);
    return baseTotal + momentTotal;
}
