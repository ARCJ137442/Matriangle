import { uint } from "../../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../../display/api/GlobalDisplayVariables";
import Projectile from "../Projectile";
import { FIXED_TPS } from "../../../../../main/GlobalWorldVariables";
import { IEntityFixedLived, IEntityOutGrid } from "../../../../../api/entity/EntityInterfaces";
import { IShape } from "../../../../../../display/api/DisplayInterfaces";
import { fPoint } from "../../../../../../common/geometricTools";
import IMatrix from "../../../../../main/IMatrix";
import { waveHurtPlayers } from "../../../mechanics/BatrMatrixMechanics";
import { mRot } from "../../../../../general/GlobalRot";
import IPlayer from "../../../../native/entities/player/IPlayer";

/**
 * 「波浪」
 * * 能穿过所有方块（无视地图阻挡）
 * * 伤害一切沿途接触到的玩家
 * * 在生成后随时间自身逐渐放大，伤害范围也逐渐扩大
 */
export default class Wave extends Projectile implements IEntityOutGrid, IEntityFixedLived {
	// !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给母体提供的）

	//============Static Variables============//
	public static readonly SIZE: number = DEFAULT_SIZE;
	public static readonly ALPHA: number = 0.64;
	public static readonly DEFAULT_SPEED: number = 24 / FIXED_TPS;
	public static readonly MAX_SCALE: number = 4;
	public static readonly MIN_SCALE: number = 1 / 4;
	public static readonly LIFE: uint = FIXED_TPS * 4;
	public static readonly DAMAGE_DELAY: uint = FIXED_TPS / 12;

	//============Instance Variables============//
	/** 记录在每个世界刻步进的步长（固定） */
	public speed: number = Wave.DEFAULT_SPEED;

	// 固定生命周期 //
	public readonly i_fixedLive: true = true;

	protected _life: uint = Wave.LIFE;
	public get life(): uint { return this._life; }
	public get LIFE(): uint { return Wave.LIFE; }
	public get lifePercent(): number { return this._life / Wave.LIFE }

	/**
	 * 记录当前达到的尺寸
	 * * 影响显示，也影响逻辑（伤害范围判定）
	 */
	public _nowScale: number = 1;
	public get nowScale(): number { return this._nowScale; }
	public set nowScale(value: number) { this._nowScale = value; }

	// 非格点实体 //
	public readonly i_outGrid: true = true;

	/** 记录自身位置 */
	protected _position: fPoint = new fPoint();
	public get position(): fPoint { return this._position; }
	public set position(value: fPoint) { this._position.copyFrom(value); }

	//============Constructor & Destructor============//
	/**
	 * 构造函数
	 * 
	 * ! 「攻击者伤害」计算出来之后，就没有「攻击者」啥事了
	 * 
	 * @param position 位置
	 * @param direction 移动的方向（任意维整数角）
	 * @param owner 所有者
	 * @param attackerDamage 所有者根据「武器默认伤害」与自身「伤害加成」计算出来的「攻击者伤害」
	 * @param chargePercent 充能百分比
	 */
	public constructor(
		owner: IPlayer | null,
		position: fPoint,
		direction: mRot,
		attackerDamage: uint, toolExtraDamageCoefficient: uint,
		chargePercent: number,
		finalRadius: number,
	) {
		/** 从最小到最大 */
		let tempScale = Wave.MIN_SCALE + (Wave.MAX_SCALE - Wave.MIN_SCALE) * chargePercent;
		super(
			owner,
			attackerDamage * (tempScale / Wave.MAX_SCALE),
			toolExtraDamageCoefficient,
			direction
		);
		this._nowScale = (
			owner === null ?
				tempScale :
				// (1 + owner.computeFinalRadius(tempScale) / 2)
				// TODO: ↑这个「computeFinalRadius」似乎是要放进某个「世界逻辑」对象中访问，而非「放在玩家的类里」任由其与世界耦合
				(1 + finalRadius / 2)
		);
		this._position.copyFrom(position);
		// this.shapeInit(shape: IBatrShape);
	}

	//============Instance Getter And Setter============//

	//============Display Implements============//

	/**
	 * 一个默认朝向为「x+」侧（右侧）的月牙形，如`)>`这样
	 * * 使用三次贝塞尔曲线绘制月牙形状
	 * @param shape 目标图形
	 */
	override shapeInit(shape: IShape): void {
		let realRadius: number = Wave.SIZE / 2;

		shape.graphics.beginFill(this.ownerColor, Wave.ALPHA);
		// Final:At last use three bezier curve
		shape.graphics.moveTo(-realRadius, realRadius);

		shape.graphics.curveTo(realRadius, realRadius, realRadius, 0);

		shape.graphics.curveTo(realRadius, -realRadius, -realRadius, -realRadius);
		shape.graphics.cubicCurveTo(
			realRadius / 2, -realRadius,
			realRadius / 2, realRadius,
			-realRadius, realRadius
		);
		shape.graphics.endFill();
	}

	/** 实现：除了尺寸变大，基本没有什么要刷新的 */ // TODO: 【2023-09-20 23:45:06】除了坐标？这个还需要处理一下，可能需要在显示端的图形那边进行「一对一绑定」
	public shapeRefresh(shape: IShape): void {
		shape.scaleX = shape.scaleY = this._nowScale;
	}

	public shapeDestruct(shape: IShape): void {
		shape.graphics.clear()
	}

	//====Tick Function====//
	override onTick(host: IMatrix): void {
		super.onTick(host);
		host.map.towardWithRot_FF(this._position, this._direction, this.speed); // ? 每次都要自己实现一遍？
		// 每过一固定周期伤害玩家
		if (this._life % Wave.DAMAGE_DELAY == 0) {
			waveHurtPlayers(host, this);
		}
		// 处理生命周期
		if (this._life > 0)
			this._life--;
		else
			host.removeEntity(this);
	}
}