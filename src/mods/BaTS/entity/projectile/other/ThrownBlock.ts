import { uint } from 'matriangle-legacy/AS3Legacy'
import Block from 'matriangle-api/server/block/Block'
import Projectile from '../Projectile'
import { fPoint, iPoint } from 'matriangle-common/geometricTools'
import { FIXED_TPS } from 'matriangle-api/server/main/GlobalWorldVariables'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import { IEntityOutGrid } from 'matriangle-api/server/entity/EntityInterfaces'
import { mRot } from 'matriangle-api/server/general/GlobalRot'
import {
	alignToGridCenter_P,
	alignToGrid_P,
} from 'matriangle-api/server/general/PosTransform'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import EffectBlockLight from '../../effect/EffectBlockLight'
import { computeFinalDamage } from '../../../mechanics/BatrMatrixMechanics'
import {
	getHitEntity_I_Grid,
	isHitAnyEntity_F_Grid,
} from 'matriangle-mod-native/mechanics/NativeMatrixMechanics'
import { getPlayers } from 'matriangle-mod-native/mechanics/NativeMatrixMechanics'
import IPlayerHasAttributes from '../../player/IPlayerHasAttributes'
import { BlockAttributes_Native } from 'matriangle-mod-native/registry/BlockRegistry_Native'
import { typeID } from 'matriangle-api/server/registry/IWorldRegistry'
import {
	IDisplayDataBlock,
	IDisplayDataEntityState,
} from 'matriangle-api/display/RemoteDisplayAPI'

export interface IDisplayDataEntityStateThrownBlock
	extends IDisplayDataEntityState {
	/** 内含的方块 */
	block: IDisplayDataBlock
}

/**
 * 「掷出的方块」是
 * * 基于世界方块机制的
 * * 承载一种「移动的方块」以便「把方块作为可移动对象/武器」的
 * 抛射体
 */
export default class ThrownBlock
	extends Projectile<IDisplayDataEntityStateThrownBlock>
	implements IEntityOutGrid
{
	//============Static Variables============//
	/** ID */
	public static readonly ID: typeID = 'ThrownBlock'

	public static readonly MAX_SPEED: number = 15 / FIXED_TPS
	public static readonly MIN_SPEED: number = (1 / 3) * ThrownBlock.MAX_SPEED

	//============Instance Variables============//

	public readonly i_outGrid = true as const

	/**
	 * 存储浮点位置（在方块之间移动）
	 * ! 注意：这里的「浮点位置」是与「方块坐标系」对齐的——统一以左上角为坐标
	 * * 纯逻辑的一致性追求：原先AS3版本更多是在显示上「要在中心方便旋转」的妥协
	 */
	protected _position: fPoint = new fPoint()
	public get position(): fPoint {
		return this._position
	}
	public set position(value: fPoint) {
		this._position.copyFrom(value)
	}

	/** 这个「掷出的方块」所包含的方块 */
	protected _block: Block // ! 【2023-09-22 22:28:28】你必需有一个方块，哪怕是「空」也好，都不要引入null，谢谢
	public get carriedBlock(): Block {
		return this._block
	}

	/**
	 * 这个「掷出的方块」飞行的速度
	 *
	 * ! 【2023-09-22 20:41:07】原先是矢量，现在只表示大小
	 */
	// protected _speed: fPoint;
	protected _speed: number

	/**
	 * 这个「掷出的方块」有无「击中过方块/玩家」
	 * * 避免多次「击中」
	 */
	protected _isHitAnything: boolean = false

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
		position: fPoint,
		direction: mRot,
		speed: number,
		block: Block,
		attackerDamage: uint,
		toolExtraDamageCoefficient: uint
	) {
		super(
			ThrownBlock.ID,
			owner,
			attackerDamage,
			toolExtraDamageCoefficient,
			direction
		)
		// * 复制方块实例 //
		this._block = block.copy() // ! 会复制出一个新实例，而非沿用原先的实例
		// * 位置、速度等物理变量 //
		this._position.copyFrom(position)
		// this.speed.copyFrom(speed); // ! 【2023-09-22 20:23:52】现在不再存储「速度」这个变量，而是在世界刻中直接使用方向进行即时计算
		this._speed = speed
		this._direction = direction
		// ? ↑这里的设置仍然有「通用性」的牺牲：这使得「抛出的方块」无法沿任意方向移动
		// this.shapeInit(shape: IBatrShape);
		this.syncDisplayProxy()
	}

	/** @implements 实现：同步方块数据 */
	syncDisplayProxy(): void {
		// super.syncDisplayProxy() // ! 抽象方法
		this._proxy.position = this._position
		// ! direction已经在超类更新过了
		this._proxy.storeState('block', this._block.getDisplayData())
	}

	//============Destructor Function============//
	/* override destructor(): void {
		// this._carriedBlock = null; // ! 【2023-09-22 20:29:31】因为这里的方块是新建的，只有自身持有引用，故无需释放引用以便GC

		super.destructor();
	} */

	//============World Mechanics============//
	override onTick(host: IMatrix): void {
		super.onTick(host)
		// 在地图内&可通过&没碰到玩家：继续飞行
		if (
			// 在地图内
			host.map.isInMap_F(this._position) &&
			// 可通过
			host.map.testCanPass_F(
				this.position, // ! 【2023-09-22 20:34:44】现在直接使用
				false,
				true,
				false,
				false
			) && // TODO: 这实际上会有「边缘点碰撞不准确」的问题……需要修复
			// 没碰到玩家
			!isHitAnyEntity_F_Grid(this._position, getPlayers(host))
		) {
			host.map.towardWithRot_FF(
				this._position,
				this._direction,
				this._speed
			)
			// * 显示更新
			this._proxy.position = this._position
		}
		// ! 只有「从未击中过」的方块才能进入「击中」流程
		else if (!this._isHitAnything) {
			this._isHitAnything = true // 锁定状态
			this.onBlockHit(host)
		}
	}

	protected onBlockHit(host: IMatrix): void {
		// 尝试伤害玩家
		// console.warn('WIP thrownBlockHurtPlayer!', this)// host.thrownBlockHurtPlayer(this);
		const hitPlayer: IPlayer | null = getHitEntity_I_Grid(
			// ! 因为这只用执行一次，所以创建一个新数组也无可厚非
			alignToGrid_P(this._position, new iPoint()),
			getPlayers(host)
		)
		if (hitPlayer !== null)
			hitPlayer.removeHP(
				host,
				computeFinalDamage(
					this._attackerDamage,
					(hitPlayer as IPlayerHasAttributes)?.attributes
						.buffResistance ?? 0,
					this._extraResistanceCoefficient
				),
				this.owner
			)
		// 后退，准备放置方块 // * 【2023-10-08 00:57:36】目前改动的机制：不会替换掉玩家的位置
		host.map.towardWithRot_FF(this._position, this._direction, -this._speed)
		// 将坐标位置对齐到网格 // ! 必须在「后退」之后
		const _temp_iPoint: iPoint = new iPoint()
		alignToGrid_P(this._position, _temp_iPoint)
		// 放置判断
		if (
			host.map.isBlockBreakable(_temp_iPoint, BlockAttributes_Native.VOID)
		) {
			// 放置
			host.setBlock(_temp_iPoint, this._block)
		}
		// 特效
		// ! 会更改自身坐标：复用自身坐标，更改为「将要生成的特效坐标」
		host.addEntity(
			EffectBlockLight.fromBlock(
				alignToGridCenter_P(this._position, this._position),
				this._block,
				false
			)
		)
		// 移除自身
		host.removeEntity(this)
	}
}
