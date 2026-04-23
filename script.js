const appContainer = document.getElementById('app');
const RENDER_URL = "https://peonybackend.onrender.com";

// Persistence for the UI elements
appContainer.innerHTML = `
    <div class="view">
        <div id="main-progress" class="progress-container" style="display: none;">
            <div id="p-bar" class="progress-fill"></div>
        </div>
        <div id="dynamic-content"></div>
    </div>
`;

// Global state for auto-filling reviews
let currentFoundPlace = { name: "", address: "" }; 

const contentArea = document.getElementById('dynamic-content');
const progressBar = document.getElementById('main-progress');
const pFill = document.getElementById('p-bar');

const resultOptions = {
    'glow': { title: "CLEAN GIRL", service: "HYDRATING FACIAL & LED", searchService: "Spa", shop: "SKINCARE BOUTIQUE", searchShop: "Skincare Store", tip: "WEAR YOUR FAVORITE GLOSS!", img: "images/glow/glow.jpg" },
    'retro': { title: "TIMELESS VIBES", service: "CLASSIC BLOWOUT", searchService: "Hair Salon", shop: "THRIFTING OR VINTAGE STORE", searchShop: "Thrift Store", tip: "BRING A DIGITAL CAMERA!", img: "images/retro/retro.jpeg" },
    'zen': { title: "MINDFUL MORNING", service: "MEDITATION & SOUND BATH", searchService: "Sound Bath", shop: "CRYSTAL & CANDLE SHOP", searchShop: "Crystal Store", tip: "SPEND TIME IN NATURE! ", img: "images/zen/zen.png" },
    'power': { title: "MAIN CHARACTER ENERGY", service: "BROWS & LASH LIFT", searchService: "Lash Lift", shop: "DESIGNER STORES", searchShop: "Designer Store", tip: "GOLD HOOPS ARE A MUST!", img: "images/power/power.jpg" },
    'cozy': { title: "SOFT GIRL SUNDAY", service: "HEAD MASSAGE", searchService: "Massage", shop: "BOOKSTORE", searchShop: "Bookstore", tip: "GIVE HUGS TODAY!", img: "images/cozy/cozy.jpg" },
    'edge': { title: "CHIC CITY EDGE", service: "GRAPHIC NAIL ART", searchService: "Nail Salon", shop: "STREETWEAR STORE", searchShop: "Streetwear Store", tip: "GO OUT THIS WEEKEND!", img: "images/edge/edge.jpg" }
};

let state = {
    step: 0, 
    scores: { glow: 0, retro: 0, zen: 0, power: 0, cozy: 0, edge: 0 }
};

const questions = [
    { text: "YOUR MORNING BEVERAGE?", options: [{ text: "ICED MATCHA", cat: "glow" }, { text: "ESPRESSO", cat: "power" }, { text: "HERBAL TEA", cat: "zen" }, { text: "OAT LATTE", cat: "cozy" }] },
    { text: "PICK A PALETTE:", options: [{ text: "PASTELS & CREAM", cat: "glow" }, { text: "CHROME & NEON", cat: "edge" }, { text: "EARTH TONES", cat: "zen" }, { text: "CHERRY & BLACK", cat: "retro" }] },
    { text: "HOW DO YOU RECHARGE?", options: [{ text: "A LONG WALK", cat: "zen" }, { text: "ONLINE SHOPPING", cat: "power" }, { text: "NAPS WITH SILK PILLOWCASES", cat: "cozy" }, { text: "CREATIVE DIY", cat: "retro" }] },
    { text: "EVENING PLAN?", options: [{ text: "SKINCARE & MOVIE", cat: "glow" }, { text: "CLUBBING IN THE CITY", cat: "edge" }, { text: "DINNER PARTY", cat: "power" }, { text: "READING IN BED", cat: "cozy" }] },
    { text: "SIGNATURE PIECE?", options: [{ text: "GOLD HOOPS", cat: "power" }, { text: "VINTAGE SCARF", cat: "retro" }, { text: "TIGER'S EYE NECKLACE", cat: "zen" }, { text: "CHUNKY HEADPHONES", cat: "edge" }] },
    { text: "IN YOUR BAG?", options: [{ text: "LIP COMBO", cat: "glow" }, { text: "FILM CAMERA", cat: "retro" }, { text: "BUBBLEGUM", cat: "power" }, { text: "HAND CREAM", cat: "cozy" }] },
    { text: "IDEAL MOVEMENT?", options: [{ text: "PILATES", cat: "glow" }, { text: "YOGA", cat: "zen" }, { text: "EXPLORING THE CITY", cat: "edge" }, { text: "DANCING TO MUSIC", cat: "retro" }] },
    { text: "PICK A TEXTURE:", options: [{ text: "SILK", cat: "glow" }, { text: "LEATHER", cat: "edge" }, { text: "LINEN", cat: "zen" }, { text: "CASHMERE", cat: "cozy" }] },
    { text: "FLORAL VIBE?", options: [{ text: "PEONIES", cat: "glow" }, { text: "LAVENDER", cat: "zen" }, { text: "ROSES", cat: "retro" }, { text: "BABY'S BREATH", cat: "cozy" }] },
    { text: "DREAM ESCAPE?", options: [{ text: "PARIS", cat: "power" }, { text: "TOKYO", cat: "edge" }, { text: "BALI", cat: "zen" }, { text: "LONDON", cat: "retro" }] }
];

