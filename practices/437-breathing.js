// ----- Welcome Modal -----

const welcomeOverlay = document.getElementById("welcomeOverlay");
const beginPractice = document.getElementById("beginPractice");

if (welcomeOverlay && beginPractice) {
    beginPractice.addEventListener("click", () => {
        welcomeOverlay.classList.add("hide");
    });
}

// ----- 4-3-7 Breathing -----

document.addEventListener("DOMContentLoaded", () => {

    // Only run inside the 4-3-7 breathing section
    const practice = document.getElementById("breathing437");

    if (!practice) return;

    // ----- HTML Elements -----

    const triangle = practice.querySelector(".breathing-triangle");
    const dot = practice.querySelector(".breathing-dot");
    const phaseLabel = practice.querySelector(".breathing-phase");
    const countdown = practice.querySelector(".breathing-countdown");
    const progress = practice.querySelector(".breathing-progress");

    const inhaleSlider = document.getElementById("inhaleDuration437");
    const holdSlider = document.getElementById("holdDuration437");
    const exhaleSlider = document.getElementById("exhaleDuration437");

    const inhaleValue = document.getElementById("inhaleValue437");
    const holdValue = document.getElementById("holdValue437");
    const exhaleValue = document.getElementById("exhaleValue437");

    const roundsSlider = document.getElementById("rounds437");
    const roundsValue = document.getElementById("roundsValue437");

    const timeSlider = document.getElementById("practiceTime437");
    const timeValue = document.getElementById("timeValue437");

    const roundsMode = document.getElementById("roundsMode437");
    const timeMode = document.getElementById("timeMode437");

    const roundsSettings = document.getElementById("roundsSettings437");
    const timeSettings = document.getElementById("timeSettings437");

    const startButton = document.getElementById("startButton437");
    const pauseButton = document.getElementById("pauseButton437");
    const restartButton = document.getElementById("restartButton437");

    const soundToggle = document.getElementById("soundToggle437");

    if (
        !triangle || !dot || !phaseLabel || !countdown ||
        !inhaleSlider || !holdSlider || !exhaleSlider ||
        !roundsSlider || !timeSlider ||
        !startButton || !pauseButton || !restartButton
    ) return;


    // ----- Breathing Phases -----

    const phases = [
        "Inhale",
        "Hold",
        "Exhale"
    ];

    let phaseDurations = [
        Number(inhaleSlider.value),
        Number(holdSlider.value),
        Number(exhaleSlider.value)
    ];

    let mode = "rounds";

    let currentPhase = 0;
    let completedRounds = 0;
    let targetRounds = 5;

    let sessionActive = false;
    let sessionPaused = false;

    let phaseStartTime = 0;
    let elapsedBeforePause = 0;
    let animationFrame = null;

    let audioContext = null;


    // ----- Duration Settings -----

    function getDurations() {

        return [
            Number(inhaleSlider.value),
            Number(holdSlider.value),
            Number(exhaleSlider.value)
        ];

    }

    function getCycleDuration(durations = getDurations()) {

        return durations.reduce((total, value) => total + value, 0);

    }

    function getTargetRounds() {

        if (mode === "rounds") {
            return Number(roundsSlider.value);
        }

        const minutes = Number(timeSlider.value);
        const cycleDuration = getCycleDuration();

        return Math.max(
            1,
            Math.floor((minutes * 60) / cycleDuration)
        );

    }


    // ----- Update Settings Display -----

    function updateSettings() {

        phaseDurations = getDurations();

        inhaleValue.textContent = phaseDurations[0];
        holdValue.textContent = phaseDurations[1];
        exhaleValue.textContent = phaseDurations[2];

        roundsValue.textContent = roundsSlider.value;
        timeValue.textContent = timeSlider.value;

        if (progress && mode === "time") {

            progress.textContent =
                `${getTargetRounds()} complete rounds estimated`;

        }

    }

    inhaleSlider.addEventListener("input", updateSettings);
    holdSlider.addEventListener("input", updateSettings);
    exhaleSlider.addEventListener("input", updateSettings);

    roundsSlider.addEventListener("input", updateSettings);
    timeSlider.addEventListener("input", updateSettings);


    // ----- Practice Mode -----

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


    // ----- Sound Cue -----

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


    // ----- Move Dot Around Triangle -----

    function moveDot(phaseIndex, phaseProgress) {

        const width = triangle.clientWidth;
        const height = triangle.clientHeight;

        const dotSize = dot.offsetWidth;
        const radius = dotSize / 2;

        // Triangle vertices
        const top = {
            x: width / 2,
            y: radius
        };

        const bottomRight = {
            x: width - radius,
            y: height - radius
        };

        const bottomLeft = {
            x: radius,
            y: height - radius
        };

        let x = bottomLeft.x;
        let y = bottomLeft.y;

        const p = Math.min(1, Math.max(0, phaseProgress));

        switch (phaseIndex) {

            case 0:
                // Inhale: bottom left to top

                x = bottomLeft.x +
                    (top.x - bottomLeft.x) * p;

                y = bottomLeft.y +
                    (top.y - bottomLeft.y) * p;

                break;


            case 1:
                // Hold: remain at the top

                x = top.x;
                y = top.y;

                break;


            case 2:
                // Exhale: travel from top to bottom right,
                // then from bottom right to bottom left.

                if (p <= 0.5) {

                    const sideProgress = p * 2;

                    x = top.x +
                        (bottomRight.x - top.x) * sideProgress;

                    y = top.y +
                        (bottomRight.y - top.y) * sideProgress;

                } else {

                    const sideProgress = (p - 0.5) * 2;

                    x = bottomRight.x +
                        (bottomLeft.x - bottomRight.x) * sideProgress;

                    y = bottomRight.y;

                }

                break;

        }

        dot.style.left = `${x - radius}px`;
        dot.style.top = `${y - radius}px`;

    }


    // ----- Update Breathing Display -----

    function updateDisplay(elapsed) {

        const duration = phaseDurations[currentPhase];

        const phaseProgress = Math.min(
            elapsed / (duration * 1000),
            1
        );

        const remaining = Math.max(
            0,
            Math.ceil(duration - elapsed / 1000)
        );

        phaseLabel.textContent = phases[currentPhase];

        countdown.textContent = remaining;

        moveDot(currentPhase, phaseProgress);

        if (progress) {

            progress.textContent =
                `Round ${completedRounds + 1} of ${targetRounds}`;

        }

    }


    // ----- Finish Session -----

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
        pauseButton.textContent = "Pause";

        moveDot(0, 0);

    }


    // ----- Animation Loop -----

    function animate(timestamp) {

        if (!sessionActive || sessionPaused) return;

        const currentDuration = phaseDurations[currentPhase] * 1000;

        const elapsed = timestamp - phaseStartTime;

        if (elapsed >= currentDuration) {

            // Move to next phase
            phaseStartTime += currentDuration;

            currentPhase++;

            if (currentPhase >= phases.length) {

                currentPhase = 0;
                completedRounds++;

                if (completedRounds >= targetRounds) {

                    finishSession();
                    return;

                }

            }

            playSound();

            updateDisplay(0);

        } else {

            updateDisplay(elapsed);

        }

        animationFrame = requestAnimationFrame(animate);

    }


    // ----- Start Session -----

    function startSession() {

        phaseDurations = getDurations();

        targetRounds = getTargetRounds();

        currentPhase = 0;
        completedRounds = 0;

        sessionActive = true;
        sessionPaused = false;

        elapsedBeforePause = 0;

        phaseStartTime = performance.now();

        startButton.disabled = true;
        pauseButton.disabled = false;

        startButton.textContent = "Start";
        pauseButton.textContent = "Pause";

        playSound();

        updateDisplay(0);

        animationFrame = requestAnimationFrame(animate);

    }


    // ----- Pause Session -----

    function pauseSession() {

        if (!sessionActive || sessionPaused) return;

        sessionPaused = true;

        elapsedBeforePause =
            performance.now() - phaseStartTime;

        cancelAnimationFrame(animationFrame);

        pauseButton.textContent = "Resume";

    }


    // ----- Resume Session -----

    function resumeSession() {

        if (!sessionActive || !sessionPaused) return;

        sessionPaused = false;

        phaseStartTime =
            performance.now() - elapsedBeforePause;

        pauseButton.textContent = "Pause";

        animationFrame = requestAnimationFrame(animate);

    }


    // ----- Restart Session -----

    function restartSession() {

        cancelAnimationFrame(animationFrame);

        sessionActive = false;
        sessionPaused = false;

        startSession();

    }


    // ----- Button Interactions -----

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


    // ----- Initial State -----

    pauseButton.disabled = true;

    updateSettings();

    phaseLabel.textContent = "Ready when you are";

    countdown.textContent = "";

    moveDot(0, 0);

});
