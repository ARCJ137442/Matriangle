import { uint } from 'matriangle-legacy/AS3Legacy'
import { DEFAULT_SIZE } from 'matriangle-api/display/GlobalDisplayVariables'
import Projectile from '../Projectile'
import { mRot } from 'matriangle-api/server/general/GlobalRot'
import { fPoint, iPoint, iPointRef } from 'matriangle-common/geometricTools'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import { IEntityInGrid } from 'matriangle-api/server/entity/EntityInterfaces'
import {
	FIXED_TPS,
	PROJECTILES_SPAWN_DISTANCE,
} from 'matriangle-api/server/main/GlobalWorldVariables'
import { alignToGridCenter_P } from 'matriangle-api/server/general/PosTransform'
import Tool from '../../../tool/Tool'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import { typeID } from 'matriangle-api/server/registry/IWorldRegistry'

export default class ShockWaveDrone
	extends Projectile
	implements IEntityInGrid
{
	//============Static Variables============//
	/** ID */
	public static readonly ID: typeID = 'ShockWaveDrone'

	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 80
	public static readonly BLOCK_RADIUS: number = DEFAULT_SIZE / 2

	public static readonly MOVING_INTERVAL: uint = FIXED_TPS * 0.0625

	//============Instance Variables============//

	protected _tool: Tool
	protected _weaponChargePercent: number

	protected _toolDirection: uint
	protected _moveDuration: uint = 0

	// 格点实体 //
	// public readonly i_inGrid = true as const;
	protected _position: iPoint = new iPoint()
	public get position(): iPointRef {
		return this._position
	}
	public set position(value: iPointRef) {
		this._position.copyFrom(value)
	}

	//============Constructor & Destructor============//
	public constructor(
		owner: IPlayer | null,
		position: fPoint,
		moveDirection: mRot,
		toolDirection: mRot,
		tool: Tool,
		toolDamage: uint,
		toolExtraDamageCoefficient: uint,
		toolChargePercent: number
	) {
		super(
			ShockWaveDrone.ID,
			owner,
			toolDamage,
			toolExtraDamageCoefficient,
			moveDirection
		)
		this._position.copyFrom(position)
		this._tool = tool
		this._weaponChargePercent = toolChargePercent
		this._toolDirection = toolDirection
		// this.shapeInit(shape: IBatrShape);
	}

	/* override destructor(): void {
		// shape.graphics.clear();
		super.destructor();
	} */

	//====Tick Function====//
	protected _temp_entityP: fPoint = new fPoint()
	override onTick(host: IMatrix): void {
		super.onTick(host)
		// Ticking
		if (this._moveDuration > 0) this._moveDuration--
		else {
			// 重置移动间隔时间
			this._moveDuration = ShockWaveDrone.MOVING_INTERVAL
			// 前进一格
			host.map.towardWithRot_II(this._position, this._direction, 1)
			// （前进后）坐标在地图外/不可跨越⇒消失
			if (
				!host.map.isInMap_I(this._position) ||
				!host.map.testCanPass_I(this._position, false, true, false)
			) {
				// Gone
				host.removeEntity(this)
			}
			// 根据工具模拟玩家使用工具（武器） // ! 💭实际上的考量：似乎可以放开「工具/武器」的区别
			else {
				// 「网格坐标」⇒「网格中心坐标」⇒工具使用坐标（武器发射）
				host.map.towardWithRot_FF(
					alignToGridCenter_P(this._position, this._temp_entityP),
					this._direction,
					PROJECTILES_SPAWN_DISTANCE
				)
				// 模拟使用 // ! 【2023-09-23 11:16:04】不限于「武器」！
				/* playerUseTool(
					this.owner,
					this._tool,
					this._temp_entityP,
					this._toolDirection,
					this._weaponChargePercent, PROJECTILES_SPAWN_DISTANCE
				); */ console.warn(
					'WIP: playerUseTool@ShockWaveDrone',
					this.owner,
					this._tool,
					this._temp_entityP,
					this._toolDirection,
					this._weaponChargePercent,
					PROJECTILES_SPAWN_DISTANCE
				)
			}
		}
	}

	/** 实现：不响应「所处方块更新」事件 */
	public onPositedBlockUpdate(host: IMatrix): void {}

	//============Display Implements============//
	// !【2024-01-21 20:34:42】暂且使用一个空实现
	syncDisplayProxy(): void {}
	// TODO: 【2023-11-15 23:38:04】亟待迁移至显示端
	// public displayInit(shape: IShape): void {
	// 	shape.graphics.beginFill(this.ownerColor, 0.5)
	// 	shape.graphics.drawRect(
	// 		-ShockWaveDrone.BLOCK_RADIUS,
	// 		-ShockWaveDrone.BLOCK_RADIUS,
	// 		ShockWaveDrone.BLOCK_RADIUS * 2,
	// 		ShockWaveDrone.BLOCK_RADIUS * 2
	// 	)
	// 	shape.graphics.drawRect(
	// 		-ShockWaveDrone.BLOCK_RADIUS / 2,
	// 		-ShockWaveDrone.BLOCK_RADIUS / 2,
	// 		ShockWaveDrone.BLOCK_RADIUS,
	// 		ShockWaveDrone.BLOCK_RADIUS
	// 	)
	// 	shape.graphics.endFill()
	// }

	// /** 刷新：无 */
	// public shapeRefresh(shape: IShape): void {}

	// /** 实现：清除绘图 */
	// public displayDestruct(shape: IShape): void {
	// 	shape.graphics.clear()
	// }
}
