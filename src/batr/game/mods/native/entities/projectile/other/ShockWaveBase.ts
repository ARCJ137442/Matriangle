

import { uint, int } from "../../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../../display/api/GlobalDisplayVariables";
import EntityType from "../../../../../api/entity/EntityType";
import Player from "../../player/Player";
import Projectile from "../Projectile";
import ShockWaveDrone from "./ShockWaveDrone";
import { IEntityFixedLived, IEntityInGrid } from "../../../../../api/entity/EntityInterfaces";
import { IBatrShape } from "../../../../../../display/api/BatrDisplayInterfaces";
import { FIXED_TPS } from "../../../../../main/GlobalGameVariables";
import { fPoint, iPoint, iPointRef, iPointVal } from "../../../../../../common/geometricTools";
import IBatrGame from "../../../../../main/IBatrGame";
import { NativeEntityTypes } from "../../../registry/EntityRegistry";
import Weapon from "../../../tool/Weapon";
import { random1 } from "../../../../../../common/exMath";
import { axis2mRot_n, axis2mRot_p, mRot, mRot2axis, rotate_M } from "../../../../../general/GlobalRot";
import Tool from "../../../tool/Tool";

/**
 * ...
 * @author ARCJ137442
 */
export default class ShockWaveBase extends Projectile implements IEntityInGrid, IEntityFixedLived {

	override get type(): EntityType { return NativeEntityTypes.SHOCKWAVE_BASE }

	//============Static Variables============//
	public static readonly BLOCK_RADIUS: number = DEFAULT_SIZE * 1.2;

	/**
	 * 释放子机的「ALPHA模式」
	 * * 会从「玩家发射处」（一般为前方一格）横向（高维情况下为所有其它轴向）产生「发射方向与玩家一致」的子机
	 */
	public static readonly MODE_ALPHA: uint = 0;
	/**
	 * 释放子机的「BETA模式」
	 * * 会以玩家为中心，从x轴向开始，每两个轴形成一个「涡旋」
	 *   * 左右旋沿用AS3版本随机
	 * 
	 * TODO: 【2023-09-22 23:28:11】等待开发
	 */
	public static readonly MODE_BETA: uint = 1;


	//============Instance Variables============//
	// ? ↓AS3版本遗留物，不知道有什么个作用
	// protected _leftBlock: Sprite;
	// protected _rightBlock: Sprite;

	/** 在「生成子机」时传递给子机的「使用对象」 */
	protected _tool: Tool;
	protected _weaponChargePercent: number;

	/** Default instanceof 0,Vortex instanceof 1 */
	public mode: uint = 0;

	//============Constructor & Destructor============//
	public constructor(
		position: fPoint,
		owner: Player | null,
		direction: mRot,
		tool: Tool,
		weaponAttackerDamage: number,
		weaponCharge: number,
		mode: uint
	) {
		super(
			owner,
			weaponAttackerDamage, // ! 自身无伤害，但一般用「其所含武器的伤害」（就如玩家扩展了一种「使用武器的方式」）
			direction, // * 这个方向是为「ALPHA模式」特制的
		);
		this._position.copyFrom(position)
		this._tool = tool;
		this.mode = mode;
		this._weaponChargePercent = weaponCharge;
		// this.shapeInit(shape: IBatrShape);
	}

	//============Instance Functions============//

	// 固定寿命 //
	public readonly i_fixedLive: true = true;

	public static readonly LIFE: uint = FIXED_TPS;
	public get LIFE(): uint { return ShockWaveBase.LIFE; }

	/**
	 * 生命周期
	 */
	protected _life: uint = ShockWaveBase.LIFE;
	public get life(): uint { return this._life; }
	public get lifePercent(): number { return this._life / this.LIFE }

	// 格点实体 //
	public readonly i_InGrid: true = true;

	protected _position: iPointVal = new iPoint();
	public get position(): iPointRef { return this._position; }
	public set position(value: iPointRef) { this._position.copyFrom(value) }

	override onTick(host: IBatrGame): void {
		// Charging
		if (this._life <= 0) {
			this.summonDrones(host);
			// Remove
			host.entitySystem.remove(this);
		}
		else {
			this._life--;
			// TODO: 请求显示更新
		}
	}

