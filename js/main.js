// ==========================================================================
// Dynamic Database & Translations Loading
// ==========================================================================

let translations = initialData.translations;

let currentLang = localStorage.getItem("anspa_lang") || "vi";

// Ambient Background Audio controls
const ambientAudio = document.getElementById("ambient-audio");
const musicToggle = document.getElementById("music-toggle");

if (musicToggle && ambientAudio) {
    musicToggle.addEventListener("click", () => {
        if (ambientAudio.paused) {
            ambientAudio.play().then(() => {
                musicToggle.classList.add("playing");
                updateMusicButtonText();
            }).catch(err => {
                console.log("Audio playback blocked or failed:", err);
            });
        } else {
            ambientAudio.pause();
            musicToggle.classList.remove("playing");
            updateMusicButtonText();
        }
    });
}

function updateMusicButtonText() {
    const toggle = document.getElementById("music-toggle");
    if (!toggle) return;
    const musicText = toggle.querySelector("span") || document.getElementById("music-text");
    if (musicText && ambientAudio) {
        if (ambientAudio.paused) {
            musicText.innerText = translations[currentLang]["music_play"];
        } else {
            musicText.innerText = translations[currentLang]["music_mute"];
        }
    }
}

// Bind "Book Now" click events inside dynamically rendered cards
function bindSelectServiceButtons() {
    document.querySelectorAll(".btn-select-service").forEach(btn => {
        btn.addEventListener("click", () => {
            const service = btn.getAttribute("data-service");
            openBookingModal(service);
        });
    });
}

// Bind "Chi Tiết" details buttons
function bindViewDetailsButtons() {
    document.querySelectorAll(".btn-view-details").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.getAttribute("data-id"));
            openServiceDetailsModal(id);
        });
    });
}

// Render services and populate select options dynamically from database
function renderServices() {
    const servicesGrid = document.getElementById("services-grid");
    const serviceSelect = document.getElementById("booking-service");
    
    const servicesList = initialData.services || [];
    
    // 1. Populate the services grid cards
    if (servicesGrid) {
        servicesGrid.innerHTML = "";
        servicesList.forEach(s => {
            const title = currentLang === 'en' ? s.title_en : s.title_vi;
            const desc = currentLang === 'en' ? s.desc_en : s.desc_vi;
            const cardHtml = `
                <div class="service-card" data-category="${s.category}" data-goals="${s.goals.join(',')}">
                    <div class="service-img-wrapper">
                        <img src="${s.image}" alt="${title}" class="service-img">
                        ${s.badge ? `<div class="service-badge">${s.badge}</div>` : ''}
                    </div>
                    <div class="service-content">
                        <h3 class="service-name">${title}</h3>
                        <p class="service-desc">${desc}</p>
                        <div class="service-details">
                            <span class="service-duration"><i data-lucide="clock"></i> ${s.duration}</span>
                            <span class="service-price">${s.price}</span>
                        </div>
                        <div class="service-card-actions" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: auto; width: 100%;">
                            <button class="btn btn-outline btn-sm btn-view-details" data-id="${s.id}" data-t="btn_details" style="padding: 10px 14px;">Chi Tiết</button>
                            <button class="btn btn-gold btn-sm btn-select-service" data-service="${s.title_en}" data-t="book_now" style="padding: 10px 14px;">Book Now</button>
                        </div>
                    </div>
                </div>
            `;
            servicesGrid.insertAdjacentHTML("beforeend", cardHtml);
        });
        bindSelectServiceButtons();
        bindViewDetailsButtons();
    }
    
    // 2. Populate the booking modal dropdown options
    if (serviceSelect) {
        const placeholder = serviceSelect.options[0];
        serviceSelect.innerHTML = "";
        if (placeholder) {
            serviceSelect.appendChild(placeholder);
        }
        
        servicesList.forEach(s => {
            const title = currentLang === 'en' ? s.title_en : s.title_vi;
            const opt = document.createElement("option");
            opt.value = s.title_en;
            opt.innerText = title;
            serviceSelect.appendChild(opt);
        });
    }
}

