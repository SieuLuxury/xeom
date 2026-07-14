// ============================================
// Bộ sưu tập lời nhắn — Theo danh mục
// ============================================

const CATEGORIES = [
    {
        id: 'encouragement',
        emoji: '💪',
        label: 'Động viên',
        desc: 'Tiếp thêm sức mạnh',
        color: '#f0a500',
        gradient: 'linear-gradient(135deg, #f0a500, #ffd700)',
        scratchColor: '#f0a500',
    },
    {
        id: 'reminders',
        emoji: '🌿',
        label: 'Nhắc nhở',
        desc: 'Chăm sóc bản thân',
        color: '#7ecfb3',
        gradient: 'linear-gradient(135deg, #7ecfb3, #4ecdc4)',
        scratchColor: '#4ecdc4',
    },
    {
        id: 'wishes',
        emoji: '⭐',
        label: 'Lời chúc',
        desc: 'Gửi gắm yêu thương',
        color: '#ff6b8a',
        gradient: 'linear-gradient(135deg, #ff6b8a, #ff8e9e)',
        scratchColor: '#ff6b8a',
    },
    {
        id: 'philosophy',
        emoji: '🌸',
        label: 'Suy ngẫm',
        desc: 'Triết lý nhẹ nhàng',
        color: '#b8a9c9',
        gradient: 'linear-gradient(135deg, #b8a9c9, #d4a5ff)',
        scratchColor: '#9b8bb4',
    },
];

