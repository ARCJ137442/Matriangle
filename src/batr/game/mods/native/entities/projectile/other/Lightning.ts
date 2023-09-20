

import { iPoint, intPoint } from "../../../../../../common/geometricTools";
import { uint, int, int$MAX_VALUE } from "../../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../../display/api/GlobalDisplayVariables";
import BlockAttributes from "../../../../../api/block/BlockAttributes";
import Game from "../../../../../main/Game";
import Player from "../../player/Player";
import Projectile from "../Projectile";
import { IEntityFixedLived, IEntityInGrid } from './../../../../../api/entity/EntityInterfaces';
import { TPS } from "../../../../../main/GlobalGameVariables";
import { IBatrGraphicContext, IBatrShape } from "../../../../../../display/api/BatrDisplayInterfaces";
import IBatrGame from './../../../../../main/IBatrGame';
import { mRot } from "../../../../../general/GlobalRot";
import { intAbs, intMin, random1 } from "../../../../../../common/exMath";
import EntityType from "../../../../../api/entity/EntityType";
import Tool from "../../../tool/Tool";
import { NativeTools } from "../../../registry/ToolRegistry";
import Weapon from "../../../tool/Weapon";
import { NativeEntityTypes } from "../../../registry/EntityRegistry";
import { playerCanUseProjectileHurtOther } from "../../../registry/NativeGameMechanics";

/**
 * 「闪电」
 * * 拥有用于「造成伤害」与「穿透方块」的「能量值」，会在穿透时衰减
 * * 可以穿透多个实体，同时对其造成伤害
 * * 可能会伤害到所有者自己
 * * 在生成的瞬间（生成后第一个游戏刻）计算路径并造成伤害
 *   * 后续的淡出效果只在显示端起作用
 * 
 * ? 是否要为了「等待消失」而「延长生命周期」？
 * 
 * @author ARCJ137442
 */
export default class Lightning extends Projectile implements IEntityFixedLived, IEntityInGrid {
	public get type(): EntityType { return NativeEntityTypes.LIGHTNING; }

	// ? 对这里的「武器」仍然存疑：这样是否限制了「玩家自定义武器」的机制？
	// TODO: 解决冲突
	public readonly ownerTool: Weapon = NativeTools.WEAPON_LIGHTNING;
	//============Static Variables============//

	//============Static Functions============//

	//============Instance Variables============//
	protected _position: iPoint = new iPoint();
	protected _life: uint = Lightning.LIFE;

	/** 是否已计算好路径与伤害 */
	public isCalculated: boolean = false;

	protected _energy: int;
	protected _initialEnergy: int;

	protected _wayPoints: iPoint[] = [];
	protected _hurtPlayers: Player[] = [];
	protected _hurtDefaultDamage: uint[] = [];

	//============Constructor & Destructor============//
	/**
	 * 构造函数
	 * @param position 整数位置（根部）
	 * @param rot 初始朝向
	 * @param owner 所有者
	 * @param energy 拥有的「能量」
	 */
	public constructor(
		position: iPoint, rot: mRot,
		owner: Player | null, attackerDamage: uint,
		energy: int
	) {
		super(owner, attackerDamage);
		this._position.copyFrom(position)
		this._direction = rot;
		this._initialEnergy = this._energy = energy;
	}

	// 固定生命周期 //
	public readonly i_fixedLive: true = true;

	get LIFE(): uint { return Lightning.LIFE }
	get life(): uint { return this._life }
	get lifePercent(): number { return this.life / this.LIFE }

	// 格点实体 //
	public readonly i_InGrid: true = true;

	/** 实现：返回自身整数位置（根节点所在方块位置） */
	get position(): intPoint { return this._position }
	set position(value: intPoint) { this._position.copyFrom(value) }

	//============Destructor Function============//
	override destructor(): void {
	}

	//============Instance Getter And Setter============//
	public get energyPercent(): number {
		return this._energy / this._initialEnergy;
	}

	//============Game Mechanics============//
	/**
	 * 计算电弧路径
	 */
	protected lightningWays(host: IBatrGame): void {
		// Draw in location in this
		let head: iPoint = this._position.copy();
		let ownerTool: Tool = this.ownerTool;
		let vx: int, vy: int;
		let cost: int = 0;
		let player: Player | null = null;
		let tRot: mRot = this.owner?.direction ?? 0;
		let nRot: mRot = 0;
		// Loop to run
		this._wayPoints.push(new iPoint(0, 0));
		while (true) {
			// trace('initWay in '+head,nRot,tRot,cost);
			// Cost and hit
			cost = this.operateCost(host, head);
			if ((this._energy -= cost) < 0)
				break;
			player = host.getHitPlayerAt(head);
			if (player != null && (
				this.owner == null ||
				playerCanUseProjectileHurtOther(
					this.owner, player,
					this.canHurtEnemy,
					this.canHurtSelf,
					this.canHurtAlly,
				)) // TODO: 后续更新【2023-09-20 21:49:31】断点
			) {
				this._hurtPlayers.push(player);
				this._hurtDefaultDamage.push(this._attackerDamage * this.energyPercent);
			}
			// Update Rot
			nRot = this.getLeastWeightRot(head.x, head.y, tRot);
			if (GlobalRot.isValidRot(nRot)) {
				tRot = nRot;
				this.addWayPoint(head.x, head.y);
			}
			vx = GlobalRot.towardXInt(tRot);
			vy = GlobalRot.towardYInt(tRot);
			// Move
			head.x += vx;
			head.y += vy;
		}
		// 先前只是根据后节点的方向设置节点，所以最后要把头节点加上
		this.addWayPoint(head.x, head.y);
	}

