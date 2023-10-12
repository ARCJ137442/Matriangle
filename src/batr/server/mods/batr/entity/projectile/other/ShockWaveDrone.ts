import { uint } from "../../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../../display/api/GlobalDisplayVariables";
import Projectile from "../Projectile";
import { mRot } from "../../../../../general/GlobalRot";
import { fPoint, iPoint, iPointRef } from "../../../../../../common/geometricTools";
import { IShape } from "../../../../../../display/api/DisplayInterfaces";
import IMatrix from "../../../../../main/IMatrix";
import { IEntityInGrid } from "../../../../../api/entity/EntityInterfaces";
import { FIXED_TPS, PROJECTILES_SPAWN_DISTANCE } from "../../../../../main/GlobalWorldVariables";
import { alignToGridCenter_P } from "../../../../../general/PosTransform";
import Tool from "../../../tool/Tool";
import IPlayer from "../../../../native/entities/player/IPlayer";

export default class ShockWaveDrone extends Projectile implements IEntityInGrid {	//============Static Variables============//
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 80;
	public static readonly BLOCK_RADIUS: number = DEFAULT_SIZE / 2;

	public static readonly MOVING_INTERVAL: uint = FIXED_TPS * 0.0625;

	//============Instance Variables============//

	protected _tool: Tool;
	protected _weaponChargePercent: number;

	protected _toolDirection: uint;
	protected _moveDuration: uint = 0;

	// 格点实体 //
	// public readonly i_inGrid: true = true;
	protected _position: iPoint = new iPoint();
	public get position(): iPointRef { return this._position }
	public set position(value: iPointRef) { this._position.copyFrom(value) }

	//============Constructor & Destructor============//
	public constructor(
		owner: IPlayer | null,
		position: fPoint,
		moveDirection: mRot,
		toolDirection: mRot,
		tool: Tool,
		toolDamage: uint, toolExtraDamageCoefficient: uint,
		toolChargePercent: number
	) {
		super(owner, toolDamage, toolExtraDamageCoefficient, moveDirection);
		this._position.copyFrom(position);
		this._tool = tool;
		this._weaponChargePercent = toolChargePercent;
		this._toolDirection = toolDirection;
		// this.shapeInit(shape: IBatrShape);
	}

	/* override destructor(): void {
		// shape.graphics.clear();
		super.destructor();
	} */

	//====Tick Function====//
	protected _temp_entityP: fPoint = new fPoint();
	override onTick(host: IMatrix): void {
		super.onTick(host);
		// Ticking
		if (this._moveDuration > 0)
			this._moveDuration--;
		else {
			// 重置移动间隔时间
			this._moveDuration = ShockWaveDrone.MOVING_INTERVAL;
			// 前进一格
			host.map.towardWithRot_II(this._position, this._direction, 1);
			// （前进后）坐标在地图外/不可跨越⇒消失
			if (
				!host.map.isInMap_I(this._position) ||
				!host.map.testCanPass_I(this._position, false, true, false)
			) {
				// Gone
				host.removeEntity(this);
			}
			// 根据工具模拟玩家使用工具（武器） // ! 💭实际上的考量：似乎可以放开「工具/武器」的区别
			else {
				// 「网格坐标」⇒「网格中心坐标」⇒工具使用坐标（武器发射）
				host.map.towardWithRot_FF(
					alignToGridCenter_P(this._position, this._temp_entityP),
					this._direction,
					PROJECTILES_SPAWN_DISTANCE,
				)
				// 模拟使用 // ! 【2023-09-23 11:16:04】不限于「武器」！
				/* playerUseTool(
					this.owner,
					this._tool,
					this._temp_entityP,
					this._toolDirection,
					this._weaponChargePercent, PROJECTILES_SPAWN_DISTANCE
				); */console.warn('WIP: playerUseTool@ShockWaveDrone',
					this.owner,
					this._tool,
					this._temp_entityP,
					this._toolDirection,
					this._weaponChargePercent, PROJECTILES_SPAWN_DISTANCE)
			}
		}
	}

	/** 实现：不响应「所处方块更新」事件 */
	public onPositedBlockUpdate(host: IMatrix): void { }

	//============Display Implements============//
	public shapeInit(shape: IShape): void {
		shape.graphics.beginFill(this.ownerColor, 0.5);
		shape.graphics.drawRect(
			-ShockWaveDrone.BLOCK_RADIUS, -ShockWaveDrone.BLOCK_RADIUS,
			ShockWaveDrone.BLOCK_RADIUS * 2, ShockWaveDrone.BLOCK_RADIUS * 2
		);
		shape.graphics.drawRect(
			-ShockWaveDrone.BLOCK_RADIUS / 2, -ShockWaveDrone.BLOCK_RADIUS / 2,
			ShockWaveDrone.BLOCK_RADIUS, ShockWaveDrone.BLOCK_RADIUS
		);
		shape.graphics.endFill();
	}

	/** 刷新：无 */
	public shapeRefresh(shape: IShape): void { }

	/** 实现：清除绘图 */
	public shapeDestruct(shape: IShape): void {
		shape.graphics.clear();
	}
}
