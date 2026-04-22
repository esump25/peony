const appContainer = document.getElementById('app');
const RENDER_URL = "https://peonybackend.onrender.com";
appContainer.innerHTML = `
    <div class="view">
        <div id="main-progress" class="progress-container" style="display: none;">
            <div id="p-bar" class="progress-fill"></div>
        </div>
        <div id="dynamic-content"></div>
    </div>
`;

const contentArea = document.getElementById('dynamic-content');
const progressBar = document.getElementById('main-progress');
const pFill = document.getElementById('p-bar');
const resultOptions = {
    'glow': { title: "CLEAN GIRL", service: "HYDRATING FACIAL & LED", shop: "SKINCARE BOUTIQUE", tip: "WEAR YOUR FAVORITE GLOSS!", img: "images/glow/glow.jpg" },
    'retro': { title: "TIMELESS VIBES", service: "CLASSIC BLOWOUT", shop: "THRIFTING OR VINTAGE STORE", tip: "BRING A DIGITAL CAMERA!", img: "images/retro/retro.jpeg" },
    'zen': { title: "MINDFUL MORNING", service: "MEDITATION & SOUND BATH", shop: "CRYSTAL & CANDLE SHOP", tip: "SPEND TIME IN NATURE! ", img: "images/zen/zen.png" },
    'power': { title: "MAIN CHARACTER ENERGY", service: "BROWS & LASH LIFT", shop: "DESIGNER STORES", tip: "GOLD HOOPS ARE A MUST!", img: "images/power/power.jpg" },
    'cozy': { title: "SOFT GIRL SUNDAY", service: "HEAD MASSAGE", shop: "BOOKSTORE & MATCHA BAR", tip: "GIVE HUGS TODAY!", img: "images/cozy/cozy.jpg" },
    'edge': { title: "CHIC CITY EDGE", service: "GRAPHIC NAIL ART", shop: "STREETWEAR STORE", tip: "GO OUT THIS WEEKEND!", img: "images/edge/edge.jpg" }
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

async function findNearby(type) {
    const status = document.getElementById('search-status');
    status.innerHTML = "FINDING LOCATIONS...";

    // Determine which result the user got
    const winner = Object.keys(state.scores).reduce((a, b) => state.scores[a] > state.scores[b] ? a : b);
    const data = resultOptions[winner];
    const searchQuery = type === 'service' ? data.service : data.shop;

    // 1. Ask for user's GPS coordinates
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        // 2. Call your PRIVATE Render backend (NOT Google directly)
        const url = `${RENDER_URL}/find-place?query=${encodeURIComponent(searchQuery)}&lat=${latitude}&lng=${longitude}`;
        
        try {
            const response = await fetch(url);
            const resultData = await response.json();
            
            if (resultData.places && resultData.places.length > 0) {
                const place = resultData.places[0];
                status.innerHTML = `SUGGESTED: <strong>${place.displayName.text.toUpperCase()}</strong><br>${place.formattedAddress.toUpperCase()}`;
            } else {
                status.innerText = "NO PLACES FOUND NEARBY.";
            }
        } catch (err) {
            status.innerText = "SERVER IS WAKING UP... PLEASE TRY AGAIN IN 30s.";
        }
    }, () => {
        status.innerText = "LOCATION ACCESS DENIED. PLEASE ENABLE PERMISSIONS.";
    });
}

function render() {
    if (state.step === 0) {
        progressBar.style.display = 'none';
        contentArea.innerHTML = `
            <h1 class="logo-text">PEONY</h1>
            <p style="letter-spacing: 3px; font-weight: 700;">WELLNESS CURATOR</p>
            <button class="btn-main" onclick="nextStep()">START YOUR DAY</button>
        `;
    } else if (state.step <= questions.length) {
        progressBar.style.display = 'block';
        const q = questions[state.step - 1];
        
        // Update progress bar width smoothly
        const progressPercent = ((state.step - 1) / questions.length) * 100;
        pFill.style.width = `${progressPercent}%`;

        contentArea.innerHTML = `
            <div class="quiz-card">
                <h2 style="font-family: 'Archivo Black'">${q.text}</h2>
                ${q.options.map(o => `<button class="btn-opt" onclick="recordAnswer('${o.cat}')">${o.text}</button>`).join('')}
            </div>
        `;
    } else {
        // Result Screen
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
                <p id="search-status" style="font-size:0.75rem; font-weight:700; margin-top:15px;"></p>
                <button class="btn-main" onclick="reset()">RESTART</button>
            </div>
        `;
    }
}

window.nextStep = () => { state.step++; render(); };
window.recordAnswer = (cat) => { state.scores[cat]++; state.step++; render(); };
window.reset = () => { state.step = 0; state.scores = { glow: 0, retro: 0, zen: 0, power: 0, cozy: 0, edge: 0 }; render(); };

render();

// CHEAT KEYS: Press 1-6 on the Welcome Screen to jump to results
window.addEventListener('keydown', (e) => {
    // Only allow cheats on the Welcome Screen (step 0)
    if (state.step === 0) {
        const keys = {
            '1': 'glow',
            '2': 'retro',
            '3': 'zen',
            '4': 'power',
            '5': 'cozy',
            '6': 'edge'
        };

        if (keys[e.key]) {
            console.log(`Cheat Activated: Jumping to ${keys[e.key]}`);
            
            // 1. Set the scores so the logic picks the right winner
            // We reset all to 0, then give the "cheated" vibe 100 points
            Object.keys(state.scores).forEach(v => state.scores[v] = 0);
            state.scores[keys[e.key]] = 100;

            // 2. Jump straight to the results step
            state.step = questions.length + 1;
            
            // 3. Refresh the screen
            render();
        }
    }
});