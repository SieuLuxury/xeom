// Trạm Dịu Dàng — những lời nhắn nguyên bản, phổ quát và không phán xét.

const CATEGORIES = [
    {
        id: "encouragement",
        emoji: "💪",
        label: "Động viên",
        desc: "Một chút sức cho hôm nay",
        color: "#f0a500",
        gradient: "linear-gradient(135deg, #f0a500, #ffd700)",
        scratchColor: "#f0a500",
    },
    {
        id: "reminders",
        emoji: "🌿",
        label: "Nhắc nhẹ",
        desc: "Chậm lại và nghe mình",
        color: "#7ecfb3",
        gradient: "linear-gradient(135deg, #7ecfb3, #4ecdc4)",
        scratchColor: "#4ecdc4",
    },
    {
        id: "wishes",
        emoji: "⭐",
        label: "Lời chúc",
        desc: "Những điều đẹp dành cho bạn",
        color: "#ff6b8a",
        gradient: "linear-gradient(135deg, #ff6b8a, #ff8e9e)",
        scratchColor: "#ff6b8a",
    },
    {
        id: "philosophy",
        emoji: "🌸",
        label: "Suy ngẫm",
        desc: "Một góc nhìn để ngẫm",
        color: "#b8a9c9",
        gradient: "linear-gradient(135deg, #b8a9c9, #d4a5ff)",
        scratchColor: "#9b8bb4",
    },
];

