// ===============================
// Get elements from the HTML page
// ===============================

// Form used to search music
const searchForm = document.querySelector("#searchForm");

// Input box where user types song name
const searchInput = document.querySelector("#searchInput");

// Container where search results will appear
const resultList = document.querySelector("#resultList");

// Text area for status messages
const statusText = document.querySelector("#statusText");

// Music player UI elements
const coverArt = document.querySelector("#coverArt");
const sourceLabel = document.querySelector("#sourceLabel");
const trackTitle = document.querySelector("#trackTitle");
const trackArtist = document.querySelector("#trackArtist");

// Audio element used to play music
const audioPlayer = document.querySelector("#audioPlayer");

// Play/Pause buttons
const playButton = document.querySelector("#playButton");
const pauseButton = document.querySelector("#pauseButton");

// ===============================
// API URL
// ===============================

// iTunes API used to search songs
const apiUrl = "https://itunes.apple.com/search";

// ===============================
// Demo songs (used if API fails)
// ===============================

const demoTracks = [
    {
        title: "Sunny Classroom Beat",
        artist: "JavaScript Demo",
        mood: "happy",
        color: "#f6c453",
        note: 262
    },
    {
        title: "Focus Mode Loops",
        artist: "Code Studio",
        mood: "focus",
        color: "#9ad7ca",
        note: 330
    },
    {
        title: "Soft Study Night",
        artist: "HTML CSS Band",
        mood: "study",
        color: "#c8b6ff",
        note: 392
    }
];

// ============================================
// Create a simple sound using JavaScript only
// ============================================

// This function generates a WAV sound dynamically
// using a frequency number (musical note)
function makeTone(frequency) {

    const sampleRate = 44100; // audio quality
    const seconds = 2; // sound duration
    const samples = sampleRate * seconds;

    // Create audio byte array
    const bytes = new Uint8Array(44 + samples * 2);

    const view = new DataView(bytes.buffer);

    // WAV file headers
    writeText(bytes, 0, "RIFF");
    view.setUint32(4, 36 + samples * 2, true);

    writeText(bytes, 8, "WAVEfmt ");
    view.setUint32(16, 16, true);

    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, 1, true); // mono audio

    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);

    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);

    writeText(bytes, 36, "data");
    view.setUint32(40, samples * 2, true);

    // Generate sound wave
    for (let i = 0; i < samples; i++) {

        // Sine wave calculation
        const wave =
            Math.sin((i / sampleRate) * frequency * Math.PI * 2);

        // Reduce sound gradually (fade out)
        const fade = 1 - i / samples;

        // Save audio sample
        view.setInt16(
            44 + i * 2,
            wave * fade * 24000,
            true
        );
    }

    // Convert bytes into string
    let binary = "";

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    // Return playable audio URL
    return `data:audio/wav;base64,${btoa(binary)}`;
}

// ============================================
// Write text into byte array
// ============================================

// Used when creating WAV file headers
function writeText(bytes, start, text) {

    for (let i = 0; i < text.length; i++) {
        bytes[start + i] = text.charCodeAt(i);
    }
}

// ============================================
// Clean special HTML characters
// ============================================

// Converts &quot; into "
// Converts &amp; into &
function cleanText(text) {

    return String(text)
        .replaceAll("&quot;", '"')
        .replaceAll("&amp;", "&");
}

// ============================================
// Play selected track
// ============================================

function playTrack(track, autoPlay = true) {

    // Update UI text
    trackTitle.textContent = cleanText(track.title);
    trackArtist.textContent = track.artist;
    sourceLabel.textContent = track.source;

    // Set audio source
    audioPlayer.src = track.audio;

    // Set cover design
    coverArt.style.background = track.color;
    coverArt.textContent = track.icon;

    // If image exists, show image instead of icon
    if (track.image) {

        coverArt.style.backgroundImage =
            `url(${track.image})`;

        coverArt.style.backgroundSize = "cover";

        coverArt.textContent = "";

    } else {

        coverArt.style.backgroundImage = "";
    }

    // Automatically play music
    if (autoPlay) {
        audioPlayer.play();
    }
}

// ============================================
// Show tracks on screen
// ============================================

function renderTracks(tracks) {

    // Clear old results
    resultList.innerHTML = "";

    // Create card for every song
    tracks.forEach(track => {

        const card = document.createElement("article");

        card.className = "track-card";

        // Track HTML
        card.innerHTML = `
            <div class="track-icon">${track.icon}</div>

            <div>
                <h3>${cleanText(track.title)}</h3>
                <p>${track.artist}</p>
            </div>

            <button>Play</button>
        `;

        // Play selected song
        card.querySelector("button")
            .addEventListener("click", () => {
                playTrack(track);
            });

        // Add card to page
        resultList.appendChild(card);
    });
}

// ============================================
// Create demo search results
// ============================================

function getDemoResults(searchText) {

    const query = searchText.toLowerCase();

    // Filter matching tracks
    const results = demoTracks.filter(track =>
        track.title.toLowerCase().includes(query) ||
        track.mood.includes(query)
    );

    // If no result found, show all tracks
    const tracks =
        results.length ? results : demoTracks;

    // Convert demo tracks into playable tracks
    return tracks.map(track => ({

        title: track.title,
        artist: track.artist,

        // Generate fake audio
        audio: makeTone(track.note),

        color: track.color,
        icon: "♪",

        source: "Demo Track"
    }));
}

// ============================================
// Search music using iTunes API
// ============================================

async function searchMusic(searchText) {

    statusText.textContent = "Searching music...";

    try {

        // API request
        const response = await fetch(
            `${apiUrl}?term=${encodeURIComponent(searchText)}&media=music&entity=song&limit=12`
        );

        // Check API success
        if (!response.ok) {
            throw new Error("API error");
        }

        // Convert response to JSON
        const data = await response.json();

        // Convert API songs into app format
        const tracks = data.results
            .map(song => ({

                title: song.trackName,
                artist: song.artistName,

                // Preview audio
                audio: song.previewUrl,

                // Large album image
                image: song.artworkUrl100
                    ?.replace("100x100", "600x600"),

                color: "#f6c453",
                icon: "♪",

                source: "iTunes Preview"
            }))

            // Remove tracks without audio
            .filter(track => track.audio);

        // If no songs found
        if (!tracks.length) {
            throw new Error("No playable tracks");
        }

        // Update status
        statusText.textContent =
            "Showing real music previews.";

        // Display songs
        renderTracks(tracks);

        // Play first song
        playTrack(tracks[0]);

    } catch (error) {

        // If API fails -> use demo tracks
        const demoResults =
            getDemoResults(searchText);

        statusText.textContent =
            "API unavailable. Showing demo tracks.";

        renderTracks(demoResults);

        playTrack(demoResults[0]);

        console.log(error);
    }
}

// ============================================
// Form submit event
// ============================================

searchForm.addEventListener("submit", event => {

    // Prevent page reload
    event.preventDefault();

    // Start search
    searchMusic(
        searchInput.value.trim() || "happy"
    );
});

// ============================================
// Play button
// ============================================

playButton.addEventListener("click", () => {
    audioPlayer.play();
});

// ============================================
// Pause button
// ============================================

pauseButton.addEventListener("click", () => {
    audioPlayer.pause();
});

// ============================================
// Load demo tracks on page start
// ============================================

const firstTracks = getDemoResults("");

renderTracks(firstTracks);

// Show first track without autoplay
playTrack(firstTracks[0], false);
