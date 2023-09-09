import { uint } from "../legacy/AS3Legacy";
import { Matrix } from "../legacy/flash/geom";

/**
 * the interface faced to logical object that can manipulate its display status
 * * it will manipulate an shape that corresponds itself
 */
export interface IBatrRenderable {
    /**
     * call when initial create/display the shape, usually contains the graphics context.
     * @param shape the display object corresponds `Shape` in Flash.
     */
    shapeInit(shape: IBatrShape): void;

    /**
     * The same as `shapeInit`, but it will be called by object rerendering 
     * 
     * ! May contains position updates
     * @param shape the display object corresponds `Shape` in Flash.
     */
    shapeRefresh(shape: IBatrShape): void;

    /**
     * The destructor of shape, it will be called by object rerendering 
     * 
     * ! It may not call after the destructor instantly 
     * 
     * @param shape the display object corresponds `Shape` in Flash.
     */
    shapeDestruct(shape: IBatrShape): void;
}

/**
 * This interface is the unified management of all previous inherited flash Shape/MovieClip interface.
 * 
 * It abstracts the functionality of the original strong coupling with flash, 
 * so that the logic can control the front-end rendering and separate from the concrete implementation of the display.
 */
export interface IBatrShape {
    /**
     * migrate from Flash's Graphics object, which implements with another interface
     */
    graphics: IBatrGraphicContext;

    /**
     * The **rotation** of the shape, default is `0`.
     */
    get rot(): number;
    set rot(rot: number);
}

/**
 * The migrated interface from `flash.display.Graphics`
 * * Reference: https://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/display/Graphics.html
 */
export interface IBatrGraphicContext {
    clear(): void;

    beginFill(color: uint, alpha?: number/*=1.0*/): void;
    beginGradientFill(
        type: string,
        colors: uint[], alphas: number[],/*=1.0*/
        ratios: number[],
        matrix?: Matrix,/*=null*/
        spreadMethod?: string,/*='pad'*/
        interpolationMethod?: string,/* = "rgb"*/
        focalPointRatio?: number/* = 0*/
    ): void;
    endFill(): void;

    copyFrom(sourceGraphics: IBatrGraphicContext): void

    drawRect(x: number, y: number, width: number, height: number): void
    drawRoundRect(x: number, y: number, width: number, height: number, ellipseWidth: number, ellipseHeight?: number/* = NaN*/): void

    drawCircle(x: number, y: number, radius: number): void;
    drawEllipse(x: number, y: number, width: number, height: number): void


    curveTo(controlX: number, controlY: number, anchorX: number, anchorY: number): void
    cubicCurveTo?(controlX1: number, controlY1: number, controlX2: number, controlY2: number, anchorX: number, anchorY: number): void

    lineStyle(thickness: number/*\1*/, color: uint/*\1*/, alpha?: number/*\1*/, pixelHinting?: boolean/*\1*/, scaleMode?: string/*\1*/, caps?: string/*\1*/, joints?: string/*\1*/, miterLimit?: number/* = 3*/): void
    // lineGradientStyle

    lineTo(x: number, y: number): void
    moveTo(x: number, y: number): void

}