// --- LOGIC FUNCTIONS ---

async function findNearby(type) {
    const status = document.getElementById('search-status');
    status.innerHTML = "FINDING LOCATIONS...";

    const winner = Object.keys(state.scores).reduce((a, b) => state.scores[a] > state.scores[b] ? a : b);
    const data = resultOptions[winner];
    let searchQuery = type === 'service' ? (data.searchService || data.service) : (data.searchShop || data.shop);

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const url = `${RENDER_URL}/find-place?query=${encodeURIComponent(searchQuery)}&lat=${latitude}&lng=${longitude}`;
        
        try {
            const response = await fetch(url);
            const resultData = await response.json();
            
            if (resultData.places && resultData.places.length > 0) {
                const place = resultData.places[0];
                
                // Store Google data for auto-fill
                currentFoundPlace.name = place.displayName.text;
                currentFoundPlace.address = place.formattedAddress;

                status.innerHTML = `
                    <div class="suggestion-box" onclick="showReviewModal()">
                        SUGGESTED: <strong>${currentFoundPlace.name.toUpperCase()}</strong><br>
                        ${currentFoundPlace.address.toUpperCase()}
                        <div style="font-size: 0.6rem; margin-top: 5px; opacity: 0.7;">CLICK TO REVIEW</div>
                    </div>`;
            } else {
                status.innerText = "NO NEARBY SPOTS FOUND.";
            }
        } catch (err) {
            status.innerText = "SERVER ERROR. RETRYING...";
        }
    });
}

function showReviewModal() {
    const modal = document.createElement('div');
    modal.id = "review-modal";
    modal.className = "modal-overlay"; // Styled in CSS as a rectangle overlay
    modal.innerHTML = `
        <div class="quiz-card" style="max-width: 320px; border: 4px solid var(--espresso); position: relative;">
            <h2 style="font-family: 'Archivo Black'; font-size: 1.1rem;">DID YOU TRY IT?</h2>
            <p style="font-size: 0.8rem; margin-bottom: 20px;">WANT TO LEAVE A REVIEW FOR<br><strong>${currentFoundPlace.name}</strong>?</p>
            <div style="display: flex; gap: 10px;">
                <button class="btn-opt" style="margin:0; flex:1" onclick="openReviewForm()">YES</button>
                <button class="btn-opt" style="margin:0; flex:1" onclick="closeModal()">NO</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeModal() {
    const modal = document.getElementById('review-modal');
    if (modal) modal.remove();
}

function openReviewForm() {
    closeModal();
    progressBar.style.display = 'none';
    
    contentArea.innerHTML = `
        <div class="quiz-card">
            <h2 style="font-family: 'Archivo Black'">LEAVE A REVIEW</h2>
            <p style="font-size: 0.7rem; margin-bottom: 15px; opacity: 0.8; text-align: left;">
                <strong>PLACE:</strong> ${currentFoundPlace.name}<br>
                <strong>ADDRESS:</strong> ${currentFoundPlace.address}
            </p>
            
            <input type="text" id="rev-name" placeholder="YOUR NAME" class="btn-opt" style="text-align:left; padding-left:15px;">
            <input type="date" id="rev-date" class="btn-opt" style="padding-left:15px;">
            
            <textarea id="rev-text" placeholder="HOW WAS THE VIBE?" class="btn-opt" style="height:100px; padding: 15px; text-align:left;"></textarea>
            
            <select id="rev-rating" class="btn-opt" style="padding-left:15px;">
                <option value="5">5 STARS - PEAK VIBE</option>
                <option value="4">4 STARS</option>
                <option value="3">3 STARS</option>
                <option value="2">2 STARS</option>
                <option value="1">1 STAR</option>
            </select>

            <button class="btn-main" onclick="submitFinalReview()">SUBMIT REVIEW</button>
        </div>
    `;
}

async function submitFinalReview() {
    const winner = Object.keys(state.scores).reduce((a, b) => state.scores[a] > state.scores[b] ? a : b);
    const reviewData = {
        name: document.getElementById('rev-name').value,
        date: document.getElementById('rev-date').value,
        review: document.getElementById('rev-text').value,
        rating: document.getElementById('rev-rating').value,
        place: `${currentFoundPlace.name} (${currentFoundPlace.address})`,
        vibe: winner
    };

    try {
        const response = await fetch(`${RENDER_URL}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
        });
        
        const savedReview = await response.json();

        // Check if we actually got an ID back from Postgres
        if (savedReview && savedReview.id) {
            let myReviews = JSON.parse(localStorage.getItem('myPeonyReviews') || "[]");
            myReviews.push(savedReview.id);
            localStorage.setItem('myPeonyReviews', JSON.stringify(myReviews));
        }

        alert("Review shared!");
        reset();
    } catch (err) { 
        console.error("Submit error:", err);
        alert("Error saving review."); 
    }
}

