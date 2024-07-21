interface square {
    p: {x: number, y: number};
    w: number;
    h: number;
    color: string;
    data: Uint8ClampedArray;
}

const POPULATION_TOTAL = 10;
const population: Array<square> = [];

function randomCoord(canvas: HTMLCanvasElement): {x: number, y: number} {
    return {x: Math.floor(Math.random()*canvas.width), y: Math.floor(Math.random()*canvas.height)};
}

function randomSample(canvas: HTMLCanvasElement, individuals: Array<square>) {
    individuals.length = 0;
    let minimun_width = 5;
    let minimun_height = 5;
    for (let i = 0; i <  POPULATION_TOTAL; i++) {
        let initial_point = randomCoord(canvas);
        let w = Math.floor(Math.random()*(canvas.width-initial_point.x-minimun_width)) + minimun_width;
        let h = Math.floor(Math.random()*(canvas.height-initial_point.y-minimun_height)) + minimun_height;
        let color = [Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.floor(Math.random()*255)];
        let data = new Uint8ClampedArray(w*h*4);
        for (let j = 0; j < w*h*4; j += 4) {
            data[j] = color[0]; // R
            data[j+1] = color[1]; // G
            data[j+2] = color[2]; // B
            data[j+3] = 255; // A
        }
        let colorstr = "rgb(" + color[0].toString() + " " + color[1].toString() + " " + color[2].toString() + ")";
        individuals.push({p: initial_point, w: w, h: h, color: colorstr, data: data});
    }
}

function drawSample(ctx: CanvasRenderingContext2D, individuals: Array<square>) {
    individuals.forEach(
        (v) => {
            ctx.fillStyle = v.color;
            ctx.fillRect(v.p.x, v.p.y, v.w, v.h)
        }
    )
}

function drawFrame(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSample(ctx, population);
}

function fit(targetRGBA: Uint8ClampedArray, individuals: Array<square>, ctx: CanvasRenderingContext2D): Array<number> {
    let fitness: Array<number> = [];

    individuals.forEach((square) => {
        targetRGBA = ctx?.getImageData(square.p.x, square.p.y, square.w, square.h).data;
        let total = 0;

        for (let i=0; i < targetRGBA.length; i += 4) {
            let diffR = Math.abs(square.data[i] - targetRGBA[i]);
            let diffG = Math.abs(square.data[i+1] - targetRGBA[i+1]);
            let diffB = Math.abs(square.data[i+2] - targetRGBA[i+2]);
            let diffA = Math.abs(square.data[i+2] - targetRGBA[i+2]);

            total =+ (diffR + diffG + diffB + diffA)/(255*4);
        }

        fitness.push(total);
    })

    return fitness;
}

window.addEventListener('load', function() {
    const target = new Image();
    target.crossOrigin = 'anonymous';
    target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Solid_red.svg/480px-Solid_red.svg.png";
    let targetPixels = new Uint8ClampedArray();

    const targetCanvas = <HTMLCanvasElement> document.getElementById("target");
    const targetCtx = targetCanvas.getContext("2d", {willReadFrequently: true});
    if (targetCtx == null) {
        throw new Error("Target context null");
    }

    const animCanvas = <HTMLCanvasElement> document.getElementById("anim");
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
    }

    window.setInterval(() => {
        drawFrame(animCanvas, animCtx);
        let fitness = fit(targetPixels, population, targetCtx);
        console.log(fitness);

        let next_gen: Array<square> = [];
        let top = Math.floor(population.length * 0.1);
        let bottom = Math.floor(population.length * 0.3);

    }, 1000);
});
