import { iPoint, intPoint } from "../../../../../../common/geometricTools";
import { uint, int, int$MAX_VALUE } from "../../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../../display/api/GlobalDisplayVariables";
import BlockAttributes from "../../../../../api/block/BlockAttributes";
import Projectile from "../Projectile";
import { IEntityFixedLived, IEntityInGrid } from './../../../../../api/entity/EntityInterfaces';
import { TPS } from "../../../../../main/GlobalGameVariables";
import { IBatrShape } from "../../../../../../display/api/BatrDisplayInterfaces";
import IBatrGame from './../../../../../main/IBatrGame';
import { mRot, toOpposite_M } from "../../../../../general/GlobalRot";
import { intAbs, intMin } from "../../../../../../common/exMath";
import EntityType from "../../../../../api/entity/EntityType";
import { NativeEntityTypes } from "../../../registry/EntityRegistry";
import { playerCanHurtOther } from "../../../registry/NativeGameMechanics";
import { clearArray } from "../../../../../../common/utils";
import IPlayer from "../../player/IPlayer";

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

	//============Static Variables============//

	//============Static Functions============//

	//============Instance Variables============//
	protected _position: iPoint = new iPoint();
	protected _life: uint = Lightning.LIFE;

	/** 是否已计算好路径与伤害 */
	public isCalculated: boolean = false;

	protected _energy: int;
	protected _initialEnergy: int;
	public get energyPercent(): number { return this._energy / this._initialEnergy; }

	protected _wayPoints: iPoint[] = [];
	protected _hurtPlayers: IPlayer[] = [];
	protected _hurtDefaultDamage: uint[] = [];

	//============Constructor & Destructor============//
	/**
	 * 构造函数
	 * @param position 整数位置（根部）
	 * @param direction 初始朝向
	 * @param owner 所有者
	 * @param energy 拥有的「能量」
	 */
	public constructor(
		owner: IPlayer | null,
		position: iPoint, direction: mRot,
		attackerDamage: uint,
		energy: int
	) {
		super(owner, attackerDamage, direction);
		this._position.copyFrom(position)
		this._initialEnergy = this._energy = energy;
	}

	// 固定生命周期 //
	public readonly i_fixedLive: true = true;

	get LIFE(): uint { return Lightning.LIFE }
	get life(): uint { return this._life }
	get lifePercent(): number { return this._life / this.LIFE }

	// 格点实体 //
	public readonly i_InGrid: true = true;

	/** 实现：返回自身整数位置（根节点所在方块位置） */
	get position(): intPoint { return this._position }
	set position(value: intPoint) { this._position.copyFrom(value) }

	//============Destructor Function============//
	/** 析构：所有数组清空 */
	override destructor(): void {
		clearArray(this._wayPoints);
		clearArray(this._hurtPlayers);
		clearArray(this._hurtDefaultDamage);
	}

	//============Game Mechanics============//
	/**
	 * 计算电弧路径
	 */
	protected lightningWays(host: IBatrGame): void {
		// Draw in location in this
		let head: iPoint = this._position.copy();
		let cost: int = 0;
		let player: IPlayer | null = null;
		let tRot: mRot = this.owner?.direction ?? 0;
		let nRot: mRot | -1 = -1;
		// 开始生成路径 //
		// 先把自身位置加进路径
		this.addWayPoint(this._position);
		// 不断循环添加路径
		while (true) {
			// console.log('initWay in '+head,nRot,tRot,cost);
			// Cost and hit
			cost = this.operateCost(host, head);
			// 能量耗尽⇒结束
			if ((this._energy -= cost) < 0)
				break;
			// 标记（并在后续伤害）当前位置的玩家
			player = host.getHitPlayerAt(head);
			if (player != null && (
				this.owner == null ||
				playerCanHurtOther(
					this.owner, player,
					this.canHurtEnemy,
					this.canHurtSelf,
					this.canHurtAlly,
				))
			) {
				this._hurtPlayers.push(player);
				this._hurtDefaultDamage.push(this._attackerDamage * this.energyPercent);
			}
			// Update Rot
			nRot = this.getLeastWeightRot(host, head, tRot);
			if (nRot === -1) {
				tRot = nRot;
				this.addWayPoint(head);
			}
			// Move
			host.map.towardWithRot_II(head, nRot, 1)
		}
		// 先前只是根据后节点的方向设置节点，所以最后要把头节点加上
		this.addWayPoint(head);
	}

	/**
	 * 增加路径点
	 * * 会创建新对象，复制已有点
	 * 
	 * ! 使用「绝对坐标」（地图坐标）而非「相对坐标」
	 * * 减少计算：仅在显示的时一次性换算（copyFrom+minusFrom）
	 * 
	 * @param p 要加入的坐标点（引用）
	 */
	protected addWayPoint(p: iPoint): void {
		// TODO: 高维化
		this._wayPoints.push(
			p.copy()
		);
	}

	/**
	 * 给出「能量耗损最少」的前进方向
	 * * 使用贪心算法遍历
	 * @param host 所属游戏主体
	 * @param p 当前点
	 * @param nowRot 当前朝向（默认方向）
	 * @returns 新的「目标朝向」（若已找到前进方向），或`-1`（未找到前进方向，一般不会发生）
	 */
	protected getLeastWeightRot(host: IBatrGame, p: iPoint, nowRot: mRot): mRot | -1 {
		let cost: int;
		let result: mRot | -1 = -1;
		// 默认
		// nowRot = host.map.storage.randomRotateDirectionAt(p, nowRot, 1); // ? 不知道这行「随机旋转」代码是干啥用的
		// ! 现在不再是「从当前点开始旋转遍历」了，而是「在所有可前进方向中选择除了『来时路』外的所有方向」
		let oppositeR: mRot = toOpposite_M(nowRot)
		let leastCost: int = int$MAX_VALUE; // 默认是最大值，鼓励后续贪心替代
		for (let towardR of host.map.storage.getForwardDirectionsAt(p)) {
			// 不吃回头草
			if (towardR === oppositeR) continue;
			// 步进位移，缓存位置
			host.map.towardWithRot_II(
				this._temp_getLeastWeightRot.copyFrom(p), // * 先复制自身，然后进行步进位移
				towardR, 1
			);
			// 计算损耗
			cost = this.operateCost(host, this._temp_getLeastWeightRot);
			// 贪心比对损耗：第一印象式
			if (cost < leastCost) {
				leastCost = cost;
				result = towardR;
			}
		}
		// 返回
		return result;
	}
	/** 临时缓存 */
	protected _temp_getLeastWeightRot: iPoint = new iPoint();

	protected operateCost(host: IBatrGame, p: iPoint): int {
		if (host.isHitAnyPlayer_I(p))
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
		// 处理生命周期
		if (this._life > 0)
			this._life--;
		else
			// 大限若至，移除自身
			host.entitySystem.remove(this);
	}

	/** 实现：不响应「所处方块更新」事件 */
	public onPositedBlockUpdate(host: IBatrGame): void { }

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
		// These points uses local grid,for example the initial point instanceof (0,0)
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
