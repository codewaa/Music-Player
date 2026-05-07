const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const resultList = document.querySelector("#resultList");
const statusText = document.querySelector("#statusText");

const coverArt = document.querySelector("#coverArt");
const sourceLabel = document.querySelector("#sourceLabel");
const trackTitle = document.querySelector("#trackTitle");
const trackArtist = document.querySelector("#trackArtist");
const audioPlayer = document.querySelector("#audioPlayer");
const playButton = document.querySelector("#playButton");
const pauseButton = document.querySelector("#pauseButton");

const apiUrl = "https://itunes.apple.com/search";

const demoTracks = [
    { title: "Sunny Classroom Beat", artist: "JavaScript Demo", mood: "happy", color: "#f6c453", note: 262 },
    { title: "Focus Mode Loops", artist: "Code Studio", mood: "focus", color: "#9ad7ca", note: 330 },
    { title: "Soft Study Night", artist: "HTML CSS Band", mood: "study", color: "#c8b6ff", note: 392 },
    { title: "Tiny Party Pop", artist: "Browser Beats", mood: "party", color: "#ffafcc", note: 440 }
];

function makeTone(frequency) {
    const sampleRate = 44100;
    const seconds = 3;
    const samples = sampleRate * seconds;
    const bytes = new Uint8Array(44 + samples * 2);
    const view = new DataView(bytes.buffer);

    writeText(bytes, 0, "RIFF");
    view.setUint32(4, 36 + samples * 2, true);
    writeText(bytes, 8, "WAVEfmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeText(bytes, 36, "data");
    view.setUint32(40, samples * 2, true);

    for (let i = 0; i < samples; i++) {
        const wave = Math.sin((i / sampleRate) * frequency * Math.PI * 2);
        const fade = 1 - i / samples;
        view.setInt16(44 + i * 2, wave * fade * 24000, true);
    }

    let binary = "";
    bytes.forEach(function (byte) {
        binary += String.fromCharCode(byte);
    });

    return `data:audio/wav;base64,${btoa(binary)}`;
}

function writeText(bytes, start, text) {
    for (let i = 0; i < text.length; i++) {
        bytes[start + i] = text.charCodeAt(i);
    }
}

function cleanText(text) {
    return String(text).replaceAll("&quot;", "\"").replaceAll("&amp;", "&");
}

function playTrack(track, shouldPlay = true) {
    trackTitle.textContent = cleanText(track.title);
    trackArtist.textContent = track.artist;
    sourceLabel.textContent = track.source;
    audioPlayer.src = track.audio;
    coverArt.textContent = track.icon;
    coverArt.style.background = track.color;

    if (track.image) {
        coverArt.style.backgroundImage = `url(${track.image})`;
        coverArt.style.backgroundSize = "cover";
        coverArt.textContent = "";
    } else {
        coverArt.style.backgroundImage = "";
    }

    if (shouldPlay) {
        audioPlayer.play();
    }
}

function renderTracks(tracks) {
    resultList.innerHTML = "";

    tracks.forEach(function (track) {
        const card = document.createElement("article");
        card.className = "track-card";
        card.innerHTML = `
            <div class="track-icon">${track.icon}</div>
            <div>
                <h3>${cleanText(track.title)}</h3>
                <p>${track.artist}</p>
            </div>
            <button type="button">Play</button>
        `;

        card.querySelector("button").addEventListener("click", function () {
            playTrack(track);
        });

        resultList.appendChild(card);
    });
}

function getDemoResults(searchText) {
    const query = searchText.toLowerCase();
    const results = demoTracks.filter(function (track) {
        return track.title.toLowerCase().includes(query) || track.mood.includes(query);
    });

    const tracks = results.length > 0 ? results : demoTracks;

    return tracks.map(function (track) {
        return {
            title: track.title,
            artist: track.artist,
            audio: makeTone(track.note),
            color: track.color,
            icon: "♪",
            source: "Demo Track"
        };
    });
}

async function searchMusic(searchText) {
    statusText.textContent = "Searching music...";

    try {
        const response = await fetch(`${apiUrl}?term=${encodeURIComponent(searchText)}&media=music&entity=song&limit=12`);
        if (!response.ok) {
            throw new Error("API is not responding");
        }

        const data = await response.json();
        const songs = data.results || [];
        const apiTracks = songs.map(function (song) {
            return {
                title: song.trackName,
                artist: song.artistName,
                audio: song.previewUrl,
                image: song.artworkUrl100 ? song.artworkUrl100.replace("100x100", "600x600") : "",
                color: "#f6c453",
                icon: "♪",
                source: "iTunes Preview"
            };
        }).filter(function (track) {
            return track.audio !== "";
        });

        if (apiTracks.length === 0) {
            throw new Error("No playable API result");
        }

        statusText.textContent = "Showing real music previews from the iTunes Search API.";
        renderTracks(apiTracks);
        playTrack(apiTracks[0]);
    } catch (error) {
        const demoResults = getDemoResults(searchText);

        statusText.textContent = "Music API is not available right now, so playable demo tracks are shown.";
        renderTracks(demoResults);
        playTrack(demoResults[0]);
        console.log(error);
    }
}

searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchMusic(searchInput.value.trim() || "happy");
});

playButton.addEventListener("click", function () {
    audioPlayer.play();
});

pauseButton.addEventListener("click", function () {
    audioPlayer.pause();
});

const firstTracks = getDemoResults("");
renderTracks(firstTracks);
playTrack(firstTracks[0], false);
