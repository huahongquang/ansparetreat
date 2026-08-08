// ==========================================================================
// An Spa Retreat - AI Assistant Conversational Script
// ==========================================================================

function initAIAssistant() {
    // Select elements
    const chatToggle = document.getElementById("ai-chat-toggle");
    const chatPanel = document.getElementById("ai-chat-panel");
    const chatCloseBtn = document.getElementById("ai-chat-close-btn");
    const chatMessages = document.getElementById("ai-chat-messages");
    const chatInput = document.getElementById("ai-chat-input");
    const chatSend = document.getElementById("ai-chat-send");
    const chatSuggestions = document.getElementById("ai-chat-suggestions");
    
    let isInitialOpen = true;

    // Toggle Chat Panel
    if (chatToggle && chatPanel) {
        chatToggle.addEventListener("click", () => {
            const isActive = chatPanel.classList.contains("active");
            if (isActive) {
                closeChat();
            } else {
                openChat();
            }
        });
    }

    if (chatCloseBtn) {
        chatCloseBtn.addEventListener("click", closeChat);
    }

    function openChat() {
        chatPanel.classList.add("active");
        
        // Change toggle icon
        const openIcon = chatToggle.querySelector(".toggle-icon-open");
        const closeIcon = chatToggle.querySelector(".toggle-icon-close");
        if (openIcon && closeIcon) {
            openIcon.style.display = "none";
            closeIcon.style.display = "block";
        }
        
        // Hide the pulsing ring once opened
        const pulse = chatToggle.querySelector(".ai-chat-pulse");
        if (pulse) pulse.style.display = "none";
        
        if (isInitialOpen) {
            showGreeting();
            isInitialOpen = false;
        }
    }

    function closeChat() {
        chatPanel.classList.remove("active");
        
        // Change toggle icon
        const openIcon = chatToggle.querySelector(".toggle-icon-open");
        const closeIcon = chatToggle.querySelector(".toggle-icon-close");
        if (openIcon && closeIcon) {
            openIcon.style.display = "block";
            closeIcon.style.display = "none";
        }
    }

    // Load dynamic suggestion chips based on language
    function loadSuggestions() {
        if (!chatSuggestions) return;
        chatSuggestions.innerHTML = "";
        
        const viSuggestions = [
            "Tư vấn mỏi cơ",
            "Chăm sóc da mụn",
            "Bảng giá dịch vụ",
            "Địa chỉ ở đâu?"
        ];
        
        const enSuggestions = [
            "Stretching advice",
            "Acne skincare",
            "Check price list",
            "Where are you?"
        ];
        
        const list = currentLang === 'en' ? enSuggestions : viSuggestions;
        list.forEach(text => {
            const chip = document.createElement("button");
            chip.className = "suggestion-chip";
            chip.innerText = text;
            chip.addEventListener("click", () => {
                handleUserMessage(text);
            });
            chatSuggestions.appendChild(chip);
        });
    }

    // Display welcome greetings
    function showGreeting() {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const greetingVi = "Xin chào quý khách! Tôi là trợ lý ảo **An Spa AI Advisor** 🌿.\n\nTôi có thể hỗ trợ tư vấn chọn liệu trình trị liệu mỏi cơ, chăm sóc da nam giới, báo giá hoặc hướng dẫn đặt lịch hẹn nhanh.\n\nQuý khách muốn tìm hiểu dịch vụ nào hôm nay ạ?";
        const greetingEn = "Hello guest! I am your **An Spa AI Advisor** 🌿.\n\nI can recommend stretching therapies, acne treatments, share price lists, or help you book a session.\n\nWhat can I assist you with today?";
        
        const msgText = currentLang === 'en' ? greetingEn : greetingVi;
        appendAIMessage(msgText);
        loadSuggestions();
    }

    // Append a message bubble
    function appendUserMessage(text) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const msgDiv = document.createElement("div");
        msgDiv.className = "chat-msg user";
        msgDiv.innerHTML = `
            <div class="chat-bubble">${escapeHTML(text)}</div>
            <div class="chat-time">${time}</div>
        `;
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    }

    function appendAIMessage(text, cards = []) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const msgDiv = document.createElement("div");
        msgDiv.className = "chat-msg ai";
        
        // Convert bold markdown syntax **text** to <strong>text</strong>
        let formattedText = escapeHTML(text)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
            
        let cardsHtml = "";
        if (cards && cards.length > 0) {
            cardsHtml = '<div style="display:flex; flex-direction:column; gap:10px; margin-top:10px; width:100%;">';
            cards.forEach(c => {
                const title = currentLang === 'en' ? c.title_en : c.title_vi;
                const viewDetailsText = currentLang === 'en' ? "View Details" : "Xem Chi Tiết";
                const bookNowText = currentLang === 'en' ? "Book Now" : "Đặt Lịch";
                cardsHtml += `
                    <div class="chat-card">
                        <img src="${c.image}" class="chat-card-img" alt="${title}">
                        <div class="chat-card-body">
                            <div class="chat-card-title">${title}</div>
                            <div class="chat-card-meta"><i data-lucide="clock" style="width:10px;height:10px;display:inline-block;vertical-align:middle;margin-right:2px;"></i> ${c.duration} | ${c.price}</div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                                <button class="chat-card-btn" onclick="triggerChatAction('details', ${c.id})">${viewDetailsText}</button>
                                <button class="chat-card-btn" style="background:var(--accent-gold); color:var(--bg-dark);" onclick="triggerChatAction('book', '${c.title_en}')">${bookNowText}</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            cardsHtml += '</div>';
        }

        msgDiv.innerHTML = `
            <div class="chat-bubble">
                <div>${formattedText}</div>
                ${cardsHtml}
            </div>
            <div class="chat-time">${time}</div>
        `;
        chatMessages.appendChild(msgDiv);
        
        // Re-render Lucide icons inside bubble
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            try {
                lucide.createIcons({
                    attrs: {
                        class: 'lucide'
                    }
                });
            } catch (err) {
                console.error("Lucide rendering error in chat", err);
            }
        }
        
        scrollToBottom();
    }

    // Typing effect placeholder
    function showTypingIndicator() {
        const indicator = document.createElement("div");
        indicator.className = "chat-msg ai typing-indicator-container";
        indicator.innerHTML = `
            <div class="chat-bubble" style="padding: 8px 16px;">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(indicator);
        scrollToBottom();
        return indicator;
    }

    function removeTypingIndicator(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Input handlers
    if (chatSend && chatInput) {
        chatSend.addEventListener("click", () => {
            const text = chatInput.value.trim();
            if (text) {
                handleUserMessage(text);
                chatInput.value = "";
            }
        });

        chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                const text = chatInput.value.trim();
                if (text) {
                    handleUserMessage(text);
                    chatInput.value = "";
                }
            }
        });
    }

    // Clean accents for Vietnamese fuzzy searching
    function removeAccents(str) {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D");
    }

    // Message Matching & Response engine
    function handleUserMessage(text) {
        appendUserMessage(text);
        
        const typing = showTypingIndicator();
        
        // Simulate thinking time
        setTimeout(() => {
            removeTypingIndicator(typing);
            
            const rawQuery = text.toLowerCase();
            const query = removeAccents(rawQuery);
            const services = initialData.services || [];
            
            let replyText = "";
            let recommendedCards = [];
            
            // 1. MATCH: Location & opening hours
            if (query.includes("dia chi") || query.includes("o dau") || query.includes("chi nhanh") || query.includes("duong") || query.includes("quan 2") || query.includes("location") || query.includes("address") || query.includes("where")) {
                if (currentLang === 'en') {
                    replyText = "An Spa Retreat is located at **No. 12, Street 54, Van Minh Residence, An Phu, District 2, Thu Duc City (Saigon)**.\n\nWe open daily from **10:00 AM to 10:00 PM** (including holidays).\n\nThere is free car & motorbike parking inside. You can click the Google Map button in our location section to see the directions!";
                } else {
                    replyText = "Dạ, An Spa Retreat chỉ có một cơ sở duy nhất tọa lạc tại: **Số 12, Đường 54, KDC Văn Minh, Phường An Phú, Quận 2 (nay là TP. Thủ Đức, TP.HCM)**.\n\nThời gian làm việc: **10:00 - 22:00 hàng ngày** (nhận khách lượt cuối lúc 20:30).\n\nCó bãi đỗ xe ô tô và xe máy an toàn, miễn phí ngay trước cửa spa ạ.";
                }
            }
            // 2. MATCH: Booking process
            else if (query.includes("dat lich") || query.includes("dat cho") || query.includes("hen") || query.includes("book") || query.includes("appointment")) {
                if (currentLang === 'en') {
                    replyText = "You can quickly schedule an appointment by clicking the **Login** button on the top right header, or by clicking the button on any service card.\n\nAlternatively, you can open the booking form right now by clicking the link below:\n\n👉 <a href=\"#\" onclick=\"openBookingModal(); return false;\" style=\"color:var(--accent-gold); font-weight:700; text-decoration:underline;\">Open Booking Form</a>";
                } else {
                    replyText = "Dạ để đăng ký đặt lịch hẹn trước, bạn có thể click nút **Đăng Nhập** nổi bật trên thanh Menu đầu trang hoặc bấm nút Đặt Lịch ngay dưới mỗi gói dịch vụ.\n\nHoặc bạn có thể bấm trực tiếp vào đường dẫn dưới đây để mở nhanh phiếu đăng ký điền thông tin hẹn:\n\n👉 <a href=\"#\" onclick=\"openBookingModal(); return false;\" style=\"color:var(--accent-gold); font-weight:700; text-decoration:underline;\">Mở Phiếu Đăng Ký Trực Tiếp</a>";
                }
            }
            // 3. MATCH: Pricing / Tips / Extra fees
            else if (query.includes("gia") || query.includes("bang gia") || query.includes("bao nhieu") || query.includes("tien") || query.includes("price") || query.includes("fee") || query.includes("cost") || query.includes("tip")) {
                if (currentLang === 'en') {
                    replyText = "Our services range from **400k VND** (45-min Skincare) to **900k VND** (90-min Stretching). There are **no hidden fees, surcharges, or mandatory tips** at An Spa Retreat. Tips are purely optional based on your satisfaction.\n\nHere are some of our popular therapies:";
                } else {
                    replyText = "Dạ, bảng giá dịch vụ tại An Spa dao động từ **400.000đ** đến **900.000đ** tùy theo liệu trình và thời gian bạn chọn.\n\nĐặc biệt, An Spa **cam kết không thu thêm bất kỳ phụ phí nào khác và không bắt buộc Típ**. Típ tùy tâm theo mức độ hài lòng của quý khách.\n\nDưới đây là một số dịch vụ nổi bật kèm giá niêm yết:";
                }
                // Recommend 2 popular services
                recommendedCards = services.filter(s => s.badge === "POPULAR" || s.id === 8 || s.id === 12).slice(0, 2);
            }
            // 4. MATCH: Facial Skincare / Acne
            else if (query.includes("da mat") || query.includes("mun") || query.includes("skincare") || query.includes("mat") || query.includes("nan mun") || query.includes("face") || query.includes("acne")) {
                if (currentLang === 'en') {
                    replyText = "For men's facial care, we offer two professional treatments:\n\n1. **Relaxing Skin Care (45 mins - 400k)**: Focuses on gentle wash, scrub, moisture replenishment, and acupressure.\n2. **Intensive Skin Care (60 mins - 500k)**: Includes medical vacuum suction to clear blackheads, detoxifying green clay mask, and ice-hammer pores shrinkage.";
                } else {
                    replyText = "Dạ, đối với chăm sóc da mặt nam giới, An Spa có 2 liệu trình chuyên biệt tùy tình trạng da của anh:\n\n1. **Chăm sóc da mặt thư giãn (45 phút - 400k)**: Thích hợp dưỡng ẩm, làm sạch cơ bản giải tỏa mệt mỏi.\n2. **Chăm sóc da mặt chuyên sâu (60 phút - 500k)**: Có bổ sung công đoạn xông nóng, hút mụn cám, bã nhờn bằng máy chân không y khoa, đắp mặt nạ đất sét xanh thải độc và se khít chân lông bằng búa lạnh.";
                }
                recommendedCards = services.filter(s => s.category === "facial" && s.id <= 2);
            }
            // 5. MATCH: Grooming / Bikini Trim / Wax / IPL Hair removal
            else if (query.includes("bikini") || query.includes("wax") || query.includes("triet long") || query.includes("triet ipl") || query.includes("long") || query.includes("cao") || query.includes("ipl") || query.includes("hair removal")) {
                if (currentLang === 'en') {
                    replyText = "We provide private grooming services for gentlemen:\n\n* **Bikini Trim (300k)**: Clean, neat shape trimming using sanitized trimmers in a private room.\n* **IPL Hair Removal**: High-tech painless light pulses targeting hair roots to prevent regrowth.\n* **Warm Waxing**: Extract hair from roots using natural warm wax.";
                } else {
                    replyText = "Dạ, về vệ sinh vùng kín và triệt lông cơ thể cho nam giới, An Spa có phòng đơn riêng tư bảo mật tuyệt đối với các dịch vụ:\n\n* **Tỉa Bikini (300k)**: Cắt tỉa tạo dáng gọn gàng bằng tông đơ chuyên dụng được tiệt trùng.\n* **Triệt Lông Lạnh Công Nghệ IPL**: Triệt lông vĩnh viễn không đau rát bằng xung ánh sáng lạnh.\n* **Wax Lông**: Tẩy lông tận gốc bằng sáp ấm thảo mộc tự nhiên.";
                }
                recommendedCards = services.filter(s => s.category === "facial" && (s.id === 3 || s.id === 5));
            }
            // 6. MATCH: Body Massage / Stretching / Muscle relief
            else if (query.includes("massage") || query.includes("moi") || query.includes("dau") || query.includes("da nong") || query.includes("gian co") || query.includes("vai gay") || query.includes("lung") || query.includes("body") || query.includes("stretching") || query.includes("pain") || query.includes("stone")) {
                if (currentLang === 'en') {
                    replyText = "To relieve body aches, tension, and muscle tightness, we highly recommend:\n\n* **Deep Tissue / Stretching Therapy (60'/90')**: Dry sports stretch method, perfect for active men and athletes.\n* **Hot Stone Massage (90 mins - 600k)**: Swedish-style warm oil massage combined with placement of heated natural basalt stones along your spine.";
                } else {
                    replyText = "Dạ để trị liệu giảm đau mỏi lưng, vai gáy và giải tỏa cứng cơ, các gói massage body của bên em là lựa chọn tốt nhất:\n\n* **Massage Chuyên Sâu / Giãn Cơ (60'/90')**: Kéo giãn khớp xương trị liệu khô kiểu thể thao, giải phóng hoàn toàn các điểm bó cơ (gợi ý cho người tập gym, chơi thể thao).\n* **Massage Dầu Đá Nóng (600k)**: Vuốt dầu Thụy Điển nhẹ nhàng kết hợp chườm đá nóng núi lửa bazan truyền nhiệt sâu dọc cột sống thải độc tố, giúp ngủ sâu.";
                }
                recommendedCards = services.filter(s => s.category === "body" && (s.id === 8 || s.id === 12));
            }
            // 7. MATCH: Greetings
            else if (query.includes("hello") || query.includes("hi") || query.includes("xin chao") || query.includes("chao") || query.includes("alo") || query.includes("hey")) {
                if (currentLang === 'en') {
                    replyText = "Hello! I am your An Spa AI Advisor. I can help recommend treatment packages, check prices, or guide you to make a reservation. What can I do for you?";
                } else {
                    replyText = "Xin chào anh! Em là trợ lý ảo An Spa AI Advisor. Em có thể giúp anh tư vấn chọn liệu trình phù hợp, giải đáp bảng giá, địa chỉ hoặc hỗ trợ mở form đăng ký lịch hẹn. Anh cần em hỗ trợ gì ạ?";
                }
            }
            // 8. FALLBACK
            else {
                if (currentLang === 'en') {
                    replyText = "I'm sorry, I didn't quite catch that. You can ask me about:\n\n* **Muscle massage and stretching therapies**\n* **Facial skincare and acne extraction**\n* **Price list and branch details**\n* **How to book a session**\n\nYou can also click the quick suggestion chips below to start!";
                } else {
                    replyText = "Dạ, em chưa hiểu rõ câu hỏi của anh lắm ạ. Anh có thể hỏi em một số nội dung như:\n\n* **Tư vấn liệu trình trị liệu mỏi cơ**\n* **Gói chăm sóc da mặt nam giới**\n* **Báo giá dịch vụ & chi phí típ**\n* **Địa chỉ chi nhánh & giờ mở cửa**\n\nHoặc anh có thể bấm nhanh vào các nhãn gợi ý bên dưới để em trả lời lập tức nhé!";
                }
            }
            
            appendAIMessage(replyText, recommendedCards);
            loadSuggestions();
            
        }, 1000);
    }

    // Helper to escape HTML tags
    function escapeHTML(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAIAssistant);
} else {
    initAIAssistant();
}

// Global action handler linked to chat card buttons
window.triggerChatAction = function(action, param) {
    // Select elements
    const chatPanel = document.getElementById("ai-chat-panel");
    const chatToggle = document.getElementById("ai-chat-toggle");
    
    // Close chat
    if (chatPanel) {
        chatPanel.classList.remove("active");
    }
    if (chatToggle) {
        const openIcon = chatToggle.querySelector(".toggle-icon-open");
        const closeIcon = chatToggle.querySelector(".toggle-icon-close");
        if (openIcon && closeIcon) {
            openIcon.style.display = "block";
            closeIcon.style.display = "none";
        }
    }
    
    // Perform action
    if (action === 'details') {
        if (typeof openServiceDetailsModal === 'function') {
            openServiceDetailsModal(param);
        }
    } else if (action === 'book') {
        if (typeof openBookingModal === 'function') {
            openBookingModal(param);
        }
    }
};
