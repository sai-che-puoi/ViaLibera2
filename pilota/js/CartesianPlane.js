
export class CartesianPlane {
    constructor(svgElement, config) {
        this.svg = svgElement;
        this.config = config;
        this.elements = {
            point: document.getElementById('resultPoint'),
            verticalLine: document.getElementById('verticalLine'),
            horizontalLine: document.getElementById('horizontalLine'),
            coordinates: document.getElementById('coordinatesText')
        };
    }

    /**
     * Update plane with new coordinates
     */
    update(xPct, yPct) {
        // Convert percentage to SVG coordinates
        const svgX = (xPct / 100) * 500;
        const svgY = 480 - (yPct / 100) * 480; // Invert Y

        this.elements.point.setAttribute('cx', svgX);
        this.elements.point.setAttribute('cy', svgY);

        // this.elements.verticalLine.setAttribute('x1', svgX);
        // this.elements.verticalLine.setAttribute('x2', svgX);
        // this.elements.horizontalLine.setAttribute('y1', svgY);
        // this.elements.horizontalLine.setAttribute('y2', svgY);
    }
}