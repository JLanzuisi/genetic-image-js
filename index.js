"use strict";
const POPULATION_TOTAL = 30;
function randomCoord(canvas) {
    return { x: Math.floor(Math.random() * canvas.width), y: Math.floor(Math.random() * canvas.height) };
}
function randomSample(canvas, individuals) {
    individuals.length = 0;
    let minimun_width = 5;
    let minimun_height = 5;
    for (let i = 0; i < POPULATION_TOTAL; i++) {
        let initial_point = randomCoord(canvas);
        let w = Math.floor(Math.random() * (canvas.width / 10 - minimun_width)) + minimun_width;
        let h = Math.floor(Math.random() * (canvas.height / 10 - minimun_height)) + minimun_height;
        let color = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        individuals.push({ p: initial_point, w: w, h: h, color: color });
    }
}
function drawSample(ctx, individuals) {
    individuals.forEach((v) => {
        ctx.fillStyle = "rgb(" + v.color[0].toString() + " " + v.color[1].toString() + " " + v.color[2].toString() + ")";
        ctx.fillRect(v.p.x, v.p.y, v.w, v.h);
    });
}
function drawFrame(canvas, ctx, population) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSample(ctx, population);
}
function fit(individuals, ctx) {
    let fitness = [];
    individuals.forEach((square, i) => {
        let targetRGBA = ctx === null || ctx === void 0 ? void 0 : ctx.getImageData(square.p.x, square.p.y, square.w, square.h).data;
        let total = 0;
        for (let i = 0; i < targetRGBA.length; i += 4) {
            let diffR = Math.abs(square.color[0] - targetRGBA[i]);
            let diffG = Math.abs(square.color[1] - targetRGBA[i + 1]);
            let diffB = Math.abs(square.color[2] - targetRGBA[i + 2]);
            let diffA = Math.abs(255 - targetRGBA[i + 2]);
            total = +(diffR + diffG + diffB + diffA) / (255 * 4);
        }
        fitness.push([total, i]);
    });
    return fitness.sort();
}
function getEpsilon(totalWidth, center, denominator = 10) {
    let epsilon = 0;
    if (Math.random() > 0.8) {
        if (totalWidth - center < center) {
            epsilon = (totalWidth - center) / denominator;
            if (Math.floor(Math.random() * 2) == 1) {
                epsilon *= -1;
            }
        }
        else {
            epsilon = center / denominator;
            if (Math.floor(Math.random() * 2) == 1) {
                epsilon *= -1;
            }
        }
    }
    return Math.floor(epsilon);
}
function getNextGen(nextGen, population, fitness, canvas) {
    let top = Math.floor(population.length * 0.1);
    let bottom = Math.floor(population.length * 0.3);
    nextGen.length = 0;
    for (let i = 0; i <= top; i++) {
        nextGen.push(population[fitness[1][1]]);
    }
    while (nextGen.length < POPULATION_TOTAL) {
        let parents = [
            population[Math.floor(Math.random() * (bottom - top + 1)) + top + 1],
            population[Math.floor(Math.random() * (bottom - top + 1)) + top + 1]
        ];
        let childWidth = 0;
        let childHeight = 0;
        let childColor = [0, 0, 0];
        let initial_point = { x: 0, y: 0 };
        if (Math.floor(Math.random() * 2) == 0) { // crossing
            initial_point = parents[Math.floor(Math.random() * 2)].p;
            childWidth = parents[Math.floor(Math.random() * 2)].w;
            childHeight = parents[Math.floor(Math.random() * 2)].h;
            childColor = [
                parents[Math.floor(Math.random() * 2)].color[0],
                parents[Math.floor(Math.random() * 2)].color[1],
                parents[Math.floor(Math.random() * 2)].color[2],
            ];
        }
        else { // mutation
            let mut_parent = parents[Math.floor(Math.random() * 2)];
            initial_point.x = mut_parent.p.x + getEpsilon(canvas.width, mut_parent.p.x);
            initial_point.y = mut_parent.p.y + getEpsilon(canvas.height, mut_parent.p.y);
            childWidth = mut_parent.p.x + mut_parent.w + getEpsilon(canvas.width, mut_parent.p.x + mut_parent.w);
            childHeight = mut_parent.p.y + mut_parent.h + getEpsilon(canvas.height, mut_parent.p.y + mut_parent.h);
            childColor = [
                mut_parent.color[0] + getEpsilon(255, mut_parent.color[0]),
                mut_parent.color[1] + getEpsilon(255, mut_parent.color[1]),
                mut_parent.color[2] + getEpsilon(255, mut_parent.color[2]),
            ];
        }
        nextGen.push({
            p: initial_point,
            w: childWidth,
            h: childHeight,
            color: childColor
        });
    }
}
window.addEventListener('load', function () {
    let population = [];
    let nextGen = [];
    const target = new Image();
    target.crossOrigin = 'anonymous';
    target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Solid_red.svg/480px-Solid_red.svg.png";
    const targetCanvas = document.getElementById("target");
    const targetCtx = targetCanvas.getContext("2d", { willReadFrequently: true });
    if (targetCtx == null) {
        throw new Error("Target context null");
    }
    const animCanvas = document.getElementById("anim");
    const animCtx = animCanvas.getContext("2d");
    if (animCtx == null) {
        throw new Error("Target context null");
    }
    target.onload = () => {
        targetCanvas.width = target.naturalWidth;
        targetCanvas.height = target.naturalHeight;
        animCanvas.width = target.naturalWidth;
        animCanvas.height = target.naturalHeight;
        targetCtx.drawImage(target, 0, 0);
        randomSample(animCanvas, population);
    };
    window.setInterval(() => {
        nextGen = [];
        drawFrame(animCanvas, animCtx, population);
        let fitness = fit(population, targetCtx);
        getNextGen(nextGen, population, fitness, animCanvas);
        population = nextGen;
    }, 500);
});