// Translate elements having `data-t` attribute
function updateLanguageUI() {
    document.querySelectorAll("[data-t]").forEach(el => {
        const key = el.getAttribute("data-t");
        if (translations[currentLang] && translations[currentLang][key]) {
            el.innerHTML = translations[currentLang][key];
        }
    });

    loadAboutSectionData(); // Dynamic About Section Loader

    renderServices();
    renderArticles();
    renderFAQs(); // Dynamic FAQ Loader

    // Update select option placeholders and input values
    const serviceSelect = document.getElementById("booking-service");
    if (serviceSelect) {
        serviceSelect.options[0].text = translations[currentLang]["form_select_service"];
    }

    const timeSelect = document.getElementById("booking-time");
    if (timeSelect) {
        timeSelect.options[0].text = translations[currentLang]["form_select_time"];
    }

    // Update active flag state
    document.querySelectorAll(".flag-btn").forEach(btn => {
        const img = btn.querySelector("img");
        if (btn.getAttribute("data-lang") === currentLang) {
            btn.style.opacity = "1";
            if (img) img.style.borderColor = "var(--accent-gold)";
        } else {
            btn.style.opacity = "0.4";
            if (img) img.style.borderColor = "transparent";
        }
    });

    // Update music toggle button text
    updateMusicButtonText();

    // Update document title and description
    document.title = currentLang === "en" ? 
        "An Spa Retreat - Classic Gentleman's Sanctuary" : 
        "An Spa Retreat - Trị Liệu Nam Phong Cách Cổ Điển";
}

// Load About Section data dynamically
function loadAboutSectionData() {
    const aboutData = (typeof data !== "undefined" && data ? data.about : null) || (typeof initialData !== "undefined" && initialData ? initialData.about : null) || {
        stat_visits_val: "15k+",
        stat_years_val: "6+",
        stat_satisfaction_val: "99.8%",
        image_main: "assets/images/1.jpg",
        image_sub1: "assets/images/spa_img_10.jpg",
        image_sub2: "assets/images/spa_img_22.jpg",
        video_src: "img/An Spa Render 2_3.mp4"
    };

    // Update stat numbers
    const visitsEl = document.getElementById("about-stat-visits");
    if (visitsEl) visitsEl.innerText = aboutData.stat_visits_val;

    const yearsEl = document.getElementById("about-stat-years");
    if (yearsEl) yearsEl.innerText = aboutData.stat_years_val;

    const satEl = document.getElementById("about-stat-satisfaction");
    if (satEl) satEl.innerText = aboutData.stat_satisfaction_val;

    // Update images
    const mainImg = document.getElementById("about-img-main");
    if (mainImg) mainImg.src = aboutData.image_main;

    const sub1Img = document.getElementById("about-img-sub1");
    if (sub1Img) sub1Img.src = aboutData.image_sub1;

    const sub2Img = document.getElementById("about-img-sub2");
    if (sub2Img) sub2Img.src = aboutData.image_sub2;

    // Update video tour source & poster
    const galleryVideo = document.getElementById("gallery-video");
    if (galleryVideo && aboutData.video_src) {
        if (aboutData.video_poster) {
            galleryVideo.setAttribute("poster", aboutData.video_poster);
        }
        const sourceTag = galleryVideo.querySelector("source");
        if (sourceTag) {
            const currentSrc = sourceTag.getAttribute("src");
            if (currentSrc !== aboutData.video_src) {
                sourceTag.setAttribute("src", aboutData.video_src);
                galleryVideo.load();
            }
        }
    }
}

// Language flag selector logic
document.querySelectorAll(".flag-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        const lang = btn.getAttribute("data-lang");
        currentLang = lang;
        localStorage.setItem("anspa_lang", currentLang);
        updateLanguageUI();
    });
});

