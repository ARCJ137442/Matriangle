import { uint } from "../../legacy/AS3Legacy";
import { Matrix } from "../../legacy/flash/geom";
import { IChildContainer } from '../../common/abstractInterfaces';

/**
 * the interface faced to logical object that can manipulate its display status
 * * it will manipulate an shape that corresponds itself
 */
export interface IBatrDisplayable {
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
 * 这个接口是所有以前继承flash形状/MovieClip接口的统一管理。
 * 
 * It abstracts the functionality of the original strong coupling with flash, 
 * 它抽象了原来与flash强耦合的功能，
 * so that the logic can control the front-end rendering and separate from the concrete implementation of the display.
 * 使逻辑可以控制前端的呈现，并与具体的显示实现分离。
 */
export interface IBatrShape extends IBatrDisplayable {
    /**
     * migrate from Flash's Graphics object, then implements with another interface
     * 从Flash的Graphics对象迁移过来，并使用另一个接口实现
     */
    graphics: IBatrGraphicContext;

    /**
     * 图形（在容器中）的x坐标
     */
    get x(): number;
    set x(x: number)

    /**
     * （在容器中）图形的y坐标
     */;
    get y(): number;
    set y(y: number);

    /**
     * 图形的**旋转角度**
     */
    get rot(): number;
    set rot(rot: number);
}

/**
 * 此接口用于容纳Shape对象，并对实现着要求实现各类「增删改查」特性
 * * 目前使用数组作为容器存放子元素的「容器」，故其索引为自然数
 */

export interface IBatrShapeContainer extends IBatrShape, IChildContainer<IBatrShape, uint> { }

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
