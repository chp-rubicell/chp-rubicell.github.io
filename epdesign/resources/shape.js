
//+ ------------------------------------------------------------------- +//
//MARK: Vector object

class Vector extends Array {
    constructor(x, y) {
        super(x, y);
        this._x = x;
        this._y = y;
    }
    get x() {
        return this._x;
    }
    set x(value) {
        this[0] = value;
        this._x = value;
    }
    get y() {
        return this._y;
    }
    set y(value) {
        this[1] = value;
        this._y = value;
    }
    get size() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }
    get unit() {
        return this.div(this.size);
    }
    get abs() {
        return new this.constructor(Math.abs(this.x), Math.abs(this.y));
    }
    get angle() {
        return Math.atan(this.y/this.x);
    }
    get angleDeg() {
        return Math.degrees(this.angle);
    }
    get angle2() {
        return Math.atan2(this.y, this.x);
    }
    get angleDeg2() {
        return Math.degrees(this.angle2);
    }
    add(...arg) {
        switch (arg.length) {
            case 1:
                var other = arg[0];
                if (other instanceof this.constructor) {
                    // Vector가 주어졌을 때
                    return new this.constructor(this.x + other.x, this.y + other.y);
                }
                else {
                    // 값이 주어졌을 때
                    return new this.constructor(this.x + other, this.y + other);
                }
            case 2:
                // x, y가 주어졌을 때
                return new this.constructor(this.x + arg[0], this.y + arg[1]);
            default:
                return null;
        }
    }
    sub(...arg) {
        switch (arg.length) {
            case 1:
                var other = arg[0];
                if (other instanceof this.constructor) {
                    // Vector가 주어졌을 때
                    return new this.constructor(this.x - other.x, this.y - other.y);
                }
                else {
                    // 값이 주어졌을 때
                    return new this.constructor(this.x - other, this.y - other);
                }
            case 2:
                // x, y가 주어졌을 때
                return new this.constructor(this.x - arg[0], this.y - arg[1]);
            default:
                return null;
        }
    }
    mul(...arg) {
        var other = arg[0];
        if (other instanceof this.constructor) {
            // Vector가 주어졌을 때
            return new this.constructor(this.x * other.x, this.y * other.y);
        }
        else {
            // 값이 주어졌을 때
            return new this.constructor(this.x * other, this.y * other);
        }
    }
    div(...arg) {
        var other = arg[0];
        if (other instanceof this.constructor) {
            // Vector가 주어졌을 때
            return new this.constructor(this.x / other.x, this.y / other.y);
        }
        else {
            // 값이 주어졌을 때
            return new this.constructor(this.x / other, this.y / other);
        }
    }
    lessThan(other) {
        return (this.x < other.x) && (this.y < other.y);
    }
    flipX() {
        return new this.constructor(-this.x, this.y);
    }
    flipY() {
        return new this.constructor(this.x, -this.y);
    }
    rotate(rad) {
        return new this.constructor(
            Math.cos(rad) * this.x - Math.sin(rad) * this.y,
            Math.sin(rad) * this.x + Math.cos(rad) * this.y
        );
    }
    rotateDeg(deg) {
        return this.rotate(Math.radians(deg))
    }
    static midPoint(v1, v2) {
        return this.mean(v1, v2);
    }
    static distance(v1, v2) {
        return v2.sub(v1).size;
    }
    static fromAngle(rad) {
        return new this(Math.cos(rad), Math.sin(rad));
    }
    static fromAngleDeg(deg) {
        return this.fromAngle(Math.radians(deg));
    }
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
    static min(...vectors) {
        // let min = new this(...vectors[0]);
        // for (const v of vectors.slice(1)) {
        //     min.x = (v.x < min.x ? v.x : min.x);
        //     min.y = (v.y < min.y ? v.y : min.y);
        // }
        // return min;
        return new this(
            Math.min(...vectors.map(v => v.x)),
            Math.min(...vectors.map(v => v.y)),
        )
    }
    static max(...vectors) {
        return new this(
            Math.max(...vectors.map(v => v.x)),
            Math.max(...vectors.map(v => v.y)),
        )
    }
    static sum(...vectors) {
        return vectors.reduce((a, b) => a.add(b), new this(0, 0));
    }
    static mean(...vectors) {
        return this.sum(...vectors).div(vectors.length);
    }
}

//+ ------------------------------------------------------------------- +//
//MARK: Operations

function pointOnLine(point, linePt1, linePt2) {
    const p = point.sub(linePt1);
    const l = linePt2.sub(linePt1);
    if (l.x == 0) {
        if (p.x == 0) return true;
    }
    else if (l.y == 0) {
        if (p.y == 0) return true;
    }
    else {
        if (p.x / l.x == p.y / l.y) return true;
    }
    return false;
}

function lineIntersection(line1, line2) {
    const [a1, a2] = line1;
    const a = a2.sub(a1);
    const b1 = line2[0].sub(a1);
    const b2 = line2[1].sub(a1);
}
