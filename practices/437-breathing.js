// ----- 4-3-7 Breathing -----
// Fixed pattern: inhale 4, hold 3, exhale 7.
// Timer, settings and sound live in breathing-engine.js.

(function () {

    BreathingPractice.init({
        suffix: "437",
        shapeSelector: ".breathing-triangle",

        getPhases: () => [
            { name: "Inhale", seconds: 4 },
            { name: "Hold", seconds: 3 },
            { name: "Exhale", seconds: 7 }
        ],

        // Centre of the dot follows the triangle's outline
        moveDot: (phaseIndex, progress, triangle, dot) => {
            const width = triangle.clientWidth;
            const height = triangle.clientHeight;
            const radius = dot.offsetWidth / 2;

            const top = { x: width / 2, y: 0 };
            const bottomRight = { x: width, y: height };
            const bottomLeft = { x: 0, y: height };

            const between = (a, b, t) => ({
                x: a.x + (b.x - a.x) * t,
                y: a.y + (b.y - a.y) * t
            });

            let point;

            if (phaseIndex === 0) {
                // Inhale: up the left side
                point = between(bottomLeft, top, progress);
            } else if (phaseIndex === 1) {
                // Hold: rest at the top
                point = top;
            } else {
                // Exhale: down the right side, then back along the base
                point = progress <= 0.5
                    ? between(top, bottomRight, progress * 2)
                    : between(bottomRight, bottomLeft, (progress - 0.5) * 2);
            }

            dot.style.left = `${point.x - radius}px`;
            dot.style.top = `${point.y - radius}px`;
        }
    });

})();