const MESSAGES = {
    encouragement: [
        "Dù hôm nay có khó khăn đến đâu, bạn vẫn đang ở đây, vẫn đang cố gắng. Điều đó đã là rất tuyệt vời rồi.",
        "Bạn không cần phải hoàn hảo. Bạn chỉ cần là chính mình — phiên bản đó đã đủ tốt rồi.",
        "Mỗi bước đi nhỏ cũng là tiến bộ. Đừng so sánh chặng đường của mình với người khác nhé.",
        "Hãy tin rằng những ngày tốt đẹp đang ở phía trước. Vì bạn xứng đáng được hạnh phúc.",
        "Đừng quá khắt khe với bản thân. Bạn đang làm tốt hơn những gì bạn nghĩ rất nhiều.",
        "Nghỉ ngơi cũng là một dạng của mạnh mẽ. Đừng ép bản thân quá mức nhé.",
        "Bạn đã vượt qua 100% những ngày tồi tệ nhất trong đời mình. Tỷ lệ đó khá ấn tượng!",
        "Mỗi sáng thức dậy là một cơ hội mới. Và hôm nay, cơ hội ấy đang thuộc về bạn.",
        "Bạn mạnh mẽ hơn bạn tin, thông minh hơn bạn nghĩ, và được yêu thương hơn bạn biết.",
        "Thất bại không có nghĩa là kết thúc — mà là bạn đang học cách để thành công.",
        "Bạn không đơn độc trên hành trình này. Luôn có người đang thầm cổ vũ bạn.",
        "Đôi khi điều dũng cảm nhất là tiếp tục bước đi khi muốn dừng lại.",
        "Hãy để bản thân được tự hào về những gì bạn đã làm được, dù là nhỏ nhất.",
        "Nếu hôm nay bạn gặp chuyện buồn, hãy cho phép mình buồn một chút rồi bước tiếp nhé.",
        "Dù ai nói gì, hãy nhớ rằng bạn có giá trị. Bạn quan trọng. Bạn đáng được yêu thương.",
    ],

    reminders: [
        "Hôm nay bạn đã uống đủ nước chưa? Nhớ uống ít nhất 2 lít mỗi ngày nhé! 💧",
        "Nhớ gọi cho bố mẹ nha. Một cuộc gọi ngắn thôi cũng đủ làm họ vui cả ngày.",
        "Hãy hít thở sâu 3 lần. Hít vào... thở ra... Cảm thấy nhẹ hơn chưa? 🍃",
        "Nhớ ăn cơm đúng giờ nha! Dạ dày của bạn cũng cần được chăm sóc.",
        "Đêm nay nhớ ngủ sớm nhé. Giấc ngủ ngon là món quà tốt nhất cho bản thân.",
        "Kiểm tra tư thế ngồi nào! Ngồi thẳng lưng lên, vai thả lỏng nhé 😊",
        "Hãy khen ngợi ai đó hôm nay. Một lời khen chân thành có thể thay đổi cả ngày của một người.",
        "Bạn đã dành thời gian cho bản thân chưa? Hãy làm điều gì đó mà bạn thích nhé.",
        "Nhớ bôi kem chống nắng khi ra đường nhé! Da của bạn sẽ cảm ơn sau này.",
        "Lâu rồi bạn có đọc sách chưa? Dù chỉ 10 phút một ngày cũng rất tuyệt.",
        "Hãy dọn dẹp một góc nhỏ trong phòng. Không gian gọn gàng giúp tâm trí thoải mái hơn.",
        "Nếu có điều gì đang lo, hãy viết ra giấy. Đôi khi viết ra giúp mọi thứ rõ ràng hơn.",
        "Bạn có nhớ lần cuối mình cười thật tươi? Hãy tìm lý do để cười hôm nay nhé!",
        "Đừng quên uống vitamin nhé! Sức khỏe là tài sản quý giá nhất.",
        "15 phút đi bộ cũng giúp tinh thần sảng khoái hơn rất nhiều. Thử xem! 🚶",
    ],

    wishes: [
        "Chúc bạn một ngày thật nhiều năng lượng và tràn đầy niềm vui! ☀️",
        "Mong rằng nơi bạn đến sẽ có người đang chờ đón bạn với nụ cười!",
        "Chúc bạn luôn gặp được những điều bất ngờ thú vị trên đường đi.",
        "Mong bạn sẽ có một giấc ngủ ngon tối nay, đầy những giấc mơ đẹp. 🌙",
        "Chúc bạn tìm được niềm vui trong những điều nhỏ nhặt nhất hôm nay.",
        "Mong bạn sẽ luôn có đủ can đảm để theo đuổi ước mơ của mình. 🚀",
        "Chúc bạn gặp nhiều may mắn và người tốt trên hành trình phía trước!",
        "Mong bạn luôn khỏe mạnh — vì sức khỏe là nền tảng của mọi hạnh phúc.",
        "Mong rằng mỗi buổi sáng bạn đều thức dậy với nụ cười và lòng biết ơn.",
        "Chúc bạn luôn có những người thương yêu bên cạnh trong mọi hoàn cảnh. 💛",
        "Mong bạn sẽ tìm được sự bình yên trong tâm hồn, dù bên ngoài ồn ào.",
        "Chúc bạn đủ kiên nhẫn để chờ đợi và đủ dũng cảm để hành động.",
        "Mong cuộc sống sẽ đối xử tốt với bạn, như cách bạn tốt với người khác.",
        "Chúc bạn luôn giữ được tấm lòng ấm áp, dù cuộc đời có lạnh lẽo. ❄️💛",
        "Chúc một tuần mới tràn đầy cảm hứng và thành công đến với bạn!",
    ],

    philosophy: [
        "Cuộc sống không phải là đợi cơn bão đi qua, mà là học cách nhảy múa dưới mưa. 🌧️",
        "Đôi khi, lạc đường lại là cách hay nhất để tìm ra con đường mới.",
        "Hạnh phúc không phải là có được mọi thứ, mà là trân trọng những gì đang có.",
        "Mỗi người bạn gặp đều đang chiến đấu một trận chiến mà bạn không biết. Hãy luôn tử tế.",
        "Thời gian là thứ xa xỉ nhất. Hãy dành nó cho những người và những điều đáng giá.",
        "Đôi khi im lặng lại nói được nhiều hơn lời nói. Và sự im lặng cũng cần có người thấu hiểu.",
        "Bạn không cần phải mạnh mẽ mọi lúc. Sự dễ bị tổn thương cũng là một phần của con người.",
        "Cuộc đời là những chuyến đi. Quan trọng không phải đích đến, mà là cảnh đẹp dọc đường. 🛤️",
        "Sống chậm lại một chút. Vội vã quá đôi khi làm ta quên mất những điều đẹp đẽ bên cạnh.",
        "Giá trị của bạn không nằm ở công việc bạn làm, mà ở con người bạn là.",
        "Không ai sinh ra đã biết tất cả. Hãy cho phép mình được sai, được học, và được lớn lên.",
        "Như bầu trời luôn có mây rồi lại nắng, cuộc đời cũng sẽ sáng lên sau những ngày u ám. 🌈",
        "Đôi khi, chỉ cần có ai đó lắng nghe là đủ. Bạn không cần lời khuyên, bạn cần sự thấu hiểu.",
        "Giống như con đường có lúc quanh co, cuộc đời cũng vậy. Nhưng rồi mọi thứ sẽ ổn thôi.",
        "Mỗi ngày qua đi, bạn đều đang trở thành phiên bản tốt hơn của ngày hôm qua. 🌱",
    ],
};

function getRandomMessage(categoryId) {
    const msgs = MESSAGES[categoryId];
    if (!msgs || msgs.length === 0) return "Chúc bạn một ngày tốt lành 💛";
    return msgs[Math.floor(Math.random() * msgs.length)];
}

function getTotalMessages() {
    let total = 0;
    for (const cat in MESSAGES) total += MESSAGES[cat].length;
    return total;
}
