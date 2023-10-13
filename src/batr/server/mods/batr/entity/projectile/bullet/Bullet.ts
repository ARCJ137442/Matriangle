import { fPoint, iPoint, floatPoint } from "../../../../../../common/geometricTools";
import { IShape } from "../../../../../../display/api/DisplayInterfaces";
import { DEFAULT_SIZE } from "../../../../../../display/api/GlobalDisplayVariables";
import { logical2Real } from "../../../../../../display/api/PosTransform";
import { uint } from "../../../../../../legacy/AS3Legacy";
import Block from "../../../../../api/block/Block";
import { IEntityFixedLived, IEntityOutGrid } from "../../../../../api/entity/EntityInterfaces";
import { alignToGrid_P } from "../../../../../general/PosTransform";
import IMatrix from "../../../../../main/IMatrix";
import Projectile from "../Projectile";
import { mRot } from "../../../../../general/GlobalRot";
import IPlayer from "../../../../native/entities/player/IPlayer";
import { getPlayers } from "../../../../native/mechanics/NativeMatrixMechanics";

/**
 * 「子弹」是
 * * 直线飞行的
 * * 在撞上方块后产生效果（一般是爆炸）的
 * 抛射体
 */
export default abstract class Bullet extends Projectile implements IEntityOutGrid, IEntityFixedLived {

	/** 子弹飞行的速度（每个世界刻） */
	public speed: number;
	/** 最终爆炸半径「用于内置的『爆炸』函数」 */
	public finalExplodeRadius: number;

	/** 先前所在的方块类型 */
	public lastBlock: Block | null = null;
	/** 现在所在的方块类型 */
	public nowBlock: Block | null = null;

	// 固定生命周期 //
	public readonly i_shortLive = true as const;
	/**
	 * 一个最简单的「固定生命周期」值
	 */
	public static readonly LIFE: uint = 3200;
	public LIFE: uint = 3200;
	public life: uint = this.LIFE;
	public get lifePercent(): number { return this.life / this.LIFE; }

	//============Constructor & Destructor============//
	public constructor(
		owner: IPlayer | null,
		position: fPoint,
		direction: mRot,
		attackerDamage: uint, extraDamageCoefficient: uint,
		speed: number,
		finalExplodeRadius: number
	) {
		super(owner, attackerDamage, extraDamageCoefficient, direction);
		this.speed = speed;
		this._position.copyFrom(position);

		// this.finalExplodeRadius = (owner === null) ? defaultExplodeRadius : owner.computeFinalRadius(defaultExplodeRadius);
		this.finalExplodeRadius = finalExplodeRadius;
		// TODO: ↑这个「computeFinalRadius」似乎是要放进某个「世界逻辑」对象中访问，而非「放在玩家的类里」任由其与世界耦合
	}

	/**
	 * 根据外界设置，初始化生命周期
	 */
	public initLife(LIFE: uint | undefined): this {
		// 若外界没传入（实际上就是「没有规则」的状态），就使用默认生命周期
		if (LIFE !== undefined)
			this.life = this.LIFE = LIFE;
		return this;
	}

	//============Interface Methods============//
	// 坐标 //
	public readonly i_outGrid = true as const;

	/** 内部定义的坐标 */
	protected readonly _position: fPoint = new fPoint();
	/** （缓存用）现在所在的网格位置（整数点） */
	protected readonly _position_I: iPoint = new iPoint();
	/**
	 * 外部读写坐标
	 * 
	 * ! 注意：写入坐标时，自身「坐标对象」引用不会改变
	 */
	get position(): floatPoint { return this._position; }
	set position(value: floatPoint) { this._position.copyFrom(value); }

	// 活跃 //
	readonly i_active = true as const;

	/**
	 * 世界刻更新函数
	 *  * 可被子类多次&任意顺序的`super.onTick`调用
	 * 
	 * @param host 调用它的母体
	 */
	public onTick(host: IMatrix): void {
		super.onTick(host);
		// 生命周期更新
		if (--this.life <= 0) {
			// 直接爆炸
			this.explode(host);
			return;
		}
		// 方块碰撞检测
		this.nowBlock = host.map.storage.getBlock(this.position);
		// 在移动进去之前
		if (this.lastBlock !== this.nowBlock) {
			// Random rotate
			if (this.nowBlock !== null &&
				this.nowBlock.attributes.rotateWhenMoveIn) {
				this.direction = host.map.storage.randomRotateDirectionAt(this._position_I, this._direction, 1);
			}
			// TODO: 未能触发，待解决bug
			// 更新「上一个方块」
			this.lastBlock = this.nowBlock;
		}
		// 移动
		host.map.towardWithRot_FF(this._position, this._direction, this.speed);
		// 更新整数坐标
		alignToGrid_P(this._position, this._position_I);
		// 移动进去之后
		if (host.map.isInMap_F(this.position) &&
			host.map.testCanPass_F(
				this._position,
				false, true, false,
				false,
				true, getPlayers(host)
			)) {
			this.lastBlock = this.nowBlock;
		}
		else {
			// 反向前进，不要「墙里炸」
			host.map.towardWithRot_FF(this._position, this._direction, -this.speed);
			// 爆炸
			this.explode(host);
		}
	}

	// 显示 //
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 80;
	public static readonly SIZE: number = logical2Real(3 / 8);

	readonly i_displayable = true as const;
	/** （二维）显示覆盖优先级 */
	protected _zIndex: uint = 0;
	/**
	 * （公开的）显示覆盖优先级
	 * 
	 * ? 或许在设置的时候，也需要更新：不再由Flash管理
	 */

	/**
	 * 初始化：绘制基本的子弹轮廓
	 * * 三角外形
	 * * （已弃用）渐变填充
	 * 
	 * @param shape 初始化要绘制到的图形
	 */
	public shapeInit(shape: IShape): void {
		const realRadiusX: number = Bullet.SIZE / 2;
		const realRadiusY: number = Bullet.SIZE / 2;

		shape.graphics.lineStyle(Bullet.LINE_SIZE, this.ownerLineColor);
		shape.graphics.beginFill(this.ownerColor);
		/* GRADIENT-FILL REMOVED
		let m:Matrix=new Matrix()
		m.createGradientBox(SIZE,
							SIZE,0,-realRadiusX,-realRadiusX)
		beginGradientFill(GradientType.LINEAR,
		[this.ownerColor,ownerLineColor],
		[1,1],
		[63,255],
		m,
		SpreadMethod.PAD,
		InterpolationMethod.RGB,
		1)
		*/
		shape.graphics.moveTo(-realRadiusX, -realRadiusY);
		shape.graphics.lineTo(realRadiusX, 0);
		shape.graphics.lineTo(-realRadiusX, realRadiusY);
		shape.graphics.lineTo(-realRadiusX, -realRadiusY);
		shape.graphics.endFill();
	}

	public shapeRefresh(shape: IShape): void {

	}

	public shapeDestruct(shape: IShape): void {
		shape.graphics.clear();
	}

	//============World Mechanics============//
	/**
	 * 子弹（在碰撞等情况中）爆炸的逻辑
	 * * 默认逻辑：通知母体移除自身
	 * 
	 * @param host 要处理爆炸的母体
	 */
	protected explode(host: IMatrix): void {
		host.removeEntity(this);
	}

}
