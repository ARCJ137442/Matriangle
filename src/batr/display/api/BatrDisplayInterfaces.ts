import { uint } from "../../legacy/AS3Legacy";
import { Matrix } from "../../legacy/flash/geom";
import { IChildContainer } from '../../common/abstractInterfaces';

/**
 * the interface faced to logical object that can manipulate its display status
 * 一个面对逻辑对象的接口，使逻辑对象可以操纵其显示状态
 * * it will manipulate an shape that corresponds itself
 * * 它将操作一个与自己对应的显示对象
 */
export interface IBatrDisplayable {
    /**
     * call when initial create/display the shape, usually contains the graphics context.
     * * 当第一次加载时调用，用于显示对象的初始化
     * 
     * @param shape the display object corresponds `Shape` in Flash.
     */
    shapeInit(shape: IBatrShape): void;

    /**
     * The same as `shapeInit`, but it will be called by object refreshing 
     * * 在显示对象内部需要重绘（内部几何线条图形、颜色等……）
     * 
     * ! May contains position updates
     * ! 【20230913 23:25:03】目前不包括平移、旋转等操作
     * 
     * @param shape the display object corresponds `Shape` in Flash.
     */
    shapeRefresh(shape: IBatrShape): void;

    /**
     * The destructor of shape, it will be called by object rerendering 
     * * 当显示对象需要被销毁时调用的函数
     * 
     * ! It may not call after the destructor instantly 
     * ! 这不一定会紧跟在「显示对象的析构函数」后调用
     * 
     * @param shape the display object corresponds `Shape` in Flash.
     */
    shapeDestruct(shape: IBatrShape): void;

    /**
     * 控制对象显示堆叠时的「相对层级」
     * * 用于在原先以「对象容器の层级」表示的「显示层级系统」
     * 
     * * 例如：Wall应该在玩家之上，而「SpawnPointMark」应在玩家之下
     * 
     * ! 协议：「显示层级被更改」需要告知显示方「需要更新」
     * ? 或许会加入类似「事件侦听器」这样的东西
     */
    get zIndex(): uint;
    set zIndex(value: uint);
}

/**
 * This interface is the unified management of all previous inherited flash Shape/MovieClip interface.
 * * 这个接口是所有以前继承flash形状/MovieClip接口的统一管理。
 * 
 * It abstracts the functionality of the original strong coupling with flash, 
 * * 它抽象了原来与flash强耦合的功能，
 * so that the logic can control the front-end rendering and separate from the concrete implementation of the display.
 * * 使逻辑端可以控制显示端的呈现，并与「具体显示平台实现」分离。
 *   * 如：逻辑端只需要调用这个文件里接口有的方法，不需要管这个IBaTrShape到底是用H5还是QT实现的
 */
export interface IBatrShape extends IBatrDisplayable {

    /**
     * 决定图形x轴上的「缩放尺寸」
     */
    get scaleX(): number;
    set scaleX(value: number);

    /**
     * 决定图形y轴上的「缩放尺寸」
     */
    get scaleY(): number;
    set scaleY(value: number);

    /**
     * migrate from Flash's Graphics object, then implements with another interface
     * 从Flash的Graphics对象迁移过来，并使用另一个接口实现
     */
    get graphics(): IBatrGraphicContext;

    /**
     * 图形「是否显示」
     */
    get isVisible(): boolean;
    set isVisible(value: boolean);

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
 * 迁移自Flash的Graphics类
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
