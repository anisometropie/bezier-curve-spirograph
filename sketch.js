curves = [];
SHIFT_IS_HELD = false;
let currentFrameRate = 0;
let notifications = new Notifications();

function setup() {
    createCanvas(1200, 800);
    // frameRate(5);
    let l_array = [ 28.10, 543.76, 862.28, 789.03, 100.48, 17.07, 943.32, 433.61 ];
    curves.push(new MovableBezier(...l_array));
    displayFrameRate();
    setTimeout( function() {
        notifications.addText("move control points around with the mouse");
    }, 500);
    setTimeout( function() {
        notifications.addText("SHIFT + click to add/remove a point");
    }, 5500);
}

function addRandomCurve(aMinPoints, aMaxPoints) {
    let l_number = Math.floor(random(aMaxPoints - aMinPoints + 1)) + aMinPoints;
    let l_array = new Array();
    for(let i=0; i<l_number; i++) {
        l_array.push(random(width));
        l_array.push(random(height));
    }
    let l_closeCurve = Math.round(random());
    if( l_closeCurve ) {
        l_array.push(l_array[0]);
        l_array.push(l_array[1]);
        let l_dir = p5.Vector.random2D();
        l_dir.mult(150);
        l_array.splice(2, 0, l_array[0] + l_dir.x);
        l_array.splice(3, 0, l_array[1] + l_dir.y);
        l_array.splice(l_array.length-2, 0, l_array[0] - l_dir.x);
        l_array.splice(l_array.length-2, 0, l_array[1] - l_dir.y);
    }
    curves.push(new MovableBezier(...l_array));
}

function draw() {
    background(255);
    text(currentFrameRate, width - 25, 25);
    notifications.display();
    for (let i=0; i<curves.length; i++) {
        curves[i].move();
        curves[i].drawCircle();
        curves[i].drawCircleCurve();
        curves[i].drawCurve();
    }
}

function mousePressed() {
    for (let i=0; i<curves.length; i++) {
        curves[i].mousePressed();
    }
}

function mouseReleased() {
    for (let i=0; i<curves.length; i++) {
        curves[i].mouseReleased();
    }
}

function keyPressed() {
    if (keyCode === SHIFT) {
        SHIFT_IS_HELD = true;
    }
}

function keyReleased() {
    if (keyCode === SHIFT) {
        SHIFT_IS_HELD = false;
    }
}

function displayFrameRate() {
    let frameCountArray = new Array(4);
    setInterval( function() {
        currentFrameRate = frameCount-frameCountArray[0];
        for(let i=0; i<=frameCountArray.length-2; i++) {
            if (typeof(frameCountArray[i+1]) !== "undefined") {
                frameCountArray[i] = frameCountArray[i+1];
            }
            else {
                frameCountArray[i] = frameCount;
            }
        }
        frameCountArray[frameCountArray.length-1] = frameCount;
    }, 1000/frameCountArray.length);
}

// Math stuff

function bernsteinPolynomial (i, m) {
    let polynomial = function(t) {
        return binomialCoefficient(i,m) * Math.pow(t,i) * Math.pow(1-t,m-i);
    }
    return polynomial;
}

function binomialCoefficient(k, n) {
    return factorial(n)/(factorial(k)*factorial(n-k));
}

function factorial(n) {
    if (n>1) {
        return factorial(n-1) * n;
    }
    else {
        return 1;
    }
}
