const video = document.getElementById('video');
let lastEmotion = '';

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('models'),
  faceapi.nets.faceExpressionNet.loadFromUri('models')
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => video.srcObject = stream)
    .catch(err => console.error('Camera error:', err));
}

video.addEventListener('play', () => {
  const display = document.getElementById('emotion-display');
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, faceapi.resizeResults(detections, displaySize));

    if (detections.length > 0) {
      const expressions = detections[0].expressions;
      const emotionScores = {
        happy: expressions.happy,
        sad: expressions.sad + expressions.angry,
        neutral: expressions.neutral
      };

      const sorted = Object.entries(emotionScores).sort((a, b) => b[1] - a[1]);
      const [topEmotion, topScore] = sorted[0];

      const confidenceThreshold = 0.4;

      if (topScore > confidenceThreshold && topEmotion !== lastEmotion) {
        lastEmotion = topEmotion;
        display.textContent = `Detected: ${topEmotion}`;
        updateUI(topEmotion);
      }
    }
  }, 3000);
});

function updateUI(emotion) {
  const body = document.body;
  const rec = document.getElementById('recommendations');
  const workout = document.getElementById('workout-program');
  const image = document.getElementById('sport-image');
  const motivation = document.getElementById('motivational-text');
  const tips = document.getElementById('tips-box');

  if (emotion === 'happy') {
    body.style.background = 'linear-gradient(to right, #00c9ff, #92fe9d)';
    rec.innerHTML = `
      <ul>
        <li><a href="https://www.youtube.com/watch?v=r_8jcSU6kNc" target="_blank">🎧 Triathlon Boost</a></li>
        <li><a href="https://www.youtube.com/watch?v=fdvJU4-oHuY" target="_blank">🎧 Run Power Mix</a></li>
        <li><a href="https://www.youtube.com/watch?v=z1FylHV_BVk" target="_blank">🎧 Bike Energy Flow</a></li>
        <li>📚 "Can't Hurt Me" by David Goggins</li>
      </ul>`;
    workout.innerHTML = `
      <h3>🔥 HIIT Triathlon Training</h3>
      <p>10 min swim drills → 20 min bike intervals → 15 min fast run</p>`;
    image.src = 'assets/images/bike.jpg';
    motivation.innerHTML = `"Push harder than yesterday!"`;
    tips.innerHTML = `
      <h4>💡 Tips:</h4>
      <ul>
        <li>Use your energy burst for sprints.</li>
        <li>Focus on form and breathing.</li>
        <li>Track pace and hydration.</li>
      </ul>`;
    changeMusic('assets/music/happy.mp3');

  } else if (emotion === 'sad') {
    body.style.background = 'linear-gradient(to right, #3a6073, #16222a)';
    rec.innerHTML = `
      <ul>
        <li><a href="https://www.youtube.com/watch?v=QS65Yk1KZmY" target="_blank">🎧 Relax & Regroup</a></li>
        <li><a href="https://www.youtube.com/watch?v=vdreP5AlUfY" target="_blank">🎧 Calm Motivation</a></li>
        <li><a href="https://www.youtube.com/watch?v=ElXQb1rpaqU" target="_blank">🎧 Mindful Training</a></li>
        <li>📚 "The Brave Athlete"</li>
      </ul>`;
    workout.innerHTML = `
      <h3>🧘 Recovery Day</h3>
      <p>Gentle swim → light bike ride → deep breathing & stretching</p>`;
    image.src = 'assets/images/swim.jpg';
    motivation.innerHTML = `"Even on your worst day, you're still moving."`;
    tips.innerHTML = `
      <h4>💡 Tips:</h4>
      <ul>
        <li>Don’t overtrain – breathe deeply.</li>
        <li>Stretch 10+ minutes.</li>
        <li>Stay hydrated and eat clean.</li>
      </ul>`;
    changeMusic('assets/music/sad.mp3');

  } else if (emotion === 'neutral') {
    body.style.background = 'linear-gradient(to right, #f7f8f8, #acbb78)';
    rec.innerHTML = `
      <ul>
        <li><a href="https://www.youtube.com/watch?v=H5RTwkLcPac" target="_blank">🎧 Zone 2 Focus</a></li>
        <li><a href="https://www.youtube.com/watch?v=TSSqqyQWa78" target="_blank">🎧 Steady Lo-Fi</a></li>
        <li><a href="https://www.youtube.com/watch?v=D2H8EwLzigk" target="_blank">🎧 Long Run Endurance</a></li>
        <li>📚 "Endure" by Alex Hutchinson</li>
      </ul>`;
    workout.innerHTML = `
      <h3>🏃 Endurance Session</h3>
      <p>30 min swim → 40 min easy bike → 20 min zone 2 run</p>`;
    image.src = 'assets/images/run.jpg';
    motivation.innerHTML = `"Stay consistent – champions are built daily."`;
    tips.innerHTML = `
      <h4>💡 Tips:</h4>
      <ul>
        <li>Alternate swim/bike/run weekly.</li>
        <li>Stay in Zone 2 heart rate.</li>
        <li>Log your progress daily.</li>
      </ul>`;
    changeMusic('assets/music/natural.mp3');
  }
}

function changeMusic(src) {
  const music = document.getElementById('bg-music');
  if (!music.src.includes(src)) {
    music.pause();
    music.src = src;
    music.load();
    music.play().catch(() => {
      console.warn('Autoplay blocked');
    });
  }
}
