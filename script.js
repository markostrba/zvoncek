
const start = document.getElementById("start");
const statusText = document.getElementById("status");
const count = document.getElementById("count");

let audio, previous, lastShake = 0, rings = 0;

// Prehrá zvuk zvončeka
function ring() {
  const now = audio.currentTime;

  for (const frequency of [880, 1320, 1760]) {
    const tone = audio.createOscillator();
    const volume = audio.createGain();

    tone.frequency.value = frequency;
    volume.gain.setValueAtTime(0.25, now);
    volume.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    tone.connect(volume);
    volume.connect(audio.destination);

    tone.start(now);
    tone.stop(now + 0.9);
  }

  count.textContent = ++rings;
}

// Deteguje zatrasenie mobilom
function detectShake(event) {
  const a = event.accelerationIncludingGravity;
  if (!a || a.x == null || a.y == null || a.z == null) return;

  if (previous) {
    const movement = Math.hypot(
      a.x - previous.x,
      a.y - previous.y,
      a.z - previous.z
    );

    if (movement > 13 && Date.now() - lastShake > 900) {
      lastShake = Date.now();
      ring();
    }
  }

  previous = { x: a.x, y: a.y, z: a.z };
}

// Aktivuje zvonček
start.onclick = async () => {
  try {
    audio = new (window.AudioContext || window.webkitAudioContext)();

    if (navigator.audioSession) {
      navigator.audioSession.type = "playback";
    }

    const sound = audio.resume();

    if (typeof DeviceMotionEvent.requestPermission === "function") {
      const permission = await DeviceMotionEvent.requestPermission();
      if (permission !== "granted") return;
    }

    await sound;

    window.addEventListener("devicemotion", detectShake);
    start.disabled = true;
    statusText.textContent = "Zatras mobilom!";
    ring();
  } catch {
    statusText.textContent = "Nepodarilo sa aktivovať zvonček.";
  }
};
