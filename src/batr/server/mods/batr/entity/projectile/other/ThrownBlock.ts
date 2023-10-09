import { uint } from "../../../../../../legacy/AS3Legacy";
import Block from "../../../../../api/block/Block";
import Projectile from "../Projectile";
import { fPoint, iPoint, iPointRef } from "../../../../../../common/geometricTools";
import { IBatrShape } from "../../../../../../display/api/DisplayInterfaces";
import { FIXED_TPS } from "../../../../../main/GlobalWorldVariables";
import IMatrix from "../../../../../main/IMatrix";
import { IEntityOutGrid } from "../../../../../api/entity/EntityInterfaces";
import { mRot } from "../../../../../general/GlobalRot";
import { alignToGridCenter_P, alignToGrid_P } from "../../../../../general/PosTransform";
import { NativeBlockAttributes } from "../../../registry/BlockAttributesRegistry";
import IPlayer from "../../../../native/entities/player/IPlayer";
import EffectBlockLight from "../../effect/EffectBlockLight";
import { computeFinalDamage, getHitEntity_I_Grid, getPlayers, isHitAnyEntity_F_Grid } from "../../../mechanics/NativeMatrixMechanics";
import IPlayerHasAttributes from "../../player/IPlayerHasAttributes";

/**
 * 「掷出的方块」是
 * * 基于世界方块机制的
 * * 承载一种「移动的方块」以便「把方块作为可移动对象/武器」的
 * 抛射体
 */
export default class ThrownBlock extends Projectile implements IEntityOutGrid {	//============Static Variables============//
	public static readonly MAX_SPEED: number = 15 / FIXED_TPS;
	public static readonly MIN_SPEED: number = 1 / 3 * ThrownBlock.MAX_SPEED;

	//============Instance Variables============//

	public readonly i_outGrid: true = true;

	/**
	 * 存储浮点位置（在方块之间移动）
	 * ! 注意：这里的「浮点位置」是与「方块坐标系」对齐的——统一以左上角为坐标
	 * * 纯逻辑的一致性追求：原先AS3版本更多是在显示上「要在中心方便旋转」的妥协
	 */
	protected _position: fPoint = new fPoint();
	public get position(): fPoint { return this._position; }
	public set position(value: fPoint) { this._position.copyFrom(value); }

	/** 这个「掷出的方块」所包含的方块 */
	protected _carriedBlock: Block; // ! 【2023-09-22 22:28:28】你必需有一个方块，哪怕是「空」也好，都不要引入null，谢谢
	public get carriedBlock(): Block { return this._carriedBlock; }

	/**
	 * 这个「掷出的方块」飞行的速度
	 * 
	 * ! 【2023-09-22 20:41:07】原先是矢量，现在只表示大小
	 */
	// protected _speed: fPoint;
	protected _speed: number;

	/**
	 * 这个「掷出的方块」有无「击中过方块/玩家」
	 * * 避免多次「击中」
	 */
	protected _isHitAnything: boolean = false;

	//============Constructor & Destructor============//
	/**
	 * 构造函数
	 * 
	 * ! 其坐标位置有其特殊性：与方块的坐标计算方法一致——均处于「网格交点」而非「网格中心」
	 * * 例：在生成时，坐标在玩家前方一格处，与「方块坐标」相同（但是浮点数）
	 * 
	 * 📌图例：
	 * ```
	 * + - # - % → x+
	 * | > | $ |
	 * % - % - %
	 * ↓
	 * y+
	 * ```
	 * 其中：
	 * * `>`: 玩家在显示上的「位置」（看起来像在「网格中心」）
	 * * `+`: 玩家在逻辑上的位置（相对「浮点坐标」而言，属于「左上角」）
	 * * `#`: 将以「浮点坐标」生成的「掷出的方块」位置
	 * * `$`: 实体「掷出的方块」在显示上的位置（看起来像在「网格中心」）
	 * 
	 * @param owner 所有者
	 * @param position 初始位置（中心同其它抛射体一样，是在「网格中心」）
	 * @param speed 飞行速率
	 * @param attackerDamage 攻击者伤害
	 * @param block 所包含的方块
	 * @param direction 飞行方向
	 * @param chargePercent 充能大小（用于修订伤害）
	 */
	public constructor(
		owner: IPlayer | null,
		position: fPoint, direction: mRot, speed: number,
		block: Block,
		attackerDamage: uint, toolExtraDamageCoefficient: uint
	) {
		super(
			owner,
			attackerDamage, // ? ↑不知道上面那个在做什么😂
			toolExtraDamageCoefficient,
			direction
		);
		// * 复制方块实例 //
		this._carriedBlock = block.copy(); // ! 会复制出一个新实例，而非沿用原先的实例
		// * 位置、速度等物理变量 //
		this._position.copyFrom(position);
		// this.speed.copyFrom(speed); // ! 【2023-09-22 20:23:52】现在不再存储「速度」这个变量，而是在世界刻中直接使用方向进行即时计算
		this._speed = speed;
		this._direction = direction
		// ? ↑这里的设置仍然有「通用性」的牺牲：这使得「抛出的方块」无法沿任意方向移动
		// this.shapeInit(shape: IBatrShape);
	}

