
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
    dot(other) {
        return this.constructor.dot(this, other);
    }
    isSimilar(other) {
        return (this.sub(other).size < THRESHOLD);
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
    isParallel(other) {
        return this.x * other.y == other.x * this.y;
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

/** Close the given coords */
function closeCoords(coords) {
    return coords.concat([coords[0]]);
}

/**
 * Check whether a point and a line are collinear.
 * @param {Vector} point - target point
 * @param {Vector[]} line - an array of two points defining a line
 * @returns {boolean} collinearity
 */
function pointCollinear(point, line) {
    if (!point) return false;
    const vec1 = line[1].sub(line[0]);
    const vec2 = point.sub(line[0]);
    return vec2.isParallel(vec1);
}

/**
 * Check whether a point is on a line.
 * @param {Vector} point - target point
 * @param {Vector[]} line - an array of two points defining a line
 * @returns {boolean} collinearity
 */
function pointOnLine(point, line) {
    if (!point) return false;
    const vec1 = line[1].sub(line[0]);
    const vec2 = point.sub(line[0]);
    if (!vec2.isParallel(vec1)) {
        return false;
    }
    else {
        const unitVec = vec1.unit;
        if (isBetween(vec2.dot(unitVec), 0, vec1.dot(unitVec))) {
            return true;
        }
        else return false;
    }
}

/**
 * Check whether the two lines are collinear.
 * @param {Vector[]} line1 - an array of two points defining the first line
 * @param {Vector[]} line2 - an array of two points defining the second line
 * @returns {boolean} collinearity
 */
function linesCollinear(line1, line2) {
    const vec1 = line1[1].sub(line1[0]);
    const vec2 = line2[1].sub(line2[0]);
    const isParallel = vec1.isParallel(vec2);
    const isCollinear = pointCollinear(line1[0], line2);
    return isParallel && isCollinear;
}

/**
 * Check whether the point is on a line.
 * @param {Vector} point - target point
 * @param {Vector[]} line - an array of two points defining a line
 * @returns {boolean} whether the point is on the line
 */
/*
TODO
function pointOnLine(point, line) {
    if (!point) return false;
    const [linePt1, linePt2] = line;
    const p = point.sub(linePt1);
    const l = linePt2.sub(linePt1);
    if (isSimilar(l.x, 0)) {
        if (isSimilar(p.x, 0) && isBetween(p.y, 0, l.y)) return true;
    }
    else if (isSimilar(l.y, 0)) {
        if (isSimilar(p.y, 0) && isBetween(p.x, 0, l.x)) return true;
    }
    else {
        if (isSimilar(p.x / l.x, p.y / l.y) && isBetween(p.x, 0, l.x)) return true;
    }
    return false;
}
*/

/**
 * Returns an intersection between two lines.
 * @param {Vector[]} line1 - an array of two points defining the first line
 * @param {Vector[]} line2 - an array of two points defining the second line
 * @returns {?Vector} intersection point
 */
function lineIntersection(line1, line2) {
    const [a1, a2] = line1;
    const a = a2.sub(a1).unit;
    const b1 = line2[0].sub(a1);
    const b2 = line2[1].sub(a1);
    const b = b2.sub(b1).unit
    const intA = (b1.x * b.y - b1.y * b.x) / (a.x * b.y - a.y * b.x);
    const intB = (a.x * b1.y - a.y * b1.x) / (b.x * a.y - b.y * a.x);
    return (0 <= intA && intA <= a2.sub(a1).size && 0 <= intB && intB <= b2.sub(b1).size) ? a.mul(intA).add(a1) : null;
}

/**
 * Returns the relative location of the intersecting segments.
 * @param {Vector[]} line - an array of two points defining the target line
 * @param {Vector[]} splicer - an array of two points defining the splicing line
 * @returns {?number[]} an array of the relative location of the intersecting segments
 */
function spliceLine(line, splicer) {
    if (!linesCollinear(line, splicer)) return null;
    const vec1 = line[1].sub(line[0]);
    const vec2a = splicer[0].sub(line[0]);
    const vec2b = splicer[1].sub(line[0]);
    const unitVec = vec1.unit;
    const b = vec1.dot(unitVec);  // second boundary (first boundary = 0)
    const s1 = vec2a.dot(unitVec);  // first splicer
    const s2 = vec2b.dot(unitVec);  // second splicer
    const d1 = checkDomains(s1, 0, b);  // domain of the first splicer
    const d2 = checkDomains(s2, 0, b);  // domain of the second splicer
    if (d1 * d2 > 0) {
        // 겹치지 않음
        return null;
    }
    else if (d1 * d2 == -1) {
        // line이 splicer에 포함됨
        return [0, 1];
    }
    else {
        // splicer 중 한 점만 포함됨 (d1 * d2 == 0)
        if (d1 == 0) {
            if (d2 < 0) {
                // (d2)  0--(d1)--b
                return [0, s1 / b];
            }
            else {
                // 0--(d1)--b  (d2)
                return [s1 / b, 1];
            }
        }
        else {
            if (d1 < 0) {
                // (d1)  0--(d2)--b
                return [0, s2 / b];
            }
            else {
                // 0--(d2)--b  (d1)
                return [s2 / b, 1];
            }
        }
    }
}

/**
 * Performs the even-odd-rule Algorithm (a raycasting algorithm) to find out whether a point is in a given polygon.
 * This runs in O(n) where n is the number of edges of the polygon.
 * (https://www.algorithms-and-technologies.com/point_in_polygon/javascript)
 * @param {Array} polygon an array representation of the polygon where polygon[i][0] is the x Value of the i-th point and polygon[i][1] is the y Value.
 * @param {Array} point   an array representation of the point where point[0] is its x Value and point[1] is its y Value
 * @return {boolean} whether the point is in the polygon (not on the edge, just turn < into <= and > into >= for that)
 */
function pointInPolygon(polygon, point) {
    //A point is in a polygon if a line from the point to infinity crosses the polygon an odd number of times
    let odd = false;
    //For each edge (In this case for each point of the polygon and the previous one)
    for (let i = 0, j = polygon.length - 1; i < polygon.length; i++) {
        if (pointOnLine(point, [polygon[i], polygon[j]])) {
            // if point in on the edge, return false
            return false;
        }
        //If a line from the point into infinity crosses this edge
        if (((polygon[i][1] > point[1]) !== (polygon[j][1] > point[1])) // One point needs to be above, one below our y coordinate
            // ...and the edge doesn't cross our Y corrdinate before our x coordinate (but between our x coordinate and infinity)
            && (point[0] < ((polygon[j][0] - polygon[i][0]) * (point[1] - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0]))) {
            // Invert odd
            odd = !odd;
        }
        j = i;
    }
    //If the number of crossings was odd, the point is in the polygon
    return odd;
}

function getPolygonCentroid(polygon) {
    let pts = [...polygon]
    let first = pts[0], last = pts[pts.length-1];
    if (first.x != last.x || first.y != last.y) pts.push(first);
    let twicearea=0,
    x=0, y=0,
    nPts = pts.length,
    p1, p2, f;
    for ( var i=0, j=nPts-1 ; i<nPts ; j=i++ ) {
        p1 = pts[i]; p2 = pts[j];
        f = p1.x*p2.y - p2.x*p1.y;
        twicearea += f;
        x += ( p1.x + p2.x ) * f;
        y += ( p1.y + p2.y ) * f;
    }
    f = twicearea * 3;
    return new Vector(x/f, y/f);
}
