
import { uint } from "../../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../../display/api/GlobalDisplayVariables";
import Projectile from "../Projectile";
import { IEntityFixedLived, IEntityInGrid } from "../../../../../api/entity/EntityInterfaces";
import { iPoint, intPoint } from "../../../../../../common/geometricTools";
import { IGraphicContext, IShape } from "../../../../../../display/api/DisplayInterfaces";
import IMatrix from "../../../../../main/IMatrix";
import { mRot } from "../../../../../general/GlobalRot";
import IPlayer from "../../../../native/entities/player/IPlayer";

/**
 * 「激光」是
 * * 在网格之内的（逻辑上从一格的方块**直线**延伸到另一格，属于「格点实体」）的
 * * 有一个「发射朝向」的
 * * 生成后在一固定周期内结束的
 * 抛射体
 */
export default abstract class Laser extends Projectile implements IEntityInGrid, IEntityFixedLived {

	//============Instance Variables============//
	/** 激光的长度 */
	public _length: uint;
	/** 对外只读的「激光长度」 */
	public get length(): number { return this._length; }
	/** 先前是否已对实体造成伤害 */
	public hasDamaged: boolean = false;

	//============Constructor & Destructor============//
	public constructor(
		owner: IPlayer | null,
		position: iPoint, direction: mRot,
		length: uint, LIFE: uint,
		attackerDamage: uint, extraDamageCoefficient: uint,
		chargePercent: number = 1 // * 没有「充能机制」就是「完全充能」
	) {
		super(owner, direction, attackerDamage * chargePercent, extraDamageCoefficient);
		this._position.copyFrom(position);
		this._length = length;
		this._LIFE = LIFE;
		this._life = LIFE * chargePercent;
	}

	// 固定生命周期 //
	public readonly i_fixedLive = true as const;

	/** 总存在时间 */
	protected _life: uint;
	protected _LIFE: uint;
	public get life(): uint { return this._life; }
	public get LIFE(): uint { return this._LIFE; }
	public get lifePercent(): number {
		return this._life / this._LIFE;
	}

	// 格点 //
	// public readonly i_inGrid = true as const;
	/** 
	 * 存储激光的格点位置
	 * * 坐标即为「激光根部」，又称「起始点」
	 */
	protected readonly _position: iPoint = new iPoint();
	/** 激光的格点位置（起始点） */
	get position(): intPoint { return this._position; }
	set position(value: intPoint) { this._position.copyFrom(value); }

	//============Instance Functions============//
	/**
	 * 处理生命周期
	 * * 不断减少「生命值」
	 * * 减少到0及以下：通知世界移除自身
	 * 
	 * @param host 母体
	 */
	public dealLife(host: IMatrix): void {
		if (--this._life <= 0) // ! 一到0便移除，避免多余的一次世界刻处理
			host.removeEntity(this); // TODO: 有待「实体系统」的修缮
	}

	/**
	 * 默认的「世界刻逻辑」：处理生命周期
	 * @param host 母体
	 */
	override onTick(host: IMatrix): void {
		this.dealLife(host);
	}

	/** 实现：不响应「所处方块更新」事件 */
	public onPositedBlockUpdate(host: IMatrix): void { }

	//============Display Implements============//

	/** 
	 * 唯一做的一件事，就是「缩放图形长度使其与激光长度一致」
	 * * 原理：图形上下文中只绘制「一格内激光的样子」（并且是类条形码横纹），再由图像拉伸机制把图形拉长
	 */
	public shapeInit(shape: IShape): void {
		shape.scaleX = this._length;
	}
	/** 
	 * 刷新：（暂时只）更新激光长度
	 * 
	 * ? 是否需要重绘图形，以便（每次显示更新时）响应玩家颜色
	 * * 可能的性能开销
	 */
	public shapeRefresh(shape: IShape): void {
		// this.shapeDestruct(shape);
		// this.shapeInit(shape);
		shape.scaleX = this._length;
	}
	/** 析构：清空图形上下文 */
	public shapeDestruct(shape: IShape): void {
		shape.graphics.clear();
	}

	/**
	 * 绘制一个「Beam」
	 * @param graphics 2D绘画上下文
	 * @param y1 以x轴为横轴的「起始垂直坐标」
	 * @param y2 以x轴为横轴的「终止垂直坐标」
	 * @param color 绘制的颜色
	 * @param alpha 绘制的不透明度
	 */
	protected drawLine(
		graphics: IGraphicContext,
		y1: number, y2: number,
		color: uint = 0xffffff,
		alpha: number = 1
	): void {
		const yStart: number = Math.min(y1, y2);
		graphics.beginFill(color, alpha);
		graphics.drawRect(
			0, yStart,
			DEFAULT_SIZE,
			Math.max(y1, y2) - yStart
		);
		graphics.endFill();
	}

	protected drawOwnerLine(
		graphics: IGraphicContext,
		y1: number, y2: number,
		alpha: number = 1
	): void {
		const yStart: number = Math.min(y1, y2);
		graphics.beginFill(this.ownerColor, alpha);
		graphics.drawRect(
			0, yStart,
			DEFAULT_SIZE,
			Math.max(y1, y2) - yStart
		);
		graphics.endFill();
	}
}
