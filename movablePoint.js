class MovablePoint {
    constructor(aX, aY) {
        this.x = aX;
        this.y = aY;
        this.radius = 5;
        this.clickRadius = 7;
        this.moving = false;
    }

    move() {
        if (this.moving) {
            this.x += mouseX - pmouseX;
            this.y += mouseY - pmouseY;
            if (this.x > width) {
                this.x = width;
            }
            else if (this.x < 0) {
                this.x = 0;
            }
            if (this.y > height) {
                this.y = height;
            }
            else if (this.y < 0) {
                this.y = 0;
            }
            return true;
        }
        else {
            return false;
        }
    }

    moveTo(aOtherPoint) {
        this.x = aOtherPoint.x;
        this.y = aOtherPoint.y;
    }

    display() {
        push();
        if (this.highlighted) {
            fill(255, 204, 0);
        }
        ellipse(this.x, this.y, 5);
        pop();
    }

    highlight() {
        this.highlighted = true;
    }

    unhighlight() {
        this.highlighted = false;
    }

    isMouseAbove() {
        if ( dist(this.x, this.y, mouseX, mouseY) < this.clickRadius) {
            return true;
        }
        else {
            return false;
        }
    }

    isCloseToPoint(aOtherPoint, aRadius) {
        if (typeof(aRadius) === "undefined") {
            aRadius = this.clickRadius;
        }
        if ( dist(this.x, this.y, aOtherPoint.x, aOtherPoint.y) <= aRadius) {
            return true;
        }
        else {
            return false;
        }
    }

    setMoving() {
        if (!this.moving) {
            this.moving = true;
            return true;
        }
        else {
            return false;
        }
    }

    mouseReleased() {
        if (this.moving) {
            this.moving = false;
            return true;
        }
        else {
            return false;
        }
    }
}
