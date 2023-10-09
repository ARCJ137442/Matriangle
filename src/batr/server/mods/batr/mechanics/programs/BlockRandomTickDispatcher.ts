import { iPoint } from "../../../../../common/geometricTools";
import Block from "../../../../api/block/Block";
import { MatrixProgram, MatrixProgramLabel } from "../../../../api/control/MatrixProgram";
import { IEntityActive } from "../../../../api/entity/EntityInterfaces";
import IMatrix from "../../../../main/IMatrix";
import { NativeBlockEventType, NativeBlockTypeEventMap } from "../../registry/BlockEventRegistry";

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
export default class BlockRandomTickDispatcher extends MatrixProgram implements IEntityActive {

	/** 标签 */
	public static readonly LABEL: MatrixProgramLabel = 'BlockRandomTickDispatch';

	// 构造&析构 //
	public constructor() {
		super(BlockRandomTickDispatcher.LABEL);
	}

	// 活跃实体 //
	public readonly i_active: true = true;

	// *实现：分派随机刻
	onTick(host: IMatrix): void {
		this._temp_lastRandomP = host.map.storage.randomPoint;
		let block: Block | null = host.map.storage.getBlock(this._temp_lastRandomP);
		if (block !== null)
			(host.registry.blockEventRegistry.getEventMapAt(block.id) as NativeBlockTypeEventMap
			)?.[NativeBlockEventType.RANDOM_TICK]?.(
				host, this._temp_lastRandomP, block,
			);
	}
	protected _temp_lastRandomP?: iPoint

}

// !【2023-10-08 18:18:09】「世界随机刻」的「事件处理函数」类型 已并入 统一的「方块事件机制」