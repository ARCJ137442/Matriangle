export declare class Point {
    // Properties
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    // Methods
    clone(): Point;
    copyFrom(sourcePoint: Point): void;
    equals(toCompare: Point): boolean;
    offset(dx: number, dy: number): void;
    setTo(xa: number, ya: number): void;
    toString(): string;
}