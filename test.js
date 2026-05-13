// adding Demo Tracks
const demoTracks = [
    {
        title : "Track 1",
        arist : "Artist 1",
        mood : "Happy",
        color : "#FF5733",
        audio : "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"

    },
    {
        title : "Track 2",
        arist : "Artist 2",
        mood : "Sad",
        color : "#33FF57",
        audio : "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"},
    {
        title : "Track 3",
        arist : "Artist 3",
        mood : "Energetic",
        color : "#3357FF",
        audio : "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    },
    {
        title : "Track 4",
        arist : "Artist 4",
        mood : "Calm",
        color : "#FF33A1",
        audio : "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
    }
]

const trackList = document.getElementById("resultList");

demoTracks.forEach(track => {
    const trackElement = document.createElement("div");
    trackElement.classList.add("track");
  
    trackElement.innerHTML = `
        <h3>${track.title}</h3>
        <p>${track.arist}</p>
        <p>${track.mood}</p>
        <audio controls>
            <source src="${track.audio}" type="audio/mpeg">
        </audio>
    `;
    trackList.appendChild(trackElement);
});

const playButton = document.getElementById("playButton");

// play selected audio
playButton.addEventListener("click", () => {
    const audioPlayer = document.getElementById("audioPlayer");
    audioPlayer.play();
});

const pauseButton = document.getElementById("pauseButton");
// pause selected audio
pauseButton.addEventListener("click", () => {
    const audioPlayer = document.getElementById("audioPlayer");
    audioPlayer.pause();
});

// Search using itunes Api
const url = "https://itunes.apple.com/search?term=rock&entity=song&limit=10";

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {
    const query = searchInput.value;
    if (query.length > 2) {
        fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=10`) 
            .then(response => response.json())
            .then(data => {
                const results = data.results;
                trackList.innerHTML = "";
                results.forEach(track => {
                    const trackElement = document.createElement("div");
                    trackElement.classList.add("track");
                    trackElement.innerHTML = `
                        <h3>${track.trackName}</h3>
                        <p>${track.artistName}</p>
                        <p>${track.primaryGenreName}</p>
                        <audio controls>
                            <source src="${track.previewUrl}" type="audio/mpeg">
                        </audio>
                    `;
                    trackList.appendChild(trackElement);
                });
            })
            .catch(error => console.error("Error fetching data:", error));
    }
});
