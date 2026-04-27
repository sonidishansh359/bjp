document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('user-photo');
    const fileNameDisplay = document.getElementById('file-name');
    const canvas = document.getElementById('poster-canvas');
    const ctx = canvas.getContext('2d');
    const templateImg = document.getElementById('template-img');

    let userPhotoData = null;

    // Navigation
    window.showSection = (sectionId) => {
        document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');
    };

    startBtn.addEventListener('click', () => showSection('form-page'));

    resetBtn.addEventListener('click', () => {
        userPhotoData = null;
        fileNameDisplay.textContent = 'No file chosen';
        document.getElementById('user-name').value = '';
        showSection('landing-page');
    });

    // File Upload Handling
    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('કૃપા કરીને ફોટો ફાઇલ અપલોડ કરો.');
            return;
        }
        fileNameDisplay.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            userPhotoData = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Image Generation Logic
    generateBtn.addEventListener('click', () => {
        const name = document.getElementById('user-name').value.trim();
        if (!name) {
            alert('કૃપા કરીને તમારું નામ લખો.');
            return;
        }
        if (!userPhotoData) {
            alert('કૃપા કરીને તમારો ફોટો અપલોડ કરો.');
            return;
        }

        startGeneration(name);
    });

    function startGeneration(name) {
        showSection('loading-page');
        
        const progressBar = document.getElementById('progress-bar');
        const sloganText = document.getElementById('slogan-text');
        const timerText = document.querySelector('.timer');
        
        const slogans = [
            "સૌનો સાથ, સૌનો વિકાસ...",
            "સૌનો વિશ્વાસ, સૌનો પ્રયાસ...",
            "મોદી છે તો મુમકિન છે...",
            "આત્મનિર્ભર ભારત...",
            "વિકસિત ભારત @ 2047..."
        ];

        let progress = 0;
        let timeLeft = 15;
        const duration = 15000; // 15 seconds
        const interval = 100; // update every 100ms
        const increment = (interval / duration) * 100;

        const timer = setInterval(() => {
            progress += increment;
            progressBar.style.width = `${Math.min(progress, 100)}%`;
            
            // Update slogan occasionally
            if (Math.floor(progress) % 25 === 0) {
                sloganText.textContent = slogans[Math.floor(progress / 20) % slogans.length];
            }

            // Update time
            timeLeft = Math.max(0, 15 - Math.floor((progress / 100) * 15));
            timerText.textContent = `અંદાજે ${timeLeft} સેકન્ડ બાકી છે`;

            if (progress >= 100) {
                clearInterval(timer);
                generateFinalPoster(name);
            }
        }, interval);
    }

    function generateFinalPoster(name) {
        // Set canvas dimensions to match template (the original image is roughly square)
        // We'll use the natural dimensions of the template image
        canvas.width = templateImg.naturalWidth;
        canvas.height = templateImg.naturalHeight;

        const w = canvas.width;
        const h = canvas.height;

        // 1. Draw Template
        ctx.drawImage(templateImg, 0, 0, w, h);

        // 2. Clear original name and photo areas (to be safe)
        // Approximate coordinates based on the 1000x1000 reference
        const circleX = w * 0.765; 
        const circleY = h * 0.730;
        const radius = w * 0.155;

        const barX = w * 0.550;
        const barY = h * 0.885;
        const barW = w * 0.400;
        const barH = h * 0.065;

        // Draw solid orange bar over existing name
        ctx.fillStyle = "#E45B17"; // Match the orange in the template
        ctx.fillRect(barX, barY, barW, barH);

        // 3. Draw User Photo in Circle
        const userImg = new Image();
        userImg.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            const aspect = userImg.width / userImg.height;
            let drawW, drawH, drawX, drawY;

            if (aspect > 1) {
                drawH = radius * 2;
                drawW = drawH * aspect;
                drawX = circleX - drawW / 2;
                drawY = circleY - radius;
            } else {
                drawW = radius * 2;
                drawH = drawW / aspect;
                drawX = circleX - radius;
                drawY = circleY - drawH / 2;
            }

            ctx.drawImage(userImg, drawX, drawY, drawW, drawH);
            ctx.restore();

            // 4. Draw Name
            ctx.fillStyle = "white";
            ctx.font = `bold ${Math.floor(w * 0.045)}px 'Outfit', sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            ctx.fillText(name, barX + barW / 2, barY + barH / 2);

            showSection('result-page');
        };
        userImg.src = userPhotoData;
    }

    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'BJP_Personalized_Poster.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});
