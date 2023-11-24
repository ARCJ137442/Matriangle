import { fPoint } from 'matriangle-common/geometricTools'
import { uint } from 'matriangle-legacy/AS3Legacy'
import { FIXED_TPS } from 'matriangle-api/server/main/GlobalWorldVariables'
import Effect2Blocks from './Effect2BlockContainer'
import { typeID } from 'matriangle-api'

/**
 * 传送
 * * 呈现一个快速旋转并缩小到最小尺寸的绿色八角形
 * * 用于提示玩家被传送
 */
export default class EffectTeleport extends Effect2Blocks {
	//============Static Variables============//
	/** ID */
	public static readonly ID: typeID = 'EffectTeleport'

	public static readonly LIFE: uint = FIXED_TPS

	//============Constructor & Destructor============//
	public constructor(
		position: fPoint,
		// scale: number = EffectTeleport.SCALE,
		color: uint = EffectTeleport.DEFAULT_COLOR
	) {
		super(
			EffectTeleport.ID,
			position,
			EffectTeleport.LIFE,
			color /* scale */
		)
	}

	//============Display Implements============//
	public static readonly DEFAULT_COLOR: uint = 0x44ff44
}