const MESSAGES = {
    encouragement: [
        "Có những ngày, việc không bỏ rơi chính mình đã là một thành tựu.",
        "Bạn được phép tiến chậm mà không phải giải thích tốc độ của mình với bất kỳ ai.",
        "Không phải mọi cố gắng đều trông rực rỡ. Nhiều cố gắng chỉ đơn giản là tiếp tục có mặt.",
        "Mệt mỏi không phủ nhận năng lực của bạn; nó chỉ cho thấy bạn đã mang nhiều thứ quá lâu.",
        "Hôm nay chưa ổn không có nghĩa ngày mai cũng phải giống như vậy.",
        "Can đảm đôi khi không phải bước thật xa, mà là thành thật rằng mình đang sợ.",
        "Bạn không cần biến nỗi đau thành một bài học ngay lập tức. Trước hết, cứ để mình được hồi phục.",
        "Một quyết định nhỏ bảo vệ sự bình yên của bạn cũng là một quyết định đáng tự hào.",
        "Bạn có thể vừa sợ, vừa chưa chắc chắn, vừa tiếp tục — ba điều ấy không loại trừ nhau.",
        "Việc bạn cần nghỉ không có nghĩa bạn yếu; nó có nghĩa bạn là một con người có giới hạn.",
        "Không ai có thể nở hoa trong mọi mùa. Có mùa chỉ để cắm rễ sâu hơn.",
        "Bạn không cần trở lại con người cũ. Bạn có thể trở thành một người mới dịu dàng hơn với chính mình.",
        "Thành công của hôm nay có thể chỉ là làm xong điều quan trọng nhất và để phần còn lại sang ngày khác.",
        "Đừng dùng một khoảnh khắc tệ để kết luận về toàn bộ con người mình.",
        "Ngay cả khi chưa làm được gì lớn lao, bạn vẫn xứng đáng được đối xử bằng sự tử tế.",
    ],
    reminders: [
        "Cảm xúc là tín hiệu, không phải mệnh lệnh. Bạn có thể lắng nghe chúng mà chưa cần hành động ngay.",
        "Không phải mọi lời mời đều cần một cái gật đầu. Năng lượng của bạn cũng cần được giữ gìn.",
        "Trước khi nói “được”, hãy thử hỏi mình có thật sự muốn hay chỉ sợ làm ai đó thất vọng.",
        "Bạn không cần phản hồi mọi tin nhắn ngay lập tức. Sẵn sàng rồi trả lời vẫn là tôn trọng.",
        "Cơ thể không phải cỗ máy. Hãy chăm sóc nó theo nhu cầu thực tế của bạn, không theo một công thức chung.",
        "Nếu đầu óc quá ồn, hãy thu nhỏ ngày hôm nay lại còn một việc cần làm tiếp theo.",
        "Nghỉ ngơi không phải phần thưởng chỉ dành cho lúc mọi việc đã xong.",
        "Bạn được phép đổi ý khi có thêm thông tin hoặc khi nhận ra điều gì không còn phù hợp.",
        "Điều khẩn cấp của người khác không tự động trở thành trách nhiệm của bạn.",
        "Không có cảm xúc nào khiến bạn trở thành người xấu; điều quan trọng là cách bạn chọn hành động.",
        "Giữ một ranh giới không phải lạnh lùng. Đó là cách để sự tử tế không biến thành kiệt sức.",
        "Đôi khi điều tử tế nhất bạn có thể làm là ngừng ép mình phải ổn cho người khác yên lòng.",
        "Bạn không phải giải quyết toàn bộ cuộc đời mình trong một buổi tối.",
        "Khi mọi thứ rối lên, hãy quay về điều căn bản: một nơi an toàn, một việc nhỏ trong tầm tay và thêm hỗ trợ nếu có thể.",
        "Có những việc nên làm ngay; cũng có những việc sẽ sáng rõ hơn sau khi bạn được nghỉ.",
    ],
    wishes: [
        "Mong bạn gặp được những người không bắt bạn phải nhỏ lại để họ cảm thấy lớn hơn.",
        "Chúc bạn có đủ bình yên để nghe được điều mình thật sự muốn.",
        "Mong những cơ hội dành cho bạn không đòi bạn đánh đổi lòng tự trọng để có được chúng.",
        "Chúc bạn được yêu quý trong cả những ngày không vui vẻ, hữu ích hay hoàn hảo.",
        "Mong bạn tìm thấy một nơi mà sự im lặng của mình cũng được đón nhận.",
        "Chúc điều bạn đang kiên nhẫn vun trồng sớm cho một dấu hiệu rằng nó đang lớn lên.",
        "Mong bạn có thêm những ngày bình thường nhưng dễ chịu — thứ hạnh phúc thường bị xem nhẹ.",
        "Chúc bạn đủ mềm mại để cảm nhận và đủ vững vàng để không đánh mất mình.",
        "Mong cuộc sống gửi đến bạn vài niềm vui không cần phải kiếm tìm hay chứng minh.",
        "Chúc bạn gặp đúng người để được thấu hiểu, và đúng khoảng lặng để tự hiểu mình.",
        "Mong điều sắp đến tốt đẹp hơn điều bạn từng phải rời đi.",
        "Chúc bạn được nghỉ ngơi mà không thấy có lỗi, và được vui mà không phải lo niềm vui sẽ sớm biến mất.",
        "Mong bạn giữ được lòng tốt nhưng không còn dùng nó để biện minh cho việc người khác làm tổn thương mình.",
        "Chúc bạn có đủ những điều cần thiết, cùng một vài điều đẹp đẽ chỉ để khiến lòng vui.",
        "Mong phiên bản tương lai của bạn nhìn lại hôm nay bằng sự biết ơn, không phải tiếc nuối.",
    ],
    philosophy: [
        "Trưởng thành không phải lúc nào cũng là chịu đựng giỏi hơn; đôi khi là biết điều gì không cần chịu đựng nữa.",
        "Sự bình yên không đòi mọi thứ hoàn hảo. Nó bắt đầu khi ta ngừng giao quyền bình yên cho mọi thứ bên ngoài.",
        "Thời gian không tự chữa lành mọi thứ; điều ta làm với khoảng thời gian ấy mới tạo nên thay đổi.",
        "Một lời xin lỗi có thể khép lại tranh cãi, nhưng chỉ sự thay đổi mới khép lại tổn thương.",
        "Ta thường tiếc những điều chưa thành vì chỉ nhìn thấy khả năng đẹp nhất của chúng, không phải toàn bộ cái giá.",
        "Có người bước ra khỏi đời ta không phải vì ai xấu, mà vì hai cách sống không còn đi cùng nhau được nữa.",
        "Biết mình muốn gì là quan trọng; biết điều gì không còn phù hợp cũng quan trọng không kém.",
        "Không phải sự im lặng nào cũng là bình yên. Có sự im lặng được tạo nên vì ta không còn thấy an toàn để lên tiếng.",
        "Ta không nhìn thế giới đúng như nó vốn có; ta nhìn nó qua những gì mình từng trải qua.",
        "Một mối quan hệ lành mạnh không xóa hết bất đồng; nó khiến bất đồng không còn là mối đe dọa.",
        "Đôi khi ta nhớ một cảm giác từng có bên ai đó, rồi nhầm rằng mình vẫn còn nhớ chính con người ấy.",
        "Tự do không chỉ là được chọn điều mình muốn, mà còn là chịu trách nhiệm với điều mình đã chọn.",
        "Điều đúng với bạn ở một giai đoạn không có nghĩa phải đúng với bạn mãi mãi.",
        "Không phải câu hỏi nào cũng cần câu trả lời. Có câu hỏi chỉ cần được sống đủ lâu để tự đổi khác.",
        "Ta bắt đầu hiểu mình hơn khi thôi chỉ hỏi “mình nên là ai” và thử hỏi “mình đang cảm thấy thế nào”.",
    ],
};

