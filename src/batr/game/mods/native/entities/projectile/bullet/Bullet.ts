import { fPoint, iPoint, floatPoint } from "../../../../../../common/geometricTools";
import { IBatrShape } from "../../../../../../display/api/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../../../../display/api/GlobalDisplayVariables";
import { logical2Real } from "../../../../../../display/api/PosTransform";
import { uint } from "../../../../../../legacy/AS3Legacy";
import Block from "../../../../../api/block/Block";
import { IEntityOutGrid } from "../../../../../api/entity/EntityInterfaces";
import { alignToGrid_P } from "../../../../../general/PosTransform";
import IBatrGame from "../../../../../main/IBatrGame";
import Projectile from "../Projectile";
import { mRot } from "../../../../../general/GlobalRot";
import IPlayer from "../../player/IPlayer";

/**
 * 「子弹」是
 * * 直线飞行的
 * * 在撞上方块后产生效果（一般是爆炸）的
 * 抛射体
 */
export default abstract class Bullet extends Projectile implements IEntityOutGrid {

	/** 子弹飞行的速度（每个游戏刻） */
	public speed: number;
	/** 最终爆炸半径「用于内置的『爆炸』函数」 */
	public finalExplodeRadius: number;

	/** 先前所在的方块类型 */
	public lastBlock: Block | null = null;
	/** 现在所在的方块类型 */
	public nowBlock: Block | null = null;

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
		this._position.copyFrom(position)

		// this.finalExplodeRadius = (owner == null) ? defaultExplodeRadius : owner.computeFinalRadius(defaultExplodeRadius);
		this.finalExplodeRadius = finalExplodeRadius;
		// TODO: ↑这个「computeFinalRadius」似乎是要放进某个「游戏逻辑」对象中访问，而非「放在玩家的类里」任由其与游戏耦合
	}

	//============Interface Methods============//
	// 坐标 //
	public readonly i_OutGrid: true = true;

	/** 内部定义的坐标 */
	protected readonly _position: fPoint = new fPoint();
	/** （缓存用）现在所在的网格位置（整数点） */
	protected readonly _position_I: iPoint = new iPoint()
	/**
	 * 外部读写坐标
	 * 
	 * ! 注意：写入坐标时，自身「坐标对象」引用不会改变
	 */
	get position(): floatPoint { return this._position }
	set position(value: floatPoint) { this._position.copyFrom(value) }

	// 活跃 //
	readonly i_active: true = true;

	/**
	 * 游戏刻更新函数
	 *  * 可被子类多次&任意顺序的`super.onTick`调用
	 * 
	 * @param host 调用它的「游戏主体」
	 */
	public onTick(host: IBatrGame): void {
		super.onTick(host);
		// Move
		// Detect
		// if (host == null) return;
		this.nowBlock = host.map.storage.getBlock(this.position);
		// 在移动进去之前
		if (this.lastBlock != this.nowBlock) {
			// Random rotate
			if (this.nowBlock != null &&
				this.nowBlock.attributes.rotateWhenMoveIn) {
				this.direction = host.map.storage.randomRotateDirectionAt(this._position_I, this._direction, 1);
			}
		}
		// 移动
		host.map.towardWithRot_FF(this._position, this._direction, this.speed);
		// 更新整数坐标
		alignToGrid_P(this._position, this._position_I);
		// 移动进去之后
		if (host.map.isInMap_F(this.position) &&
			host.map.testCanPass_F(this._position, false, true, false)) {
			this.lastBlock = this.nowBlock;
		}
		else {
			this.explode(host);
		}
	}

	// 显示 //
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 80;
	public static readonly SIZE: number = logical2Real(3 / 8);

	readonly i_displayable: true = true;
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
	public shapeInit(shape: IBatrShape): void {
		let realRadiusX: number = Bullet.SIZE / 2;
		let realRadiusY: number = Bullet.SIZE / 2;

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

	public shapeRefresh(shape: IBatrShape): void {

	}

	public shapeDestruct(shape: IBatrShape): void {
		shape.graphics.clear();
	}

	//============Game Mechanics============//
	/**
	 * 子弹（在碰撞等情况中）爆炸的逻辑
	 * * 默认逻辑：通知「游戏主体」移除自身
	 * 
	 * @param host 要处理爆炸的游戏主体
	 */
	protected explode(host: IBatrGame): void {
		host.removeEntity(this);
	}

}
