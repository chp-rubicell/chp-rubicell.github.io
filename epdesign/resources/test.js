/*
// Create a GeometryFactory instance (used to create geometric objects)
const geometryFactory = new jsts.geom.GeometryFactory();

// Define the coordinates of the polygon (this example is a simple square)
const coordinates = [
    new jsts.geom.Coordinate(0, 0),
    new jsts.geom.Coordinate(0, 10),
    new jsts.geom.Coordinate(10, 10),
    new jsts.geom.Coordinate(10, 0),
    new jsts.geom.Coordinate(0, 0)  // Closing the polygon by repeating the first coordinate
];

// Create a LinearRing from the coordinates (the boundary of the polygon)
const linearRing = geometryFactory.createLinearRing(coordinates);

// Create the Polygon from the LinearRing
const polygon = geometryFactory.createPolygon(linearRing);

console.log(polygon.toText());

const point = geometryFactory.createPoint(new jsts.geom.Coordinate(5, 5));
const isInside = polygon.contains(point);

console.log(isInside);  // Outputs: true
*/

function test() {
    objects
    for (const [name, props] of Object.entries(renderObjects.F1)) {
        
    }
}
