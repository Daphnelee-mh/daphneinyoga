
// ----- Box Breathing -----

document.addEventListener("DOMContentLoaded", () => {

    // Only run on the Practice page
    const square = document.querySelector(".breathing-square");

    if (!square) return;

    const dot = document.querySelector(".breathing-dot");
    const phaseLabel = document.querySelector(".breathing-phase");
    const countdown = document.querySelector(".breathing-countdown");
    const progress = document.querySelector(".breathing-progress");

    const durationSlider = document.getElementById("phaseDuration");
    const durationValue = document.getElementById("durationValue");

    const roundsSlider = document.getElementById("rounds");
    const roundsValue = document.getElementById("roundsValue");

    const timeSlider = document.getElementById("practiceTime");
    const timeValue = document.getElementById("timeValue");

    const roundsMode = document.getElementById("roundsMode");
    const timeMode = document.getElementById("timeMode");
    const roundsSettings = document.getElementById("roundsSettings");
    const timeSettings = document.getElementById("timeSettings");

    const startButton = document.getElementById("startButton");
    const pauseButton = document.getElementById("pauseButton");
    const restartButton = document.getElementById("restartButton");

    const soundToggle = document.getElementById("soundToggle");

    if (!dot || !phaseLabel || !countdown) return;

    // Breathing phases
    const phases = [
        "Inhale",
        "Hold",
        "Exhale",
        "Hold"
    ];

    let phaseDuration = Number(durationSlider?.value || 4);
    let mode = "rounds";
    let totalRounds = Number(roundsSlider?.value || 5);

    let currentPhase = 0;
    let completedRounds = 0;

    let sessionActive = false;
    let sessionPaused = false;

    let phaseStartTime = 0;
    let elapsedBeforePause = 0;
    let animationFrame = null;

    let audioContext = null;

    // Determine the selected number of rounds
    function getTargetRounds() {

        if (mode === "rounds") {
            return totalRounds;
        }

        const minutes = Number(timeSlider.value);

        // Complete full cycles only
        return Math.max(
            1,
            Math.floor((minutes * 60) / (phaseDuration * 4))
        );
    }

    // Update settings display
    function updateSettings() {

        phaseDuration = Number(durationSlider.value);

        durationValue.textContent = phaseDuration;

        roundsValue.textContent = roundsSlider.value;
        timeValue.textContent = timeSlider.value;

        if (mode === "time") {
            const rounds = getTargetRounds();

            if (progress) {
                progress.textContent =
                    `${rounds} complete rounds estimated`;
            }
        }
    }

    // Switch between rounds and time settings
    roundsMode.addEventListener("click", () => {

        mode = "rounds";

        roundsMode.classList.add("active");
        timeMode.classList.remove("active");

        roundsSettings.hidden = false;
        timeSettings.hidden = true;

        updateSettings();
    });

    timeMode.addEventListener("click", () => {

        mode = "time";

        timeMode.classList.add("active");
        roundsMode.classList.remove("active");

        timeSettings.hidden = false;
        roundsSettings.hidden = true;

        updateSettings();
    });

    durationSlider.addEventListener("input", updateSettings);
    roundsSlider.addEventListener("input", updateSettings);
    timeSlider.addEventListener("input", updateSettings);

    // Audio cue
    function playSound() {

        if (!soundToggle || !soundToggle.checked) return;

        try {

            audioContext ??= new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

            if (audioContext.state === "suspended") {
                audioContext.resume();
            }

            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();

            oscillator.frequency.value = 440;
            gain.gain.value = 0.08;

            oscillator.connect(gain);
            gain.connect(audioContext.destination);

            oscillator.start();
            gain.gain.exponentialRampToValueAtTime(
                0.001,
                audioContext.currentTime + 0.3
            );

            oscillator.stop(audioContext.currentTime + 0.3);

        } catch (error) {
            console.warn("Audio cue unavailable.", error);
        }
    }

    // Move dot around the square
    function moveDot(phaseIndex, phaseProgress) {

        const size = square.clientWidth;
        const dotSize = dot.offsetWidth;

        const distance = size - dotSize;

        const sideProgress = Math.min(
            1,
            Math.max(0, phaseProgress)
        );

        let x = 0;
        let y = 0;

        switch (phaseIndex) {

            case 0: // Inhale: top, left to right
                x = distance * sideProgress;
                y = 0;
                break;

            case 1: // Hold: right, top to bottom
                x = distance;
                y = distance * sideProgress;
                break;

            case 2: // Exhale: bottom, right to left
                x = distance * (1 - sideProgress);
                y = distance;
                break;

            case 3: // Hold: left, bottom to top
                x = 0;
                y = distance * (1 - sideProgress);
                break;
        }

        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
    }

    // Update the breathing display
    function updateDisplay(elapsed) {

        const phaseProgress = Math.min(
            elapsed / (phaseDuration * 1000),
            1
        );

        const remaining = Math.max(
            0,
            Math.ceil(phaseDuration - elapsed / 1000)
        );

        phaseLabel.textContent = phases[currentPhase];
        countdown.textContent = `${remaining}`;

        moveDot(currentPhase, phaseProgress);

        if (progress) {
            progress.textContent =
                `Round ${completedRounds + 1} of ${getTargetRounds()}`;
        }
    }

    // Finish the session
    function finishSession() {

        sessionActive = false;
        sessionPaused = false;

        cancelAnimationFrame(animationFrame);

        phaseLabel.textContent = "Practice complete";
        countdown.textContent = "";

        if (progress) {
            progress.textContent =
                `${completedRounds} rounds completed. Take a moment to notice how you feel.`;
        }

        startButton.disabled = false;
        pauseButton.disabled = true;
        startButton.textContent = "Start again";
    }

    // Animation loop
    function animate(timestamp) {

        if (!sessionActive || sessionPaused) return;

        const elapsed = timestamp - phaseStartTime;

        if (elapsed >= phaseDuration * 1000) {

            // Move to next phase
            currentPhase++;

            if (currentPhase >= 4) {

                currentPhase = 0;
                completedRounds++;

                if (completedRounds >= getTargetRounds()) {
                    finishSession();
                    return;
                }
            }

            phaseStartTime += phaseDuration * 1000;

            playSound();

            updateDisplay(0);

        } else {

            updateDisplay(elapsed);
        }

        animationFrame = requestAnimationFrame(animate);
    }

    // Start a new session
    function startSession() {

        phaseDuration = Number(durationSlider.value);

        currentPhase = 0;
        completedRounds = 0;

        sessionActive = true;
        sessionPaused = false;

        elapsedBeforePause = 0;

        phaseStartTime = performance.now();

        startButton.disabled = true;
        pauseButton.disabled = false;
        startButton.textContent = "Start";

        playSound();
        updateDisplay(0);

        animationFrame = requestAnimationFrame(animate);
    }

    // Pause session
    function pauseSession() {

        if (!sessionActive || sessionPaused) return;

        sessionPaused = true;

        elapsedBeforePause =
            performance.now() - phaseStartTime;

        cancelAnimationFrame(animationFrame);

        pauseButton.textContent = "Resume";
    }

    // Resume session
    function resumeSession() {

        if (!sessionActive || !sessionPaused) return;

        sessionPaused = false;

        phaseStartTime =
            performance.now() - elapsedBeforePause;

        pauseButton.textContent = "Pause";

        animationFrame = requestAnimationFrame(animate);
    }

    // Restart session
    function restartSession() {

        cancelAnimationFrame(animationFrame);

        sessionActive = false;
        sessionPaused = false;

        startSession();
    }

    // Button interactions
    startButton.addEventListener("click", () => {

        if (!sessionActive) {
            startSession();
        }

    });

    pauseButton.addEventListener("click", () => {

        if (sessionPaused) {
            resumeSession();
        } else {
            pauseSession();
        }

    });

    restartButton.addEventListener("click", restartSession);

    // Initial state
    pauseButton.disabled = true;

    updateSettings();

    phaseLabel.textContent = "Ready when you are";
    countdown.textContent = "";
    moveDot(0, 0);

});
