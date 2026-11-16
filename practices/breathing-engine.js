// =================================================================
// Shared breathing practice engine
// Used by box-breathing.js and 437-breathing.js.
//
// Each practice page provides:
//   suffix     – appended to every element id ("" or "437")
//   getPhases  – returns [{ name, seconds }, ...] for one round
//   moveDot    – (phaseIndex, progress 0..1, shape, dot) positions the dot
//   onSettingsChange (optional) – extra work when sliders move
// =================================================================

(function () {

    // ----- Welcome modal -----
    function initWelcome() {
        const overlay = document.getElementById("welcomeOverlay");
        const begin = document.getElementById("beginPractice");

        if (!overlay || !begin) return;

        begin.focus();

        begin.addEventListener("click", () => {
            overlay.classList.add("hide");
            overlay.setAttribute("aria-hidden", "true");
        });
    }

    // ----- Short sound cue -----
    let audioContext = null;

    function playSound(enabled) {
        if (!enabled) return;

        try {
            audioContext ??= new (window.AudioContext || window.webkitAudioContext)();

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
            gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.warn("Audio cue unavailable.", error);
        }
    }

    // ----- Practice -----
    function init(config) {
        initWelcome();

        const suffix = config.suffix || "";
        const byId = (id) => document.getElementById(id + suffix);

        const shape = document.querySelector(config.shapeSelector);
        const dot = shape && shape.querySelector(".breathing-dot");
        const phaseLabel = document.querySelector(".breathing-phase");
        const countdown = document.querySelector(".breathing-countdown");
        const progress = document.querySelector(".breathing-progress");

        const roundsSlider = byId("rounds");
        const roundsValue = byId("roundsValue");
        const timeSlider = byId("practiceTime");
        const timeValue = byId("timeValue");

        const roundsMode = byId("roundsMode");
        const timeMode = byId("timeMode");
        const roundsSettings = byId("roundsSettings");
        const timeSettings = byId("timeSettings");

        const startButton = byId("startButton");
        const pauseButton = byId("pauseButton");
        const restartButton = byId("restartButton");
        const soundToggle = byId("soundToggle");

        if (!shape || !dot || !phaseLabel || !countdown || !roundsSlider ||
            !timeSlider || !startButton || !pauseButton || !restartButton) {
            return;
        }

        // Every control that must not change while a session runs
        const settingsControls = Array.from(
            document.querySelectorAll(".breathing-settings input, .breathing-settings button")
        );

        let mode = "rounds";

        // Values locked in when a session starts
        let phases = config.getPhases();
        let targetRounds = 0;

        let currentPhase = 0;
        let completedRounds = 0;
        let sessionActive = false;
        let sessionPaused = false;
        let phaseStartTime = 0;
        let elapsedBeforePause = 0;
        let animationFrame = null;

        const cycleSeconds = () =>
            config.getPhases().reduce((total, phase) => total + phase.seconds, 0);

        // Rounds chosen in the settings (read fresh from the slider)
        function chosenRounds() {
            if (mode === "rounds") {
                return Number(roundsSlider.value);
            }

            // Complete rounds that fit in the chosen time
            return Math.max(1, Math.floor((Number(timeSlider.value) * 60) / cycleSeconds()));
        }

        function setText(element, text) {
            if (element && element.textContent !== text) {
                element.textContent = text;
            }
        }

        function updateSettings() {
            if (config.onSettingsChange) config.onSettingsChange();

            setText(roundsValue, roundsSlider.value);
            setText(timeValue, timeSlider.value);

            if (!sessionActive && progress) {
                const rounds = chosenRounds();
                const total = rounds * cycleSeconds();
                const length = total < 60
                    ? `${total} sec`
                    : `${Math.round(total / 60)} min`;

                setText(progress,
                    `${rounds} ${rounds === 1 ? "round" : "rounds"} (about ${length})`);
            }
        }

        function setMode(newMode) {
            mode = newMode;

            roundsMode.classList.toggle("active", mode === "rounds");
            timeMode.classList.toggle("active", mode === "time");
            roundsMode.setAttribute("aria-pressed", String(mode === "rounds"));
            timeMode.setAttribute("aria-pressed", String(mode === "time"));

            roundsSettings.hidden = mode !== "rounds";
            timeSettings.hidden = mode !== "time";

            updateSettings();
        }

        function lockSettings(locked) {
            settingsControls.forEach((control) => { control.disabled = locked; });
        }

        function updateDisplay(elapsed) {
            const seconds = phases[currentPhase].seconds;
            const phaseProgress = Math.min(elapsed / (seconds * 1000), 1);
            const remaining = Math.max(0, Math.ceil(seconds - elapsed / 1000));

            setText(phaseLabel, phases[currentPhase].name);
            setText(countdown, String(remaining));
            config.moveDot(currentPhase, phaseProgress, shape, dot);

            setText(progress, `Round ${completedRounds + 1} of ${targetRounds}`);
        }

        function stopSession() {
            sessionActive = false;
            sessionPaused = false;
            cancelAnimationFrame(animationFrame);
            pauseButton.textContent = "Pause";
            pauseButton.disabled = true;
            startButton.disabled = false;
            lockSettings(false);
        }

        function finishSession() {
            stopSession();

            setText(phaseLabel, "Practice complete");
            setText(countdown, "");
            setText(progress,
                `${completedRounds} ${completedRounds === 1 ? "round" : "rounds"} completed. ` +
                "Take a moment to notice how you feel.");

            startButton.textContent = "Start again";
            config.moveDot(0, 0, shape, dot);
        }

        function animate(timestamp) {
            if (!sessionActive || sessionPaused) return;

            const phaseLength = phases[currentPhase].seconds * 1000;
            const elapsed = timestamp - phaseStartTime;

            if (elapsed >= phaseLength) {
                phaseStartTime += phaseLength;
                currentPhase++;

                if (currentPhase >= phases.length) {
                    currentPhase = 0;
                    completedRounds++;

                    if (completedRounds >= targetRounds) {
                        finishSession();
                        return;
                    }
                }

                playSound(soundToggle && soundToggle.checked);
                updateDisplay(0);
            } else {
                updateDisplay(elapsed);
            }

            animationFrame = requestAnimationFrame(animate);
        }

        function startSession() {
            cancelAnimationFrame(animationFrame);

            // Lock in the settings for this session
            phases = config.getPhases();
            targetRounds = chosenRounds();

            currentPhase = 0;
            completedRounds = 0;
            sessionActive = true;
            sessionPaused = false;
            elapsedBeforePause = 0;
            phaseStartTime = performance.now();

            startButton.disabled = true;
            startButton.textContent = "Start";
            pauseButton.disabled = false;
            pauseButton.textContent = "Pause";
            lockSettings(true);

            playSound(soundToggle && soundToggle.checked);
            updateDisplay(0);

            animationFrame = requestAnimationFrame(animate);
        }

        function togglePause() {
            if (!sessionActive) return;

            if (sessionPaused) {
                sessionPaused = false;
                phaseStartTime = performance.now() - elapsedBeforePause;
                pauseButton.textContent = "Pause";
                animationFrame = requestAnimationFrame(animate);
            } else {
                sessionPaused = true;
                elapsedBeforePause = performance.now() - phaseStartTime;
                cancelAnimationFrame(animationFrame);
                pauseButton.textContent = "Resume";
            }
        }

        // ----- Events -----
        settingsControls
            .filter((control) => control.type === "range")
            .forEach((slider) => slider.addEventListener("input", updateSettings));

        roundsMode.addEventListener("click", () => setMode("rounds"));
        timeMode.addEventListener("click", () => setMode("time"));

        startButton.addEventListener("click", () => {
            if (!sessionActive) startSession();
        });
        pauseButton.addEventListener("click", togglePause);
        restartButton.addEventListener("click", startSession);

        // Keep the dot on the line if the shape resizes (e.g. phone rotation)
        window.addEventListener("resize", () => {
            if (!sessionActive) config.moveDot(0, 0, shape, dot);
        });

        // ----- Initial state -----
        pauseButton.disabled = true;
        setText(phaseLabel, "Ready when you are");
        setText(countdown, "");
        setMode("rounds");
        config.moveDot(0, 0, shape, dot);
    }

    window.BreathingPractice = { init };

})();