// Render blog articles dynamically from database
function renderArticles() {
    const journalGrid = document.getElementById("journal-grid");
    if (!journalGrid) return;
    
    journalGrid.innerHTML = "";
    const articlesList = initialData.articles || [];
    
    // Take only 3 latest articles
    const latestArticles = articlesList.slice(0, 3);
    
    if (latestArticles.length === 0) {
        journalGrid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color:var(--text-gray);">${currentLang === 'en' ? 'No articles published yet.' : 'Hiện tại chưa có bài viết nào.'}</div>`;
        return;
    }
    
    latestArticles.forEach(a => {
        const title = currentLang === 'en' ? a.title_en : a.title_vi;
        const desc = currentLang === 'en' ? a.desc_en : a.desc_vi;
        const tag = a.tags[currentLang === 'en' ? 0 : Math.min(1, a.tags.length - 1)];
        
        const cardHtml = `
            <div class="journal-card">
                <div class="journal-img-wrapper">
                    <img src="${a.image}" alt="${title}" class="journal-img">
                    <div class="journal-card-badge">${tag}</div>
                </div>
                <div class="journal-card-content">
                    <div class="journal-card-meta">${a.date} • ${a.author}</div>
                    <h3 class="journal-card-title">${title}</h3>
                    <p class="journal-card-desc">${desc}</p>
                    <button class="journal-card-link" onclick="openArticleModal('${a.slug}')">
                        ${currentLang === 'en' ? 'Read Article' : 'Đọc Bài Viết'} <i data-lucide="arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
        journalGrid.insertAdjacentHTML("beforeend", cardHtml);
    });
    
    try {
        lucide.createIcons();
    } catch(e) {}
}

const articleModal = document.getElementById("article-modal");

function openArticleModal(slug) {
    const a = (initialData.articles || []).find(item => item.slug === slug);
    if (!a) return;
    
    const title = currentLang === 'en' ? a.title_en : a.title_vi;
    const content = currentLang === 'en' ? a.content_en : a.content_vi;
    
    document.getElementById("article-modal-date").innerText = a.date;
    document.getElementById("article-modal-author").innerText = a.author;
    document.getElementById("article-modal-image").src = a.image;
    document.getElementById("article-modal-image").alt = title;
    document.getElementById("article-modal-title").innerText = title;
    
    const tagsContainer = document.getElementById("article-modal-tags");
    tagsContainer.innerHTML = "";
    a.tags.forEach(t => {
        const span = document.createElement("span");
        span.className = "service-badge";
        span.style.position = "static";
        span.innerText = t;
        tagsContainer.appendChild(span);
    });
    
    document.getElementById("article-modal-content").innerHTML = content;
    
    if (articleModal) {
        articleModal.classList.add("active");
    }
    document.body.style.overflow = "hidden";
    
    // Update hash for SEO routing
    history.pushState(null, null, `#journal/${slug}`);
}

function closeArticleModal() {
    if (articleModal) {
        articleModal.classList.remove("active");
    }
    document.body.style.overflow = "auto";
    // Clear hash
    history.pushState(null, null, window.location.pathname + window.location.search);
}

// Bind close events for article modal
const articleModalClose = document.getElementById("article-modal-close");
if (articleModalClose) {
    articleModalClose.addEventListener("click", closeArticleModal);
}
if (articleModal) {
    articleModal.addEventListener("click", (e) => {
        if (e.target === articleModal) closeArticleModal();
    });
}

// Check URL hash on page load for deep-link SEO articles
function checkArticleHash() {
    const hash = window.location.hash;
    if (hash.startsWith("#journal/")) {
        const slug = hash.replace("#journal/", "");
        openArticleModal(slug);
    }
}

// Initialize translations on load
document.addEventListener("DOMContentLoaded", () => {
    updateLanguageUI();
    checkArticleHash();
    try {
        lucide.createIcons();
    } catch (err) {
        console.error("Lucide failed to render icons:", err);
    }
});


// ==========================================================================
// Navigation & Responsive Scroll Menu
// ==========================================================================

const navbar = document.querySelector(".navbar");
window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});

// Mobile Hamburger Menu
const mobileToggle = document.getElementById("mobile-toggle");
const navMenu = document.getElementById("nav-menu");

mobileToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    mobileToggle.classList.toggle("active");
    // Change menu bars icon rotation
    const bars = mobileToggle.querySelectorAll(".bar");
    if (navMenu.classList.contains("active")) {
        bars[0].style.transform = "rotate(45deg) translate(5px, 5px)";
        bars[1].style.opacity = "0";
        bars[2].style.transform = "rotate(-45deg) translate(5px, -5px)";
    } else {
        bars[0].style.transform = "none";
        bars[1].style.opacity = "1";
        bars[2].style.transform = "none";
    }
});

