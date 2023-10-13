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

/**
 * The `Matrix` from Flash
 * 
 * shape: 
 * ```
 * [ a c tx ]
 * | b d ty |
 * [ u v w]
 * ```
 * 
 * * Reference: https://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/geom/Matrix.html
 */
export abstract class Matrix {
    // Properties
    public constructor(
        public a: number = 0,
        public b: number = 0,
        public c: number = 0,
        public d: number = 0,
        public tx: number = 0,
        public ty: number = 0,
        protected u: number = 0,
        protected v: number = 0,
        protected w: number = 1
    ) { }

    // Methods
    public abstract translate(tx: number, ty: number): void;
    public abstract scale(sx: number, sy: number): void;
    public abstract rotate(q: number): void;

    public abstract concat(m: Matrix): void;
    public abstract invert(): void;
    public abstract clone(): Matrix;
    public abstract createBox(scaleX: number, scaleY: number, rotation?: number, tx?: number, ty?: number): void
    public abstract createGradientBox(scaleX: number, scaleY: number, rotation?: number, tx?: number, ty?: number): void

    public abstract deltaTransformPoint(point: Point): Point;
    public abstract transformPoint(point: Point): Point;

    public abstract setTo(aa: number, ba: number, ca: number, da: number, txa: number, tya: number): void;

}