"use strict";
function randomColor() {
    return [
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255)
    ];
}
function initPopulation(canvas, population, rectTotal, populationTotal) {
    for (let i = 0; i < populationTotal; i++) {
        let individual = [];
        for (let j = 0; j < rectTotal; j++) {
            let rand_x = Math.floor(Math.random() * (canvas.width / 2 * 0.9));
            let rand_y = Math.floor(Math.random() * (canvas.height * 0.9));
            let w = Math.floor(Math.random() * ((canvas.width / 2) - rand_x));
            if (w == 0) {
                w += Math.floor(((canvas.width / 2) - rand_x) / 2);
            }
            let h = Math.floor(Math.random() * (canvas.height - rand_y));
            if (h == 0) {
                h += Math.floor((canvas.height - rand_y) / 2);
            }
            individual.push({
                x: rand_x,
                y: rand_y,
                width: w,
                height: h,
                color: randomColor(),
            });
        }
        ;
        population.push(individual);
    }
    ;
}
;
function fitness(target, individual) {
    let image = new Uint8ClampedArray(target.data.length);
    individual.forEach((v) => {
        for (let row = v.y; row < v.y + v.height; row++) {
            for (let col = v.x; col < v.x + v.width; col++) {
                let redidx = row * (image.length * 4) + (col * 4);
                image[redidx] = v.color[0];
                image[redidx + 1] = v.color[1];
                image[redidx + 2] = v.color[2];
                image[redidx + 3] = 255;
            }
            ;
        }
        ;
    });
    let total = 0;
    for (let i = 0; i < image.length; i += 4) {
        let diffR = Math.abs(target.data[i] - image[i]) / 255;
        let diffG = Math.abs(target.data[i + 1] - image[i + 1]) / 255;
        let diffB = Math.abs(target.data[i + 2] - image[i + 2]) / 255;
        let diffA = Math.abs(target.data[i + 3] - image[i + 3]) / 255;
        total += (diffR + diffG + diffB + diffA) / 4;
    }
    return total / (target.width * target.height);
}
function mutColor(center) {
    let len = 255;
    let epsilon = center;
    if (len - center < epsilon) {
        let epslion = len - center;
    }
    return Math.floor(Math.random() * (center + epsilon - (center - epsilon)) + (center - epsilon));
}
// function getNextGen(target: ImageData, currGen: Array<Array<Rectangle>>, ctx: CanvasRenderingContext2D): Array<ImageData> {
//   let nextGen: Array<Array<Rectangle>> = [];
//   let total = currGen.length;
//   currGen.sort((a, b) => {
//     return fitness(target, a) - fitness(target, b);
//   });
//   let top = Math.floor(currGen.length * 0.2);
//   let bottom = Math.floor(currGen.length * 0.3);
//   nextGen = currGen.slice(0, top);
//   currGen = currGen.slice(top, currGen.length - bottom);
//   while(nextGen.length < total) {
//     let currentImage = ctx.createImageData(target.width, target.height);
//     if (Math.floor(Math.random()*2) == 0) { // crossing
//       let a = 0.3;
//       let p1 = currGen[Math.floor(Math.random()*currGen.length)].data;
//       let p2 = currGen[Math.floor(Math.random()*currGen.length)].data;
//       for (let i=0; i < currentImage.data.length; i += 4) {
//           currentImage.data[i] = a*p1[i] + (1-a) * p2[i];
//           currentImage.data[i+1] = a*p1[i+1] + (1-a) * p2[i+1];
//           currentImage.data[i+2] = a*p1[i+2] + (1-a) * p2[i+2];
//           currentImage.data[i+3] = a*p1[i+3] + (1-a) * p2[i+3];
//       }
//     } else { // mutation
//       let p = currGen[Math.floor(Math.random()*currGen.length)].data;
//       for (let i=0; i < currentImage.data.length; i += 4) {
//           currentImage.data[i] = mutColor(p[i]);
//           currentImage.data[i+1] = mutColor(p[i+1]);
//           currentImage.data[i+2] = mutColor(p[i+2]);
//           currentImage.data[i+3] = mutColor(p[i+3]);
//       }
//     }
//     nextGen.push(currentImage);
//   }
//   return nextGen;
// }
window.addEventListener('load', function () {
    const target = new Image();
    target.crossOrigin = 'anonymous';
    // target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Solid_red.svg/480px-Solid_red.svg.png";
    target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Solid_red.svg/240px-Solid_red.svg.png";
    const canvas = document.getElementById("screen");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx == null) {
        throw new Error("Target context null");
    }
    let targetImData;
    const SQUARE_TOTAL = 10;
    const POPULATION_TOTAL = 20;
    let population = [];
    target.onload = () => {
        canvas.width = target.naturalWidth * 2;
        canvas.height = target.naturalHeight;
        ctx.drawImage(target, 0, 0);
        targetImData = ctx.getImageData(0, 0, canvas.width / 2, canvas.height);
        initPopulation(canvas, population, SQUARE_TOTAL, POPULATION_TOTAL);
        console.log(fitness(targetImData, population[5]));
    };
    // window.setInterval(() => {
    //   population = getNextGen(targetImData, population, ctx);
    //   // console.log(fitness(targetImData, population[0]));
    //   ctx.putImageData(population[0], canvas.width/2, 0);
    // }, 500);
});
