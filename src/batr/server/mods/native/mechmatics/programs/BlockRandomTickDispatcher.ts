import { iPoint } from "../../../../../common/geometricTools";
import Block from "../../../../api/block/Block";
import { blockTickEventF, randomTickEventF } from "../../../../api/control/BlockEventTypes";
import { MatrixProgram, MatrixProgramLabel } from "../../../../api/control/MatrixProgram";
import { IEntityActive } from "../../../../api/entity/EntityInterfaces";
import { typeID } from "../../../../api/registry/IWorldRegistry";
import IMatrix from "../../../../main/IMatrix";

/**
 * 「方块随机刻分派者」是
 * * 活跃的
 * * 定时向母体获取随机坐标，并根据自身「随机刻映射表」分派「方块随机刻」的
 * 母体程序
 */
export default class BLockRandomTickDispatcher extends MatrixProgram implements IEntityActive {

	/** 标签 */
	public static readonly LABEL: MatrixProgramLabel = 'BLockRandomTickDispatch';

	// 构造&析构 //
	public constructor(
		/** 随机刻映射表 */
		public readonly randomTickMap: Map<typeID, randomTickEventF>
	) {
		super(BLockRandomTickDispatcher.LABEL);
	}

	// 活跃实体 //
	public readonly i_active: true = true;

	// *实现：分派随机刻
	onTick(host: IMatrix): void {
		this._temp_lastRandomP = host.map.storage.randomPoint;
		let block: Block | null = host.map.storage.getBlock(this._temp_lastRandomP);
		if (block !== null)
			if (this.randomTickMap.has(block.id))
				(this.randomTickMap.get(block.id) as blockTickEventF)(
					host, block, this._temp_lastRandomP,
				);
	}
	protected _temp_lastRandomP?: iPoint

}