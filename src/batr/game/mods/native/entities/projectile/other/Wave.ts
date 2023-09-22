import { uint } from "../../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../../display/api/GlobalDisplayVariables";
import EntityType from "../../../../../api/entity/EntityType";
import Player from "../../player/Player";
import Projectile from "../Projectile";
import { FIXED_TPS } from "../../../../../main/GlobalGameVariables";
import { IEntityFixedLived, IEntityOutGrid } from "../../../../../api/entity/EntityInterfaces";
import { IBatrShape } from "../../../../../../display/api/BatrDisplayInterfaces";
import { fPoint } from "../../../../../../common/geometricTools";
import IBatrGame from "../../../../../main/IBatrGame";
import { NativeEntityTypes } from "../../../registry/EntityRegistry";
import { waveHurtPlayers } from "../../../registry/NativeGameMechanics";

export default class Wave extends Projectile implements IEntityOutGrid, IEntityFixedLived {

	override get type(): EntityType { return NativeEntityTypes.WAVE; }

	//============Static Variables============//
	public static readonly SIZE: number = DEFAULT_SIZE;
	public static readonly ALPHA: number = 0.64;
	public static readonly DEFAULT_SPEED: number = 24 / FIXED_TPS;
	public static readonly MAX_SCALE: number = 4;
	public static readonly MIN_SCALE: number = 1 / 4;
	public static readonly LIFE: uint = FIXED_TPS * 4;
	public static readonly DAMAGE_DELAY: uint = FIXED_TPS / 12;

	//============Instance Variables============//
	/** 记录在每个游戏刻步进的步长（固定） */
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
	public readonly i_OutGrid: true = true;

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
	 * @param owner 所有者
	 * @param attackerDamage 所有者根据「武器默认伤害」与自身「伤害加成」计算出来的「攻击者伤害」
	 * @param chargePercent 充能百分比
	 */
	public constructor(
		position: fPoint,
		owner: Player | null,
		attackerDamage: uint,
		chargePercent: number
	) {
		/** 从最小到最大 */
		let tempScale = Wave.MIN_SCALE + (Wave.MAX_SCALE - Wave.MIN_SCALE) * chargePercent;
		super(owner, attackerDamage * (tempScale / Wave.MAX_SCALE));
		this._nowScale = (
			owner == null ?
				tempScale :
				(1 + owner.computeFinalRadius(tempScale) / 2)
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
	override shapeInit(shape: IBatrShape): void {
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
	public shapeRefresh(shape: IBatrShape): void {
		shape.scaleX = shape.scaleY = this._nowScale;
	}

	public shapeDestruct(shape: IBatrShape): void {
		shape.graphics.clear()
	}

	//====Tick Function====//
	override onTick(host: IBatrGame): void {
		super.onTick(host);
		host.map.logic.towardWithRot_FF(this._position, this._direction, this.speed); // ? 每次都要自己实现一遍？
		// 每过一固定周期伤害玩家
		if (this._life % Wave.DAMAGE_DELAY == 0) {
			waveHurtPlayers(host, this);
		}
		// 处理生命周期
		if (this._life > 0)
			this._life--;
		else
			host.entitySystem.remove(this);
	}
}