	/**
	 * 根据自身的「模式」生成「冲击波子机」
	 * 
	 * @param host 基于的游戏主体
	 */
	public summonDrones(host: IBatrGame): void {
		// Summon Drone
		switch (this.mode) {
			// * ALPHA模式（参见常量の注释）
			case ShockWaveBase.MODE_ALPHA:
				// 遍历所有非自身朝向的轴向
				let newAxis: uint
				for (let i: uint = 1; i < host.map.storage.numDimension; i++) {
					// 找到一个不与自身同一个轴向的坐标轴
					newAxis = (mRot2axis(this._direction) + i) % host.map.storage.numDimension;
					// 正负方向各一个，且方向与自身（玩家发射时）方向一致
					this.summonDrone(host, axis2mRot_p(newAxis), this._direction);
					this.summonDrone(host, axis2mRot_n(newAxis), this._direction);
				}
			// * BETA模式（参见常量の注释）
			case ShockWaveBase.MODE_BETA:
				// 每隔两个轴向，在这两个轴向里生成涡旋
				let axis_x: uint, axis_y: uint, rot_xP: mRot;
				for (let i: uint = 0; i < host.map.storage.numDimension - 1; i += 2) { // * 此处「-1」的原因是「避免奇数维遍历到『维数溢出』的情况」
					// 计算轴向、方向信息
					axis_x = i, axis_y = i + 1, rot_xP = axis2mRot_p(axis_x);
					let rotateOffset: int = random1();
					// 绕这俩轴「四方旋转」
					for (let u: int = 0; u < 4; u++) {
						this.summonDrone(host, u, rotate_M(rot_xP, axis_y, u + rotateOffset));
						console.debug(
							'axis_x:', axis_x, 'axis_y:', axis_y,
							`\nrotate_M(rot_xP, axis_y, u + rotateOffset) = ${rotate_M(rot_xP, axis_y, u + rotateOffset)}`
						)
					}
				}
				// 如果是「奇数维」，那剩下的「最后一个维度」还没被遍历到 // ! 默认逻辑：与「基座方向」（玩家方向）一致
				axis_x = host.map.storage.numDimension - 1;
				if ((axis_x & 1) === 0) {
					this.summonDrone(host, axis2mRot_p(axis_x), this._direction);
					this.summonDrone(host, axis2mRot_n(axis_x), this._direction);
				}
				break;
		}
	}

	public summonDrone(
		host: IBatrGame,
		droneMoveDirection: mRot,
		toolDirection: mRot = this._direction
	): void {
		let drone: ShockWaveDrone = new ShockWaveDrone(
			this.owner,
			this._position,
			droneMoveDirection,
			toolDirection,
			this._tool,
			this._attackerDamage,
			this._weaponChargePercent
		);
		host.entitySystem.register(drone);
		// host.projectileContainer.addChild(drone); // ! 解耦
	}

	//============Display Implements============//

	/** 实现：大方形盖掉小方形 */
	public shapeInit(shape: IBatrShape): void {
		shape.graphics.beginFill(this.ownerColor);
		shape.graphics.drawRect(-ShockWaveBase.BLOCK_RADIUS, -ShockWaveBase.BLOCK_RADIUS, ShockWaveBase.BLOCK_RADIUS * 2, ShockWaveBase.BLOCK_RADIUS * 2);
		shape.graphics.drawRect(-ShockWaveBase.BLOCK_RADIUS / 2, -ShockWaveBase.BLOCK_RADIUS / 2, ShockWaveBase.BLOCK_RADIUS, ShockWaveBase.BLOCK_RADIUS);
		shape.graphics.endFill();
	}

	/** 实现：更新尺寸和不透明度 */
	public shapeRefresh(shape: IBatrShape): void {
		shape.scaleX = shape.scaleY = 1 - this.lifePercent;
		shape.alpha = 0.5 + this.lifePercent / 2;
	}

	/** 实现：清除绘图 */
	public shapeDestruct(shape: IBatrShape): void {
		shape.graphics.clear();
	}

}