	/** 增加路径点 */
	protected addWayPoint(hostX: int, hostY: int): void {
		// TODO: 高维化
		this._wayPoints.push(new iPoint(hostX - this._position, hostY - this.gridY));
	}

	protected getLeastWeightRot(x: int, y: int, nowRot: mRot): uint {
		let cx: int, cy: int;
		let leastCost: int = this.operateCost(x + GlobalRot.towardXInt(nowRot), y + GlobalRot.towardYInt(nowRot));
		let cost: int;
		let result: mRot = 0;
		nowRot = lockIntToStandard(nowRot + random1());
		for (let r: int = nowRot; r < nowRot + 4; r += 2) {
			cx = x + GlobalRot.towardXInt(r);
			cy = y + GlobalRot.towardYInt(r);
			cost = this.operateCost(cx, cy);
			if (cost < leastCost) {
				leastCost = cost;
				result = GlobalRot.lockIntToStandard(r);
			}
		}
		return result;
	}

	protected operateCost(host: IBatrGame, p: iPoint): int {
		if (host.isHitAnyPlayer(p))
			return 5; // The electricResistance of player
		if (host.map.storage.isInMap(p))
			return int$MAX_VALUE; // The electricResistance out of world
		let attributes: BlockAttributes = host.getBlockAttributes(p);
		if (attributes != null)
			return attributes.electricResistance;
		return 0;
	}

	override onTick(host: IBatrGame): void {
		super.onTick(host);
		if (!this.isCalculated) {
			this.isCalculated = true;
			this.lightningWays(host);
			host.lightningHurtPlayers(this, this._hurtPlayers, this._hurtDefaultDamage);
		}
		if (this._life > 0)
			this._life--;
		else
			this._host.entitySystem.removeProjectile(this);
	}


	//============Display Implements============//
	public static readonly LIGHT_ALPHA: number = 0.5;
	public static readonly LIGHT_BLOCK_WIDTH: number = 0.2;
	public static readonly LIFE: uint = TPS / 2;

	/** 临时变量：用于「只绘制一次」 */
	protected _isDrawComplete: boolean = false;
	/**
	 * 每次都更新图形的不透明度，但只绘制一次闪电
	 * 
	 * ? 第一次更新，第一个游戏刻……联动耦合地太紧了
	 * * 第一次计算完成之后就应该绘制（且只绘制一次图）
	 */
	public shapeRefresh(shape: IBatrShape): void {
		// 更新不透明度
		shape.alpha = this._life / Lightning.LIFE;
		// 尝试绘制闪电
		if (this._isDrawComplete) return;
		this.drawLightning(shape);
		this._isDrawComplete = this.isCalculated;
	}

	override shapeInit(shape: IBatrShape): void {
		// ! 这时候可能路径还没计算好，所以不能绘制……
	}

	public shapeDestruct(shape: IBatrShape): void {
		shape.graphics.clear();
	}

	protected drawLightning(shape: IBatrShape): void {
		if (this._wayPoints.length < 1) return;
		// These points uses local grid,for example the initial point is (0,0)
		let point: iPoint = this._wayPoints[0], pointH: iPoint = this._wayPoints[0];
		// drawLines
		for (let i: uint = 1; i < this._wayPoints.length; i++) {
			point = pointH;
			pointH = this._wayPoints[i];
			// Head
			shape.graphics.beginFill(this.ownerColor, Lightning.LIGHT_ALPHA);
			shape.graphics.drawRect(
				DEFAULT_SIZE * (intMin(point.x, pointH.x) - Lightning.LIGHT_BLOCK_WIDTH),
				DEFAULT_SIZE * (intMin(point.y, pointH.y) - Lightning.LIGHT_BLOCK_WIDTH),
				DEFAULT_SIZE * (intAbs(point.x - pointH.x) + Lightning.LIGHT_BLOCK_WIDTH * 2),
				DEFAULT_SIZE * (intAbs(point.y - pointH.y) + Lightning.LIGHT_BLOCK_WIDTH * 2)
			);
			shape.graphics.endFill();
			// console.log('drawPoint at ',point,pointH);
		}
	}

}