// Close mobile menu on nav link click
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        const bars = mobileToggle.querySelectorAll(".bar");
        bars[0].style.transform = "none";
        bars[1].style.opacity = "1";
        bars[2].style.transform = "none";
    });
});


// ==========================================================================
// Service Menu Filtering & Mood Selection
// ==========================================================================

const filterButtons = document.querySelectorAll(".filter-btn");

function filterServices(category) {
    const serviceCards = document.querySelectorAll(".service-card");
    serviceCards.forEach(card => {
        const cardCat = card.getAttribute("data-category");
        if (category === "all" || cardCat === category) {
            card.style.display = "flex";
            // trigger slight fade in effect
            card.style.opacity = "0";
            setTimeout(() => { card.style.opacity = "1"; }, 50);
        } else {
            card.style.display = "none";
        }
    });
}

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const filterVal = btn.getAttribute("data-filter");
        filterServices(filterVal);
        
        // Remove active state from goal cards if filtering by category
        document.querySelectorAll(".goal-card").forEach(c => c.classList.remove("active"));
    });
});

// Interactive Goal selector
const goalCards = document.querySelectorAll(".goal-card");

goalCards.forEach(card => {
    card.addEventListener("click", () => {
        const goal = card.getAttribute("data-goal");
        const isActive = card.classList.contains("active");
        
        goalCards.forEach(c => c.classList.remove("active"));
        
        if (!isActive) {
            card.classList.add("active");
            // Scroll to services
            document.getElementById("services").scrollIntoView({ behavior: "smooth" });
            // Reset category filter buttons
            filterButtons.forEach(b => b.classList.remove("active"));
            document.querySelector('.filter-btn[data-filter="all"]').classList.add("active");
            
            // Highlight and filter services that match the goal
            const serviceCards = document.querySelectorAll(".service-card");
            serviceCards.forEach(svc => {
                const goals = svc.getAttribute("data-goals").split(",");
                if (goals.includes(goal)) {
                    svc.style.display = "flex";
                    svc.classList.add("highlighted");
                    svc.style.opacity = "1";
                } else {
                    svc.style.display = "none";
                    svc.classList.remove("highlighted");
                }
            });
        } else {
            // If already active, toggle off and show all
            filterServices("all");
        }
    });
});


// ==========================================================================
// Custom Video Tour Players & Gallery Carousels
// ==========================================================================

const mainVideo = document.getElementById("gallery-video");
const videoOverlay = document.getElementById("video-overlay");
const playGalleryBtn = document.getElementById("play-gallery-btn");

function playMainVideo() {
    mainVideo.play();
    videoOverlay.classList.add("hidden");
}

if (playGalleryBtn && videoOverlay) {
    playGalleryBtn.addEventListener("click", playMainVideo);
    videoOverlay.addEventListener("click", playMainVideo);
}

if (mainVideo) {
    mainVideo.addEventListener("pause", () => {
        videoOverlay.classList.remove("hidden");
    });

    mainVideo.addEventListener("ended", () => {
        videoOverlay.classList.remove("hidden");
    });
}

// Handle clicking on Shorts
const shortCards = document.querySelectorAll(".short-card");
shortCards.forEach(card => {
    card.addEventListener("click", () => {
        const videoSrc = card.getAttribute("data-video-src");
        
        // Swap main video source and play
        mainVideo.src = videoSrc;
        playMainVideo();
        
        // Smooth scroll to main player
        document.querySelector(".main-video-player").scrollIntoView({ behavior: "smooth", block: "center" });
    });
});

// Gallery Slider
const track = document.getElementById("gallery-track");
const slides = document.querySelectorAll(".gallery-slide");
const nextBtn = document.getElementById("gallery-next");
const prevBtn = document.getElementById("gallery-prev");

let currentSlideIdx = 0;

function getSlidesPerView() {
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
}