// --- NEW: Global variable to store reviews for filtering ---
let allReviews = [];

async function viewReviews() {
    try {
        const res = await fetch(`${RENDER_URL}/reviews`);
        allReviews = await res.json();
        
        progressBar.style.display = 'none';
        
        contentArea.innerHTML = `
            <h2 style="font-family: 'Archivo Black'">COMMUNITY FEED</h2>
            
            <div class="filter-container">
                <div class="search-wrapper">
                    <input type="text" id="review-search" placeholder="SEARCH KEYWORDS..." class="btn-opt">
                    <button class="search-inside-btn" onclick="applyFilters()">SEARCH</button>
                </div>

                <select id="sort-stars" onchange="applyFilters()" class="btn-opt" style="margin:0;">
                    <option value="newest">NEWEST FIRST</option>
                    <option value="high">RATING: HIGH TO LOW</option>
                    <option value="low">RATING: LOW TO HIGH</option>
                </select>
            </div>

            <div id="reviews-list">
                </div>
            
            <button class="btn-main" onclick="reset()">BACK TO HOME</button>
        `;

        // Add the Enter key listener again for better UX
        document.getElementById('review-search').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') applyFilters();
        });

        applyFilters(); // Initial load

    } catch (e) { 
        alert("The feed is waking up..."); 
    }
}

