import { iPoint } from 'matriangle-common/geometricTools'
import { uint } from 'matriangle-legacy/AS3Legacy'
import Block from 'matriangle-api/server/block/Block'
import {
	MatrixProgram,
	MatrixProgramLabel,
} from 'matriangle-api/server/control/MatrixProgram'
import { IEntityActive } from 'matriangle-api/server/entity/EntityInterfaces'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import { BlockEventType_Batr } from '../../registry/BlockEventRegistry_Batr'

/**
 * 「方块随机刻分派者」是
 * * 活跃的
 * * 定时向母体获取随机坐标，并根据自身「随机刻映射表」分派「方块随机刻」的
 * * 作为AS3版本「随机刻机制」继任者的
 * 母体程序
 *
 * !【2023-10-08 18:07:37】现在不再在其内部存储「随机刻分派映射表」，而利用所在母体的映射表
 * * 「方块随机刻」就是「方块随机刻」，不要干别的事情
 */
export default class BlockRandomTickDispatcher
	extends MatrixProgram
	implements IEntityActive
{
	/** 标签 */
	public static readonly LABEL: MatrixProgramLabel = 'BlockRandomTickDispatch'

	// 构造&析构 //
	public constructor(
		label: MatrixProgramLabel = BlockRandomTickDispatcher.LABEL
	) {
		super(label)
	}

	/**
	 * 与「母体」同步
	 * * 主要同步其地图的大小，以及根据随机刻计算几率
	 * * 核心需求：保证「不管母体地图多大，随机刻在每个方块上的密度总是一样」
	 * * 实现逻辑：每个游戏刻都进行「随机增量」，若大于576则开始一个随机刻
	 *   * 能保证「不会太依赖概率，又能保证性能」
	 *
	 * @param density 以「n/576」为单位的「方块随机刻密度」
	 */
	public syncRandomDensity(density: uint): this {
		this.randomDelta = density
		return this
	}
	/**
	 * 每个世界刻的随机增量
	 */
	public randomDelta: uint = 576

	// 活跃实体 //
	public readonly i_active = true as const

	/**
	 * @implements
	 * 实现：分派随机刻
	 * * 基本逻辑：「增量同余」方法
	 */
	onTick(host: IMatrix): void {
		// 增量
		this._temp_randomDelta += this.randomDelta
		// 同余
		while (this._temp_randomDelta > 576) {
			// 分派
			this.dispatch(host, host.map.storage.randomPoint)
			// 递减
			this._temp_randomDelta -= 576
		}
	}
	protected _temp_randomDelta: uint = 0

	/**
	 * 可被继承&重载的「分派函数」
	 */
	protected dispatch(host: IMatrix, position: iPoint): void {
		const block: Block | null = host.map.storage.getBlock(position)
		if (block !== null)
			host.registry.blockEventRegistry
				.getEventMapAt(block.id)
				?.[BlockEventType_Batr.RANDOM_TICK]?.(
					// 取其中「随机刻事件」的处理函数
					host,
					position,
					block
				)
	}
}

// !【2023-10-08 18:18:09】「世界随机刻」的「事件处理函数」类型 已并入 统一的「方块事件机制」