const MOMENT_MESSAGES = {
    early: {
        encouragement: [
            "Bạn không cần bắt đầu ngày mới bằng phiên bản xuất sắc nhất. Có mặt trọn vẹn đã là một khởi đầu tốt.",
            "Buổi sáng này chưa biết sẽ mang gì đến, và điều đó cũng có nghĩa nhiều khả năng tốt vẫn còn mở.",
        ],
        reminders: [
            "Trước khi trao cả ngày cho công việc và người khác, hãy giữ lại một chút chú ý cho chính mình.",
            "Đừng để việc đầu tiên của buổi sáng là kiểm tra xem thế giới đang cần gì ở bạn.",
        ],
        wishes: [
            "Chúc ngày mới của bạn bắt đầu bằng sự rõ ràng và tiếp tục bằng những điều vừa sức.",
            "Mong hôm nay có ít nhất một khoảnh khắc khiến bạn nghĩ: mình vui vì đã thức dậy để gặp điều này.",
        ],
        philosophy: [
            "Mỗi buổi sáng không xóa được ngày hôm qua, nhưng luôn mở thêm một cách để ta đáp lại nó.",
            "Khởi đầu mới không cần ồn ào. Nhiều thay đổi lớn bắt đầu bằng một lựa chọn không ai nhìn thấy.",
        ],
    },
    daytime: {
        encouragement: [
            "Ngày vẫn chưa kết thúc. Một buổi sáng không như ý chưa có quyền quyết định cả hôm nay.",
            "Nếu bạn vừa mất nhịp, hãy bắt đầu lại từ phút này — không cần đợi đến ngày mai.",
        ],
        reminders: [
            "Giữa một ngày bận rộn, vài phút không tạo ra giá trị gì cũng có thể rất có giá trị với bạn.",
            "Hãy để sự tập trung phục vụ điều quan trọng, thay vì bị chia nhỏ cho mọi thứ cùng lúc.",
        ],
        wishes: [
            "Mong phần còn lại của ngày mang đến một tin vui vừa đủ để lòng bạn sáng lên.",
            "Chúc những cuộc gặp hôm nay để lại trong bạn nhiều năng lượng hơn chúng lấy đi.",
        ],
        philosophy: [
            "Bận rộn dễ tạo cảm giác mình đang tiến lên, nhưng chỉ sự rõ ràng mới cho biết mình đang tiến về đâu.",
            "Một ngày có ý nghĩa không nhất thiết phải đầy thành tựu; đôi khi nó chỉ cần không phản bội điều mình coi trọng.",
        ],
    },
    commute: {
        encouragement: [
            "Nếu hôm nay chưa trọn vẹn, bạn vẫn được phép khép nó lại mà không mang theo một bản án về mình.",
            "Bạn đã đi qua phần lớn ngày hôm nay. Hãy ghi nhận sức mình trước khi nhìn vào những gì còn thiếu.",
        ],
        reminders: [
            "Cuối ngày là lúc chuyển nhịp, không phải lúc tiếp tục tự đánh giá năng suất của mình.",
            "Hãy để công việc kết thúc ở một ranh giới nào đó; tâm trí của bạn cũng cần được trở về.",
        ],
        wishes: [
            "Mong buổi tối cho bạn một khoảng riêng không phải đóng bất kỳ vai nào.",
            "Chúc những giờ còn lại của hôm nay đủ chậm để bạn nhận ra mình đã cố gắng nhiều thế nào.",
        ],
        philosophy: [
            "Ta cần những khoảng chuyển tiếp để một phần trong ngày thật sự kết thúc trước khi phần khác bắt đầu.",
            "Không mang việc về nhà đôi khi dễ hơn không mang cảm xúc từ công việc về. Tâm trí luôn cần thêm thời gian.",
        ],
    },
    late: {
        encouragement: [
            "Đêm muộn thường khiến nỗi lo nói lớn hơn. Đừng vội tin mọi điều tâm trí kết luận khi đã quá mệt.",
            "Nếu hôm nay khó khăn, bạn không cần thắng nó trước khi ngủ. Đi qua được hôm nay đã đủ rồi.",
        ],
        reminders: [
            "Đây không phải thời điểm phải giải quyết hết mọi chuyện. Hãy ưu tiên sự an toàn và nghỉ ngơi của bạn.",
            "Có những tin nhắn, quyết định và nỗi lo sẽ được nhìn rõ hơn dưới ánh sáng ngày mai.",
        ],
        wishes: [
            "Mong đêm nay cho bạn một giấc nghỉ không bị những điều dang dở đòi câu trả lời.",
            "Chúc bạn khép ngày lại bằng sự tha thứ cho những gì mình chưa làm được.",
        ],
        philosophy: [
            "Ban đêm không làm vấn đề lớn hơn; nó chỉ làm thế giới xung quanh nhỏ lại, nên vấn đề chiếm nhiều chỗ hơn.",
            "Ngày mai không bảo đảm mọi thứ dễ hơn, nhưng một tâm trí được nghỉ sẽ có thêm cách để nhìn chúng.",
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
        early: "buổi sớm",
        daytime: "giữa ngày",
        commute: "cuối chiều",
        late: "đêm muộn",
    }[getRideMoment(date)];
}

function getRandomMessage(categoryId, date = new Date()) {
    const baseMessages = MESSAGES[categoryId] || [];
    const momentMessages = MOMENT_MESSAGES[getRideMoment(date)]?.[categoryId] || [];
    const pool = momentMessages.length && Math.random() < 0.42 ? momentMessages : baseMessages;
    if (!pool.length) return "Mong bạn gặp được điều dịu dàng đúng vào lúc mình cần nhất.";
    return pool[Math.floor(Math.random() * pool.length)];
}

function getTotalMessages() {
    const baseTotal = Object.values(MESSAGES).reduce((total, messages) => total + messages.length, 0);
    const momentTotal = Object.values(MOMENT_MESSAGES).reduce((total, groups) => (
        total + Object.values(groups).reduce((subtotal, messages) => subtotal + messages.length, 0)
    ), 0);
    return baseTotal + momentTotal;
}