	//============Destructor Function============//
	/* override destructor(): void {
		// this._carriedBlock = null; // ! 【2023-09-22 20:29:31】因为这里的方块是新建的，只有自身持有引用，故无需释放引用以便GC

		super.destructor();
	} */

	//============World Mechanics============//
	override onTick(host: IMatrix): void {
		super.onTick(host);
		let hitPlayer: IPlayer | null;
		// 在地图内&可通过&没碰到玩家：继续飞行
		if (
			// 在地图内
			host.map.isInMap_F(this._position) &&
			// 可通过
			host.map.testCanPass_F(
				this.position, // ! 【2023-09-22 20:34:44】现在直接使用
				false, true, false, false
			) && // TODO: 这实际上会有「边缘点碰撞不准确」的问题……需要修复	
			// 没碰到玩家
			!isHitAnyEntity_F_Grid(this._position, getPlayers(host))
		) {
			host.map.towardWithRot_FF(this._position, this._direction, this._speed);
		}
		// ! 只有「从未击中过」的方块才能进入「击中」流程
		else if (!this._isHitAnything) {
			this._isHitAnything = true; // 锁定状态
			this.onBlockHit(host);
		}
	}

	protected onBlockHit(host: IMatrix): void {
		// 尝试伤害玩家
		// console.warn('WIP thrownBlockHurtPlayer!', this)// host.thrownBlockHurtPlayer(this);
		let hitPlayer: IPlayer | null = getHitEntity_I_Grid(
			// ! 因为这只用执行一次，所以创建一个新数组也无可厚非
			alignToGrid_P(this._position, new iPoint()),
			getPlayers(host)
		)
		if (hitPlayer !== null)
			hitPlayer.removeHP(
				host,
				computeFinalDamage(
					this._attackerDamage,
					(hitPlayer as IPlayerHasAttributes)?.attributes.buffResistance ?? 0,
					this._extraDamageCoefficient
				),
				this.owner
			);
		// 后退，准备放置方块 // * 【2023-10-08 00:57:36】目前改动的机制：不会替换掉玩家的位置
		host.map.towardWithRot_FF(this._position, this._direction, -this._speed);
		// 将坐标位置对齐到网格 // ! 必须在「后退」之后
		let _temp_iPoint: iPoint = new iPoint();
		alignToGrid_P(this._position, _temp_iPoint);
		// 放置判断
		if (host.map.isBlockBreakable(_temp_iPoint, NativeBlockAttributes.VOID)) {
			// 放置
			host.map.storage.setBlock(_temp_iPoint, this._carriedBlock);
		}
		// 特效
		// ! 会更改自身坐标：复用自身坐标，更改为「将要生成的特效坐标」
		host.addEntity(
			EffectBlockLight.fromBlock(
				alignToGridCenter_P(this._position, this._position),
				this._carriedBlock,
				false
			),
		)
		// 移除自身
		host.removeEntity(this);
	}

	//============Display Implements============//
	/**
	 * 实现：初始化方块的位置
	 * 
	 * ! 【2023-09-22 22:27:00】现在其显示直接复用相应方块的显示
	 * * 坐标系统也一并对齐（采用「左上角布局」）
	 */
	public shapeInit(blockShape: IBatrShape): void {
		// 内部方块的显示
		return this._carriedBlock?.shapeInit(blockShape)
		/* if (this._carriedBlock !== null) {
			// ↓ 现在采用了新坐标系统
			// this._carriedBlock.x = -this._carriedBlock.width / 2;
			// this._carriedBlock.y = -this._carriedBlock.height / 2;
			// shape.addChild(blockShape);
		} */
	}

	/**
	 * 💭一般情况下不会再更新了
	 * * 除非「位置」
	 */
	public shapeRefresh(shape: IBatrShape): void { }

	/** 实现：清除图形 */
	public shapeDestruct(shape: IBatrShape): void {
		shape.graphics.clear()
	}
}