function updateSlider() {
    if (!track || slides.length === 0) return;
    const slidesPerView = getSlidesPerView();
    const maxIndex = slides.length - slidesPerView;
    
    if (currentSlideIdx > maxIndex) currentSlideIdx = maxIndex;
    if (currentSlideIdx < 0) currentSlideIdx = 0;
    
    const slideWidth = slides[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${currentSlideIdx * slideWidth}px)`;
}

if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        const slidesPerView = getSlidesPerView();
        if (currentSlideIdx < slides.length - slidesPerView) {
            currentSlideIdx++;
            updateSlider();
        }
    });
}

if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        if (currentSlideIdx > 0) {
            currentSlideIdx--;
            updateSlider();
        }
    });
}

// Re-adjust slider on window resize
window.addEventListener("resize", updateSlider);


// ==========================================================================
// Testimonial Review Slider
// ==========================================================================

const reviewSlides = document.querySelectorAll(".review-slide");
const dots = document.querySelectorAll(".dot");
let activeReviewIdx = 0;
let reviewInterval;

function showReview(idx) {
    if (reviewSlides.length === 0) return;
    reviewSlides.forEach(slide => slide.classList.remove("active"));
    dots.forEach(dot => dot.classList.remove("active"));
    
    reviewSlides[idx].classList.add("active");
    dots[idx].classList.add("active");
    activeReviewIdx = idx;
}

function nextReview() {
    if (reviewSlides.length === 0) return;
    let nextIdx = activeReviewIdx + 1;
    if (nextIdx >= reviewSlides.length) nextIdx = 0;
    showReview(nextIdx);
}

// Dot navigation
dots.forEach(dot => {
    dot.addEventListener("click", () => {
        const idx = parseInt(dot.getAttribute("data-index"));
        showReview(idx);
        resetReviewTimer();
    });
});

function startReviewTimer() {
    if (reviewSlides.length === 0) return;
    reviewInterval = setInterval(nextReview, 6000);
}

function resetReviewTimer() {
    clearInterval(reviewInterval);
    startReviewTimer();
}

// Start auto slider on load
startReviewTimer();


// ==========================================================================
// FAQs Accordions (Dynamic List & Event Handlers)
// ==========================================================================

function renderFAQs() {
    const container = document.getElementById("faq-accordion-container");
    if (!container) return;
    container.innerHTML = "";

    const faqList = (typeof data !== "undefined" && data ? data.faqs : null) || (typeof initialData !== "undefined" && initialData ? initialData.faqs : null) || [];
    
    faqList.forEach(faq => {
        const item = document.createElement("div");
        item.className = "faq-item";
        
        const question = currentLang === "en" ? faq.question_en : faq.question_vi;
        const answer = currentLang === "en" ? faq.answer_en : faq.answer_vi;
        
        item.innerHTML = `
            <button class="faq-question">
                <span>${question}</span>
                <i data-lucide="plus" class="faq-icon"></i>
            </button>
            <div class="faq-answer">
                <p>${answer}</p>
            </div>
        `;
        container.appendChild(item);
    });

    initFAQAccordion();
    safeCreateIcons();
}

function initFAQAccordion() {
    document.querySelectorAll(".faq-question").forEach(q => {
        q.addEventListener("click", () => {
            const item = q.parentElement;
            const answer = item.querySelector(".faq-answer");
            const isActive = item.classList.contains("active");
            
            // Close all other items first
            document.querySelectorAll(".faq-item").forEach(fi => {
                fi.classList.remove("active");
                const ans = fi.querySelector(".faq-answer");
                if (ans) ans.style.maxHeight = null;
            });
            
            if (!isActive) {
                item.classList.add("active");
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });
}


// ==========================================================================
// Booking Modal System
// ==========================================================================

const bookingModal = document.getElementById("booking-modal");
const successModal = document.getElementById("success-modal");
const bookingForm = document.getElementById("booking-form");

const serviceSelect = document.getElementById("booking-service");
const branchSelect = document.getElementById("booking-branch");
const dateInput = document.getElementById("booking-date");

// Set minimum date in date picker to today
if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
}

// Open booking modal
function openBookingModal(prefilledService = "", prefilledBranch = "") {
    if (serviceSelect && prefilledService) {
        serviceSelect.value = prefilledService;
    }
    if (branchSelect && prefilledBranch) {
        branchSelect.value = prefilledBranch;
    }
    if (bookingModal) {
        bookingModal.classList.add("active");
    }
    document.body.style.overflow = "hidden"; // Prevent background scroll
}

// Close booking modal
function closeBookingModal() {
    if (bookingModal) {
        bookingModal.classList.remove("active");
    }
    document.body.style.overflow = "auto";
    if (bookingForm) {
        bookingForm.reset();
    }
}

// Open booking triggers
document.querySelectorAll(".btn-book-now, #hero-book-btn, #cta-book-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        openBookingModal();
    });
});

// Click handlers are bound inside bindSelectServiceButtons during renderServices()

document.querySelectorAll(".btn-book-branch").forEach(btn => {
    btn.addEventListener("click", () => {
        const branch = btn.getAttribute("data-branch");
        openBookingModal("", branch);
    });
});

// Close buttons
const modalClose = document.getElementById("modal-close");
if (modalClose) {
    modalClose.addEventListener("click", closeBookingModal);
}
if (bookingModal) {
    bookingModal.addEventListener("click", (e) => {
        if (e.target === bookingModal) closeBookingModal();
    });
}

// Success Modal closing
function closeSuccessModal() {
    if (successModal) {
        successModal.classList.remove("active");
    }
    document.body.style.overflow = "auto";
}

const successClose = document.getElementById("success-close");
if (successClose) {
    successClose.addEventListener("click", closeSuccessModal);
}
const btnSuccessDone = document.getElementById("btn-success-done");
if (btnSuccessDone) {
    btnSuccessDone.addEventListener("click", closeSuccessModal);
}
if (successModal) {
    successModal.addEventListener("click", (e) => {
        if (e.target === successModal) closeSuccessModal();
    });
}

// Form Submission
if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Extract form data
        const name = document.getElementById("booking-name").value;
        const phone = document.getElementById("booking-phone").value;
        const serviceId = parseInt(serviceSelect.value) || 0;
        const duration = document.getElementById("booking-duration").value;
        const branch = branchSelect.value;
        const date = dateInput.value;
        const time = document.getElementById("booking-time").value;
        
        // Get service title for display
        const serviceObj = (initialData.services || []).find(s => s.id === serviceId);
        const serviceTitle = serviceObj ? (currentLang === 'en' ? serviceObj.title_en : serviceObj.title_vi) : "Dịch vụ";
        
        // Fill in success modal values
        document.getElementById("summary-service-text").innerText = `${serviceTitle} (${duration})`;
        document.getElementById("summary-branch-text").innerText = branch;
        document.getElementById("summary-time-text").innerText = `${date} @ ${time}`;
        
        const bookingData = {
            customer_name: name,
            customer_phone: phone,
            service_id: serviceId,
            date: date,
            time: time
        };

        // Try posting to local api server
        try {
            const res = await fetch("/api/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingData)
            });
            if (res.ok) {
                console.log("Booking saved to server database!");
            } else {
                console.warn("Could not save booking to server, falling back to local storage");
                saveBookingToLocalFallback(bookingData);
            }
        } catch (err) {
            console.warn("API booking connection failed, saving to local storage fallback", err);
            saveBookingToLocalFallback(bookingData);
        }

        // Hide booking modal, show success modal
        closeBookingModal();
        if (successModal) {
            successModal.classList.add("active");
        }
        document.body.style.overflow = "hidden";
    });
}

function saveBookingToLocalFallback(booking) {
    let localBookings = [];
    try {
        localBookings = JSON.parse(localStorage.getItem("anspa_public_bookings")) || [];
    } catch (e) {
        localBookings = [];
    }
    
    // Add id
    const nextId = localBookings.length > 0 ? Math.max(...localBookings.map(b => b.id)) + 1000 : 1000;
    
    // Fetch service title and price from initialData
    const serviceObj = (initialData.services || []).find(s => s.id === booking.service_id);
    const serviceTitle = serviceObj ? serviceObj.title_vi : "Dịch vụ đã chọn";
    const servicePriceStr = serviceObj ? serviceObj.price : "0";
    const servicePrice = parseInt(servicePriceStr.replace(/[^0-9]/g, "")) || 0;
    
    localBookings.push({
        id: nextId,
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone,
        service_id: booking.service_id,
        service_title: serviceTitle,
        price: servicePrice,
        date: booking.date,
        time: booking.time,
        assigned_staff_id: null,
        commission_value: 0,
        status: "Pending",
        is_local_only: true
    });
    
    localStorage.setItem("anspa_public_bookings", JSON.stringify(localBookings));
}

// ==========================================================================
// Service Details Popup Modal Controller
// ==========================================================================
const serviceDetailsModal = document.getElementById("service-details-modal");

function openServiceDetailsModal(id) {
    const s = (initialData.services || []).find(item => item.id === id);
    if (!s) return;
    
    const title = currentLang === 'en' ? s.title_en : s.title_vi;
    const desc = currentLang === 'en' ? s.desc_en : s.desc_vi;
    const steps = currentLang === 'en' ? (s.steps_en || []) : (s.steps_vi || []);
    
    document.getElementById("detail-modal-title").innerText = title;
    document.getElementById("detail-modal-desc").innerText = desc;
    document.getElementById("detail-modal-image").src = s.image;
    document.getElementById("detail-modal-image").alt = title;
    
    const categoryMap = {
        facial: currentLang === 'en' ? "Facial Care" : "Chăm Sóc Da Mặt",
        body: currentLang === 'en' ? "Body Care" : "Chăm Sóc Toàn Thân"
    };
    document.getElementById("detail-modal-category").innerText = categoryMap[s.category] || s.category;
    document.getElementById("detail-modal-duration").innerText = s.duration;
    document.getElementById("detail-modal-price").innerText = s.price;
    
    // Populate steps list
    const stepsContainer = document.getElementById("detail-modal-steps");
    stepsContainer.innerHTML = "";
    
    if (steps.length === 0) {
        stepsContainer.innerHTML = `<div style="color:var(--text-gray); font-style:italic;">Đang cập nhật các bước trải nghiệm / Therapy steps updating...</div>`;
    } else {
        steps.forEach(step => {
            const stepDiv = document.createElement("div");
            stepDiv.style.display = "flex";
            stepDiv.style.gap = "12px";
            stepDiv.style.alignItems = "flex-start";
            
            // Extract step number (e.g. "Bước 1:" or "Step 1:") and content
            const parts = step.split(":");
            let numPart = "";
            let textPart = step;
            if (parts.length > 1) {
                numPart = parts[0] + ":";
                textPart = parts.slice(1).join(":").trim();
            }
            
            stepDiv.innerHTML = `
                <div style="font-weight: 700; color: var(--accent-gold); white-space: nowrap; font-size: 14px;">${numPart}</div>
                <div style="color: var(--text-dark); font-size: 14px; font-weight: 300; line-height: 1.5;">${textPart}</div>
            `;
            stepsContainer.appendChild(stepDiv);
        });
    }
    
    // Bind book button in details modal
    const bookBtn = document.getElementById("detail-modal-btn-book");
    // Remove previous event listeners by cloning
    const newBookBtn = bookBtn.cloneNode(true);
    bookBtn.parentNode.replaceChild(newBookBtn, bookBtn);
    
    newBookBtn.innerText = currentLang === 'en' ? "Book Now" : "Đặt Lịch Ngay";
    newBookBtn.addEventListener("click", () => {
        closeServiceDetailsModal();
        openBookingModal(s.title_en);
    });
    
    // Open modal
    if (serviceDetailsModal) {
        serviceDetailsModal.classList.add("active");
        document.body.style.overflow = "hidden";
    }
}

function closeServiceDetailsModal() {
    if (serviceDetailsModal) {
        serviceDetailsModal.classList.remove("active");
        document.body.style.overflow = "";
    }
}

// Bind close triggers
const detailModalClose = document.getElementById("detail-modal-close");
const detailModalBtnClose = document.getElementById("detail-modal-btn-close");

if (detailModalClose) detailModalClose.addEventListener("click", closeServiceDetailsModal);
if (detailModalBtnClose) detailModalBtnClose.addEventListener("click", closeServiceDetailsModal);

// Close modal on background click
if (serviceDetailsModal) {
    serviceDetailsModal.addEventListener("click", (e) => {
        if (e.target === serviceDetailsModal) {
            closeServiceDetailsModal();
        }
    });
}