// This function handles the actual searching/sorting logic
function applyFilters() {
    const searchTerm = document.getElementById('review-search').value.toLowerCase();
    const sortVal = document.getElementById('sort-stars').value;
    const listContainer = document.getElementById('reviews-list');

    // --- NEW: Get the list of IDs owned by this specific browser ---
    const myOwnedIds = JSON.parse(localStorage.getItem('myPeonyReviews') || "[]");

    // 1. Filter Logic
    let filtered = allReviews.filter(r => {
        return r.username.toLowerCase().includes(searchTerm) || 
               r.review_text.toLowerCase().includes(searchTerm) || 
               r.place_name.toLowerCase().includes(searchTerm);
    });

    // 2. Sort Logic
    if (sortVal === "high") {
        filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortVal === "low") {
        filtered.sort((a, b) => a.rating - b.rating);
    } else {
        // Default: Newest first (by ID)
        filtered.sort((a, b) => b.id - a.id);
    }

    // 3. Render the Cards
    listContainer.innerHTML = filtered.length === 0 ? '<p style="margin-top:20px;">NO REVIEWS MATCH YOUR SEARCH.</p>' : 
    filtered.map(r => {
        const dateObj = new Date(r.visit_date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            month: 'short', day: 'numeric', year: 'numeric' 
        });

        // Check if THIS specific review was made by THIS user
        const isMine = myOwnedIds.includes(r.id);

        return `
            <div class="quiz-card" style="margin-bottom:20px; text-align:left; width: 100%; padding: 20px; box-sizing: border-box; position: relative;">
                <div style="display:flex; justify-content:space-between; align-items: flex-start;">
                    <div>
                        <strong style="font-size: 1.1rem;">${r.username.toUpperCase()}</strong><br>
                        <small style="opacity: 0.6;">VISITED: ${formattedDate}</small>
                    </div>
                    <div style="text-align: right;">
                        <span style="letter-spacing: 2px; display: block; margin-bottom: 5px;">${"⭐".repeat(r.rating)}</span>
                        
                        ${isMine ? `
                            <button onclick="confirmDelete(${r.id})" 
                                style="background:none; border:none; color:var(--espresso); cursor:pointer; font-size:0.6rem; text-decoration:underline; opacity:0.6; padding:0;">
                                DELETE MY POST
                            </button>
                        ` : ''}
                    </div>
                </div>

                <p style="margin: 15px 0 5px 0; font-size: 0.85rem; font-weight: 700;">
                    📍 ${r.place_name.toUpperCase()}
                </p>
                <p style="font-style: italic; font-size: 0.9rem; line-height: 1.4;">"${r.review_text}"</p>
                
                <div style="margin-top: 10px;">
                    <span style="font-size: 0.6rem; background: var(--espresso); color: var(--peony); padding: 3px 8px; border-radius: 20px; font-weight:700;">
                        ${r.vibe_category.toUpperCase()} VIBE
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

async function confirmDelete(id) {
    if (confirm("ARE YOU SURE YOU WANT TO REMOVE THIS REVIEW?")) {
        try {
            const response = await fetch(`${RENDER_URL}/reviews/${id}`, { 
                method: 'DELETE' 
            });

            if (response.ok) {
                // 1. Clean up Local Storage
                let myReviews = JSON.parse(localStorage.getItem('myPeonyReviews') || "[]");
                myReviews = myReviews.filter(reviewId => reviewId !== id);
                localStorage.setItem('myPeonyReviews', JSON.stringify(myReviews));
                
                // 2. Update the local variable so applyFilters() doesn't show it
                allReviews = allReviews.filter(r => r.id !== id);
                
                // 3. Re-render the feed
                applyFilters();
                
                alert("REVIEW DELETED.");
            } else {
                alert("FAILED TO DELETE ON SERVER.");
            }
        } catch (err) {
            console.error("Delete Error:", err);
            alert("COULD NOT DELETE AT THIS TIME.");
        }
    }
}

// --- CORE ENGINE ---

function render() {
    if (state.step === 0) {
        progressBar.style.display = 'none';
        contentArea.innerHTML = `
            <h1 class="logo-text">PEONY</h1>
            <p style="letter-spacing: 3px; font-weight: 700;">WELLNESS CURATOR</p>
            <div style="display:flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <button class="btn-main" onclick="nextStep()">START YOUR DAY</button>
                <button class="btn-main" style="background: var(--white); color: var(--espresso); border: 3px solid var(--espresso);" onclick="viewReviews()">SEE FEED</button>
            </div>
        `;
    } else if (state.step <= questions.length) {
        const q = questions[state.step - 1];
        const progressPercent = ((state.step - 1) / questions.length) * 100;
        progressBar.style.display = 'block';
        pFill.style.width = `${progressPercent}%`;

        contentArea.innerHTML = `
            <div class="quiz-card">
                <h2 style="font-family: 'Archivo Black'">${q.text}</h2>
                ${q.options.map(o => `<button class="btn-opt" onclick="recordAnswer('${o.cat}')">${o.text}</button>`).join('')}
            </div>
        `;
    } else {
        progressBar.style.display = 'none';
        const winner = Object.keys(state.scores).reduce((a, b) => state.scores[a] > state.scores[b] ? a : b);
        const data = resultOptions[winner];
        
        contentArea.innerHTML = `
            <div class="itinerary-card">
                <h2 style="font-family: 'Archivo Black'">${data.title}</h2>
                <img src="${data.img}" class="result-img">
                <div class="item" onclick="findNearby('service')" style="cursor:pointer">
                    <strong>SERVICE:</strong> ${data.service} 📍
                </div>
                <div class="item" onclick="findNearby('shop')" style="cursor:pointer">
                    <strong>RETAIL:</strong> ${data.shop} 📍
                </div>
                <div id="search-status" style="font-size:0.75rem; font-weight:700; margin-top:15px; min-height: 1em;"></div>
                <button class="btn-main" onclick="reset()">RESTART</button>
            </div>
        `;
    }
}

window.nextStep = () => { state.step++; render(); };
window.recordAnswer = (cat) => { state.scores[cat]++; state.step++; render(); };
window.reset = () => { state.step = 0; state.scores = { glow: 0, retro: 0, zen: 0, power: 0, cozy: 0, edge: 0 }; render(); };

render();

// CHEAT KEYS
window.addEventListener('keydown', (e) => {
    if (state.step === 0) {
        const keys = { '1': 'glow', '2': 'retro', '3': 'zen', '4': 'power', '5': 'cozy', '6': 'edge' };
        if (keys[e.key]) {
            Object.keys(state.scores).forEach(v => state.scores[v] = 0);
            state.scores[keys[e.key]] = 100;
            state.step = questions.length + 1;
            render();
        }
    }
});