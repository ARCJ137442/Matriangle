import { fPoint } from "../../../../../../common/geometricTools";
import { IBatrGraphicContext, IBatrShape } from "../../../../../../display/api/BatrDisplayInterfaces";
import { logical2Real } from "../../../../../../display/api/PosTransform";
import { uint, int } from "../../../../../../legacy/AS3Legacy";
import { mRot } from "../../../../../general/GlobalRot";
import { FIXED_TPS } from "../../../../../main/GlobalGameVariables";
import IBatrGame from "../../../../../main/IBatrGame";
import EntityType from "../../../../../api/entity/EntityType";
import Player from "../../player/Player";
import BulletBasic from "./BulletBasic";
import { NativeTools } from "../../../registry/ToolRegistry";
import Weapon from "../../../tool/Weapon";
import Bullet from "./Bullet";
import { NativeEntityTypes } from "../../../registry/EntityRegistry";

/**
 * 跟踪子弹
 * * - 爆炸半径
 * * + 智能追踪
 * * ± 可变速度
 */
export default class BulletTracking extends Bullet {

	//============Static Variables============//
	public static readonly SIZE: number = logical2Real(3 / 8);
	public static readonly DEFAULT_SPEED: number = 12 / FIXED_TPS;
	public static readonly DEFAULT_EXPLODE_COLOR: uint = 0xffff00;
	public static readonly DEFAULT_EXPLODE_RADIUS: number = 0.625;

	//============Instance Variables============//
	protected _target: Player | null = null;
	protected _trackingFunction: Function = this.canBeTarget; // not the criterion
	protected _scalePercent: number = 1;
	protected _cachedTargets: Player[] = new Array<Player>();

	/** 类型注册（TS中实现抽象属性，可以把类型限定为其子类） */
	override get type(): EntityType { return NativeEntityTypes.BULLET_TRACKING; }
	override readonly ownerTool: Weapon = NativeTools.WEAPON_BULLET_NUKE;

	//============Constructor & Destructor============//
	public constructor(
		position: fPoint,
		owner: Player | null, attackerDamage: uint,
		playersInGame: Player[], chargePercent: number
	) {
		super(
			position,
			owner, attackerDamage,
			BulletTracking.DEFAULT_SPEED,
			BulletTracking.DEFAULT_EXPLODE_RADIUS
		);
		// 尺寸规模（需要多次切换，因此缓存为实例变量）
		this._scalePercent = (1 + chargePercent * 0.5);
		// 目标追踪函数
		if (chargePercent >= 1)
			this._trackingFunction = this.getTargetRot;
		// 缓存「潜在目标」
		this.cacheTargetsIn(playersInGame);
	}

	//============Instance Functions============//

	/**
	 * Cached some static properties, during the short lifespan of the bullet
	 * * 因其短周期性&访问高频性，直接缓存一个数组，以缩小搜索范围
	 */
	protected cacheTargetsIn(players: Player[]): void {
		for (let player of players) {
			if (player != null && // not null
				(
					this._owner == null ||
					this._owner.canUseToolHurtPlayer(player, this.ownerTool) // TODO: 以后需要改成「实例无关」方法
				) // 需可使用工具伤害
			)
				this._cachedTargets.push(player);
		}
	}

	/**
	 * ! 【20230915 20:12:19】重要的是：使用存取器设置属性，而非直接设定值
	 * @param host 游戏主体
	 */
	override onTick(host: IBatrGame): void {
		let tempRot: mRot;
		// 没目标⇒找目标
		if (this._target == null) {
			let player: Player;
			// 根据缓存的目标开始检查，并择机开始跟踪
			for (let i: int = this._cachedTargets.length - 1; i >= 0; i--) {
				player = this._cachedTargets[i];
				// 检查目标合法性，并直接在「缓存的目标」列表中筛除（避免重复遍历）
				if (this.checkTargetInvalid(player)) {
					this._cachedTargets.splice(i, 1);
					continue;
				};
				// 若「值得追踪」，则开始追踪
				if (this.canBeTarget(player)) {
					this._target = player;
					this.direction = this.getTargetRot(player);
					this.speed = BulletTracking.DEFAULT_SPEED * this._scalePercent;
					break;
				}
			}
		}
		// 如果失去了目标（玩家等待重生、不再能被工具伤害、目标「跟丢了」），重置
		else if (
			this.checkTargetInvalid(this._target) || // 先检查「玩家是否合法」
			(tempRot = this._trackingFunction(this._target)) < 0 // 再检查「是否跟丢了」
		) {
			this._target = null;
		}
		// 如果目标还在，那就继续追踪目标
		else {
			this.direction = tempRot;
		}
		// * 之后才开始父类逻辑（移动）
		super.onTick(host);
	}

	protected checkTargetInvalid(player: Player): boolean {
		return (
			// player == null || // ! 非空，但在上下文中不会发生（减少重复判断）
			player.isRespawning || // not respawning
			(this._owner != null && !this._owner.canUseToolHurtPlayer(player, this.ownerTool)) // should can use it to hurt
		);
	}

	/**
	 * 决定是否要触发「玩家追踪」
	 * 
	 * ! 【20230915 20:53:40】现在由于适配任意维空间的需要，此函数被确定为「开启跟踪的条件」
	 * @param player 所追踪的玩家
	 * @returns 该玩家是否值得开启追踪
	 */
	protected canBeTarget(player: Player): boolean {
		// * 遍历得到第一个坐标值相等的轴向（例：三维中x轴坐标相同，于是在yOz平面开始跟踪）
		for (let i: uint = 0; i < player.position.nDim; i++) {
			if (this._position_I[i] == player.position[i]) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 在追踪过程中，获取「追踪到玩家需要采取的朝向」
	 * @param player 被追踪的玩家
	 * @returns 「绝对距离最小」维度的索引
	 */
	protected getTargetRot(player: Player): int {
		// 先获取一个最小索引，代表「绝对距离最小」的轴向
		let iMinAbsDistance: uint = this._position_I.indexOfAbsMinDistance(player.position)
		// 然后根据轴向生成「任意维整数角」
		return (iMinAbsDistance << 1) + (
			this.position[iMinAbsDistance] > player.position[iMinAbsDistance] ?
				1 : // 自己在更正方向，就往负方向走
				0 // 自己在更负方向，就往正方向走
		);
	}

	/** 覆盖：通知「游戏主体」创建爆炸 */
	override explode(host: IBatrGame): void {
		// TODO: 等待「游戏逻辑」完善
		// host.toolCreateExplode(this.position, this.finalExplodeRadius, this.damage, this, BulletNuke.DEFAULT_EXPLODE_COLOR, 0.5);
		// 超类逻辑：移除自身
		super.explode(host);
	}

	//====Graphics Functions====//
	override shapeInit(shape: IBatrShape): void {
		super.shapeInit(shape);
		this.drawTrackingSign(shape.graphics);
		shape.scaleX = shape.scaleY = BulletTracking.SIZE / BulletBasic.SIZE;
	}

	protected drawTrackingSign(graphics: IBatrGraphicContext): void {
		graphics.beginFill(this.ownerLineColor);
		let radius: number = BulletTracking.SIZE * 0.125;
		graphics.moveTo(-radius, -radius);
		graphics.lineTo(radius, 0);
		graphics.lineTo(-radius, radius);
		graphics.lineTo(-radius, -radius);
		graphics.endFill();
	}
}