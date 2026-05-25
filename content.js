// This script runs on YouTube video pages
console.log("YouTube Audio Extension loaded!");

// Function to add our audio controls
function addAudioControls() {
  // Check if controls already exist
  if (document.getElementById("audio-controls-panel")) return;
  
  // Find the video title area (where we'll add our buttons)
  const titleArea = document.querySelector("#above-the-fold #title h1");
  if (!titleArea) return;
  
  // Create our custom panel
  const panel = document.createElement("div");
  panel.id = "audio-controls-panel";
  panel.style.marginTop = "10px";
  panel.style.padding = "10px";
  panel.style.backgroundColor = "#f0f0f0";
  panel.style.borderRadius = "8px";
  panel.style.display = "flex";
  panel.style.gap = "10px";
  
  // Create "Play Audio Only" button
  const playButton = document.createElement("button");
  playButton.textContent = "🎵 Play Audio Only";
  playButton.style.padding = "8px 16px";
  playButton.style.backgroundColor = "#4CAF50";
  playButton.style.color = "white";
  playButton.style.border = "none";
  playButton.style.borderRadius = "4px";
  playButton.style.cursor = "pointer";
  
  // Create "Download M4A (32bit)" button
  const downloadButton = document.createElement("button");
  downloadButton.textContent = "⬇️ Download as M4A (32bit)";
  downloadButton.style.padding = "8px 16px";
  downloadButton.style.backgroundColor = "#2196F3";
  downloadButton.style.color = "white";
  downloadButton.style.border = "none";
  downloadButton.style.borderRadius = "4px";
  downloadButton.style.cursor = "pointer";
  
  // Status message area
  const status = document.createElement("div");
  status.id = "audio-status";
  status.style.marginTop = "8px";
  status.style.fontSize = "12px";
  status.style.color = "#666";
  
  // Add buttons to panel
  panel.appendChild(playButton);
  panel.appendChild(downloadButton);
  
  // Insert after title
  titleArea.parentNode.insertBefore(panel, titleArea.nextSibling);
  titleArea.parentNode.insertBefore(status, panel.nextSibling);
  
  // Get current video ID
  const videoId = new URLSearchParams(window.location.search).get("v");
  
  // Play button handler
  playButton.onclick = () => playAudioOnly(videoId, status);
  
  // Download button handler
  downloadButton.onclick = () => downloadAudio(videoId, status);
}

// Function to play audio only
async function playAudioOnly(videoId, statusElement) {
  statusElement.textContent = "🔍 Getting audio stream...";
  statusElement.style.color = "#ff9800";
  
  try {
    // We'll use a free yt-dlp API service
    const audioUrl = await getAudioStream(videoId);
    if (audioUrl) {
      statusElement.textContent = "▶️ Playing audio...";
      const audio = new Audio(audioUrl);
      audio.play();
    }
  } catch (error) {
    statusElement.textContent = "❌ Error: " + error.message;
    statusElement.style.color = "red";
  }
}

// Function to download audio as M4A
async function downloadAudio(videoId, statusElement) {
  statusElement.textContent = "🔄 Getting audio download URL...";
  statusElement.style.color = "#ff9800";
  
  try {
    const downloadUrl = await getAudioStream(videoId);
    if (downloadUrl) {
      statusElement.textContent = "📥 Downloading...";
      // Trigger download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `youtube-audio-${videoId}.m4a`;
      a.click();
      statusElement.textContent = "✅ Download started!";
      statusElement.style.color = "#4CAF50";
    }
  } catch (error) {
    statusElement.textContent = "❌ Download failed: " + error.message;
    statusElement.style.color = "red";
  }
}

// Function to get audio stream URL
async function getAudioStream(videoId) {
  // Using your own Cloudflare Worker
  // IMPORTANT: Replace this URL with YOUR Cloudflare Worker URL!
  const apiUrl = `https://youtube-audio-api.pages.dev/audio/${videoId}`;
  
  console.log("Fetching audio from:", apiUrl);
  
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("API Response:", data);
    
    if (data && data.audioUrl) {
      return data.audioUrl;
    } else {
      throw new Error("No audio URL in response");
    }
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Could not extract audio: " + error.message);
  }
}

// Watch for page navigation (YouTube is a single-page app)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(addAudioControls, 1000);
  }
}).observe(document, { subtree: true, childList: true });

// Initial load
setTimeout(addAudioControls, 2000);
