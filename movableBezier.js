const STEPS = 1000;

class MovableBezier {
    constructor(...aPointsCoords) {
        if (aPointsCoords.length % 2 === 0) {
            this.order = aPointsCoords.length/2 - 1;
            this.points = new Array();
            for (let i=0; i<aPointsCoords.length/2; i++) {
                this.points[i] = new MovablePoint(aPointsCoords[i*2], aPointsCoords[i*2+1]);
            }
        }
        this.curvePoints = new Array();
        this.curveTangents = new Array();
        this.bernsteinPolynomials = new Array();
        this.bernsteinPolynomialsForDerivatives = new Array();
        this.computeBernsteinPolynomials();
        this.computeCurve();
        this.circleDistance = 0;
        this.circleRadius = 30;
        this.circleHandAngle;
        this.circleLap = 0;
        this.circleCurve = new Array();
    }

    outputDataPoints() {
        let l_points = "";
        let l_prefix = ""
        for (let i=0; i<this.points.length; i++) {
            l_points += l_prefix;
            l_prefix = ", ";
            l_points += this.points[i].x.toFixed(2);
            l_points += l_prefix;
            l_points += this.points[i].y.toFixed(2);
        }
        console.log("[ " + l_points + " ]")
    }

    clearCircleCurve() {
        this.circleCurve = new Array();
    }

    drawCircleCurve() {
        push();
        noFill();
        beginShape();
        for (let i=0; i<this.circleCurve.length; i++) {
            if( i>0 && dist(this.circleCurve[i]['x'], this.circleCurve[i]['y'], this.circleCurve[i-1]['x'], this.circleCurve[i-1]['y']) > 5 ) {
                endShape();
                beginShape();
            }
            vertex(this.circleCurve[i]['x'], this.circleCurve[i]['y']);
        }
        endShape();
        pop();
    }

    drawCurve() {
        for (let i=0; i<this.points.length; i++) {
            if( this.points[0].isCloseToPoint(this.points[this.points.length-1]), 1) {
                push();
                if (i === 1 || i === this.points.length-2) {
                    fill (50, 240, 20);
                }
                this.points[i].display();
                pop();
            }
            else {
                this.points[i].display();
            }
        }
        push();
        noFill();
        stroke(10);
        beginShape();
        for (let t=0; t<=STEPS; t++) {
            vertex(this.curvePoints[t]['x'], this.curvePoints[t]['y']);
        }
        endShape();
        pop();
    }

    // TODO : draw the curve being drawn by the circle !
    drawCircle() {
        let t = this.circleDistance;
        let l_xCurve = this.curvePoints[t]['x'];
        let l_yCurve = this.curvePoints[t]['y'];
        let l_xTangent = this.curveTangents[t]['x'];
        let l_yTangent = this.curveTangents[t]['y'];
        // normal vector, doing a -PI/2 rotation (because y axis goes downward)
        let l_normal = createVector(-l_yTangent, l_xTangent);
        // TODO : except if the curve loops back on itself, do something about this
        if (this.circleDistance === 0 && this.circleLap === 0) {
            this.circleHandAngle = l_normal.heading() + PI;
        }
        else {
            let l_pIndex = (t+STEPS-1)%STEPS;
            let l_pxCurve = this.curvePoints[l_pIndex]['x'];
            let l_pyCurve = this.curvePoints[l_pIndex]['y'];
            let l_pxTangent = this.curveTangents[l_pIndex]['x'];
            let l_pyTangent = this.curveTangents[l_pIndex]['y'];
            let l_pNormal = createVector(-l_pyTangent, l_pxTangent);
            let l_tilt = l_normal.heading() - l_pNormal.heading();
            this.circleHandAngle -= -l_tilt + dist(l_xCurve, l_yCurve, l_pxCurve, l_pyCurve)/this.circleRadius;
        }
        l_normal.setMag(this.circleRadius);
        let l_handVector = p5.Vector.fromAngle(this.circleHandAngle);
        l_handVector.mult(this.circleRadius);
        let l_curvePoint = new Array();
        l_curvePoint['x'] = l_xCurve + l_normal.x + l_handVector.x;
        l_curvePoint['y'] = l_yCurve + l_normal.y + l_handVector.y;
        this.circleCurve.push(l_curvePoint)
        push();
        // curve point
        translate(l_xCurve, l_yCurve);
        ellipse(l_normal.x, l_normal.y, this.circleRadius*2);
        // Center of the circle
        translate(l_normal.x, l_normal.y);
        stroke(255,0,0);
        line(0, 0, l_handVector.x, l_handVector.y);
        pop();
        if (this.circleDistance === STEPS) {
            let l_lastIndex = this.points.length-1;
            if ( this.points[0].isCloseToPoint(this.points[l_lastIndex], 1) ) {
                this.circleDistance = 1;
            }
            else {
                this.circleDistance = 0;
            }
            this.circleLap++;
        }
        else {
            this.circleDistance++;
        }
    }

