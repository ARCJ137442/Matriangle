

import { uint } from "../../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../../display/api/GlobalDisplayVariables";
import EntityType from "../../../../../api/entity/EntityType";
import Player from "../../player/Player";
import Projectile from "../Projectile";
import { mRot } from "../../../../../general/GlobalRot";
import { fPoint, iPoint, iPointRef } from "../../../../../../common/geometricTools";
import { IBatrShape } from "../../../../../../display/api/BatrDisplayInterfaces";
import IBatrGame from "../../../../../main/IBatrGame";
import { NativeEntityTypes } from "../../../registry/EntityRegistry";
import { IEntityInGrid } from "../../../../../api/entity/EntityInterfaces";
import { FIXED_TPS, PROJECTILES_SPAWN_DISTANCE } from "../../../../../main/GlobalGameVariables";
import Weapon from "../../../tool/Weapon";
import { alignToGridCenter_P } from "../../../../../general/PosTransform";

export default class ShockWaveDrone extends Projectile implements IEntityInGrid {

	override get type(): EntityType { return NativeEntityTypes.SHOCKWAVE_DRONE }

	//============Static Variables============//
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 80;
	public static readonly BLOCK_RADIUS: number = DEFAULT_SIZE / 2;

	public static readonly MOVING_INTERVAL: uint = FIXED_TPS * 0.0625;

	//============Instance Variables============//

	protected _tool: Weapon;
	protected _weaponChargePercent: number;

	protected _toolDirection: uint;
	protected _moveDuration: uint = 0;

	// 格点实体 //
	public readonly i_InGrid: true = true;
	protected _position: iPoint = new iPoint();
	public get position(): iPointRef { return this._position }
	public set position(value: iPointRef) { this._position.copyFrom(value) }

	//============Constructor & Destructor============//
	public constructor(
		owner: Player | null,
		position: fPoint,
		moveDirection: mRot,
		toolDirection: mRot,
		weapon: Weapon,
		toolDamage: uint,
		toolChargePercent: number
	) {
		super(owner, toolDamage, moveDirection);
		this._position.copyFrom(position);
		this._tool = weapon;
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
	override onTick(host: IBatrGame): void {
		super.onTick(host);
		// Ticking
		if (this._moveDuration > 0)
			this._moveDuration--;
		else {
			// 重置移动间隔时间
			this._moveDuration = ShockWaveDrone.MOVING_INTERVAL;
			// 前进一格
			host.map.logic.towardWithRot_II(this._position, this._direction, 1);
			// （前进后）坐标在地图外/不可跨越⇒消失
			if (
				!host.map.logic.isInMap_I(this._position) ||
				!host.map.logic.testCanPass_I(this._position, false, true, false)
			) {
				// Gone
				host.entitySystem.remove(this);
			}
			// 根据工具模拟玩家使用工具（武器） // ! 💭实际上的考量：似乎可以放开「工具/武器」的区别
			else {
				// 「网格坐标」⇒「网格中心坐标」⇒工具使用坐标（武器发射）
				host.map.logic.towardWithRot_FF(
					alignToGridCenter_P(this._position, this._temp_entityP),
					this._direction,
					PROJECTILES_SPAWN_DISTANCE,
				)
				// 模拟使用
				host.playerUseToolAt(
					this.owner,
					this._tool,
					this._temp_entityP,
					this._toolDirection,
					this._weaponChargePercent, PROJECTILES_SPAWN_DISTANCE
				);
			}
		}
	}

	//============Display Implements============//
	public shapeInit(shape: IBatrShape): void {
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
	public shapeRefresh(shape: IBatrShape): void { }

	/** 实现：清除绘图 */
	public shapeDestruct(shape: IBatrShape): void {
		shape.graphics.clear();
	}
}
