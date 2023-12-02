import { fPoint } from 'matriangle-common/geometricTools'
import { uint } from 'matriangle-legacy/AS3Legacy'
import Entity from 'matriangle-api/server/entity/Entity'
import { FIXED_TPS } from 'matriangle-api/server/main/GlobalWorldVariables'
import Effect2Blocks from './Effect2BlockContainer'
import { typeID } from 'matriangle-api/server/registry/IWorldRegistry'

/**
 * 重生
 * * 呈现一个从无放大到有，交替旋转，并线性缩小消失的蓝色八角形
 * * 用于提示玩家的重生
 */
export default class EffectSpawn extends Effect2Blocks {
	//============Static Variables============//
	/** ID */
	public static readonly ID: typeID = 'EffectSpawn'

	public static readonly DEFAULT_COLOR: uint = 0x6666ff
	public static readonly MAX_LIFE: uint = uint(FIXED_TPS)

	//============Constructor & Destructor============//
	public constructor(
		position: fPoint,
		// scale: number = EffectSpawn.SCALE,
		color: uint = EffectSpawn.DEFAULT_COLOR
	) {
		super(EffectSpawn.ID, position, EffectSpawn.MAX_LIFE, color)
	}

	/**
	 * 覆盖：生命周期正常进行，但会根据其值大小进入不同阶段
	 */
	override onTick(remove: (entity: Entity) => void): void {
		// this.updateDisplayStage()
		super.onTick(remove)
	}
}