    move() {
        for (let i=0; i<this.points.length; i++) {
            let l_pointMoved = this.points[i].move();
            if (l_pointMoved) {
                for (let j=0; j<this.points.length; j++) {
                    if ( j !== i && this.points[i].isCloseToPoint(this.points[j]) ) {
                        this.points[j].highlight();
                    }
                    else {
                        this.points[j].unhighlight();
                    }
                }
                this.computeCurve();
                this.clearCircleCurve();
            }
        }
    }

    computeBernsteinPolynomials() {
        // console.log("computing Bernstein polynomials");
        for (let i=0; i<=this.order; i++) {
            this.bernsteinPolynomials[i] = new Array();
            let l_bern = bernsteinPolynomial(i,this.order);
            for (let t=0; t<=STEPS; t++) {
                this.bernsteinPolynomials[i][t] = l_bern(t/STEPS);
            }
        }
        for (let i=0; i<=this.order-1; i++) {
            this.bernsteinPolynomialsForDerivatives[i] = new Array();
            let l_bern = bernsteinPolynomial(i,this.order-1);
            for (let t=0; t<=STEPS; t++) {
                this.bernsteinPolynomialsForDerivatives[i][t] = l_bern(t/STEPS);
            }
        }
    }

    computeCurve() {
        // console.log("computing curve & tangent points");
        for (let t=0; t<=STEPS; t++) {
            let l_xCurve = 0;
            let l_yCurve = 0;
            for (let i=0; i<=this.order; i++) {
                let l_bern = this.bernsteinPolynomials[i][t];
                l_xCurve += l_bern*this.points[i].x;
                l_yCurve += l_bern*this.points[i].y;
            }
            this.curvePoints[t] = new Array();
            this.curvePoints[t]['x'] = l_xCurve;
            this.curvePoints[t]['y'] = l_yCurve;

            let l_xTangent = 0;
            let l_yTangent = 0;
            for (let i=0; i<=this.order-1; i++) {
                let l_bern = this.bernsteinPolynomialsForDerivatives[i][t];
                l_xTangent += l_bern*this.order*(this.points[i+1].x-this.points[i].x);
                l_yTangent += l_bern*this.order*(this.points[i+1].y-this.points[i].y);
            }
            this.curveTangents[t] = new Array();
            this.curveTangents[t]['x'] = l_xTangent;
            this.curveTangents[t]['y'] = l_yTangent;
        }
    }

    removePoint(aIndex) {
        console.log("removing a point");
        this.points.splice(aIndex,1);
        this.order--;
    }

    mousePressed() {
        // hold shift to add or remove a point
        // otherwise just move points you click on
        if (SHIFT_IS_HELD) {
            let l_removedPoints = false;
            for (let i=0; i<this.points.length; i++) {
                if (this.points[i].isMouseAbove()) {
                    for (let j=0; j<this.points.length; j++) {
                        if (j !== i && this.points[i].isCloseToPoint(this.points[j])) {
                            this.removePoint(j);
                        }
                    }
                    this.removePoint(i);
                    l_removedPoints = true;
                    break;
                }
            }
            if (!l_removedPoints) {
                console.log("adding a point");
                let l_min = null;
                let l_minIndex = null;
                for (let i=0; i<this.points.length; i++) {
                    let l_dist = dist(this.points[i].x, this.points[i].y, mouseX, mouseY);
                    if (l_min === null) {
                        l_min = l_dist;
                        l_minIndex = i;
                    }
                    else if (l_dist < l_min) {
                        l_min = l_dist;
                        l_minIndex = i;
                    }
                }
                if (l_minIndex == this.points.length - 1) {
                    console.log("++");
                    l_minIndex++;
                }
                this.points.splice(l_minIndex, 0, new MovablePoint(mouseX, mouseY));
                this.order++;
            }
            this.computeBernsteinPolynomials();
            this.computeCurve();
        }
        // NO SHIFT HELD
        else {
            for (let i=0; i<this.points.length; i++) {
                let l_isPointMoving;
                if (this.points[i].isMouseAbove()) {
                    console.log("moving " + i);
                    l_isPointMoving = this.points[i].setMoving();
                    if (l_isPointMoving) {
                        for (let j=0; j<this.points.length; j++) {
                            if ( j !== i && this.points[i].isCloseToPoint(this.points[j], 1) ) {
                                this.points[j].setMoving();
                            }
                        }
                    }
                    break;
                }
            }
        }
    }

    mouseReleased() {
        for (let i=0; i<this.points.length; i++) {
            let l_hasReleasedPoint = this.points[i].mouseReleased();
            if ( l_hasReleasedPoint ) {
                for (let j=0; j<this.points.length; j++) {
                    if (j !== i && this.points[i].isCloseToPoint(this.points[j]) && !this.points[j].moving) {
                        this.points[i].moveTo(this.points[j]);
                        this.computeBernsteinPolynomials();
                        this.computeCurve();
                        break;
                    }
                }
            }
        }
    }
}
