// ----- Box Breathing -----
// Four equal phases; the dot travels one side of the square per phase.
// Timer, settings and sound live in breathing-engine.js.

(function () {

    const durationSlider = document.getElementById("phaseDuration");
    const durationValue = document.getElementById("durationValue");

    const seconds = () => Number(durationSlider ? durationSlider.value : 4);

    BreathingPractice.init({
        shapeSelector: ".breathing-square",

        getPhases: () => [
            { name: "Inhale", seconds: seconds() },
            { name: "Hold", seconds: seconds() },
            { name: "Exhale", seconds: seconds() },
            { name: "Hold", seconds: seconds() }
        ],

        onSettingsChange: () => {
            if (durationValue) durationValue.textContent = seconds();
        },

        // Centre of the dot follows the square's outline
        moveDot: (phaseIndex, progress, square, dot) => {
            const size = square.clientWidth;
            const radius = dot.offsetWidth / 2;
            const border = (square.offsetWidth - size) / 2;

            // The outline runs through the middle of the border
            const min = -border / 2;
            const max = size + border / 2;
            const along = min + (max - min) * progress;

            const points = [
                [along, min],                    // Inhale: top, left to right
                [max, along],                    // Hold: right, top to bottom
                [max - (along - min), max],      // Exhale: bottom, right to left
                [min, max - (along - min)]       // Hold: left, bottom to top
            ];

            const [x, y] = points[phaseIndex];

            dot.style.left = `${x - radius}px`;
            dot.style.top = `${y - radius}px`;
        }
    });

})();
