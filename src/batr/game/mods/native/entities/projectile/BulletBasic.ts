import { fPoint, floatPoint } from "../../../../../common/geometricTools";
import { IBatrShape } from "../../../../../display/api/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../../../display/api/GlobalDisplayVariables";
import { localPosToRealPos } from "../../../../../display/api/PosTransform";
import { uint } from "../../../../../legacy/AS3Legacy";
import Block, { BlockType } from "../../../../api/block/Block";
import { IEntityOutGrid } from "../../../../api/entity/EntityInterfaces";
import { FIXED_TPS } from "../../../../main/GlobalGameVariables";
import IBatrGame from "../../../../main/IBatrGame";
import ToolType from "../../ToolType";
import BlockVoid from "../../blocks/Void";
import EntityType from "../../registry/EntityRegistry";
import Player from "../player/Player";
import Projectile from "./Projectile";

/**
 * 「子弹」是
 * ①直线飞行的
 * ②在撞上方块后产生效果（一般是爆炸）的
 * 抛射体
 */
export default class BulletBasic extends Projectile implements IEntityOutGrid {

	//============Static Variables============//
	public static readonly DEFAULT_SPEED: number = 16 / FIXED_TPS;
	public static readonly DEFAULT_EXPLODE_RADIUS: number = 1;

	override get type(): EntityType { return EntityType.BULLET_BASIC; }

	/** 子弹飞行的速度（每个游戏刻） */
	public speed: number;
	/** 最终爆炸半径「用于内置的『爆炸』函数」 */
	public finalExplodeRadius: number;

	/** 先前所在的方块类型 */
	public lastBlock: Block | null = null;
	/** 现在所在的方块类型 */
	public nowBlock: Block | null = null;

	/** 子弹的「直接或间接」伤害 */
	public damage: uint;

	//============Constructor & Destructor============//
	public constructor(host: IBatrGame, x: number, y: number,
		owner: Player,
		speed: number = BulletBasic.DEFAULT_SPEED,
		defaultExplodeRadius: number = BulletBasic.DEFAULT_EXPLODE_RADIUS): void {
		super(owner);
		this.speed = speed;

		this.finalExplodeRadius = owner == null ? defaultExplodeRadius : owner.computeFinalRadius(defaultExplodeRadius);
		// TODO: 这个「computeFinalRadius」似乎是要放进某个「游戏逻辑」对象中访问，而非「放在玩家的类里」任由其与游戏耦合
		this._ownerTool = ToolType.BULLET;

		this.damage = this._ownerTool.defaultDamage;
		this.drawShape();
	}

	//============Interface Methods============//
	// 坐标 //
	public readonly i_InGrid: false = false;

	/** 内部定义的坐标 */
	protected readonly _position: fPoint = new fPoint();
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
		if (this.lastBlock != this.nowBlock) {
			// Random rotate
			if (this.nowBlock != null &&
				this.nowBlock.currentAttributes.rotateWhenMoveIn) {
				this.rot += exMath.random1();
			}
		}
		this.moveForward(this.speed);

		if (host.map.logic.isInMap_F(this.position) &&
			host.map.logic.testCanPass_F(this._position, false, true, false)) {
			this.lastBlock = this.nowBlock;
		}
		else {
			this.explode();
		}
	}

	// 显示 //
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 80;
	public static readonly SIZE: number = localPosToRealPos(3 / 8);

	readonly i_displayable: true = true;
	/** （二维）显示覆盖优先级 */
	protected _zIndex: uint = 0;
	/**
	 * （公开的）显示覆盖优先级
	 * 
	 * ? 或许在设置的时候，也需要更新：不再由Flash管理
	 */

	public shapeInit(shape: IBatrShape): void {

	}

	public shapeRefresh(shape: IBatrShape): void {

	}

	public shapeDestruct(shape: IBatrShape): void {

	}

	//============Game Mechanics============//
	protected explode(): void {
		host.toolCreateExplode(this.entityX, this.entityY, this.finalExplodeRadius, this.damage, this, 0xffff00, 1);
		host.entitySystem.removeProjectile(this);
	}

	//====Graphics Functions====//
	override drawShape(): void {
		let realRadiusX: number = BulletBasic.SIZE / 2;

		let realRadiusY: number = BulletBasic.SIZE / 2;

		with (shape.graphics) {
			clear();
			lineStyle(LINE_SIZE, this.ownerLineColor);
			beginFill(this.ownerColor);
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
			moveTo(-realRadiusX, -realRadiusY);
			lineTo(realRadiusX, 0);
			lineTo(-realRadiusX, realRadiusY);
			lineTo(-realRadiusX, -realRadiusY);
			endFill();
		}
	}
}
