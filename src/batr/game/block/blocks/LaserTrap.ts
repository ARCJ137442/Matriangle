import { uint } from "../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../display/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../display/GlobalDisplayVariables";
import { NativeBlockAttributes } from "../../registry/BlockAttributesRegistry";
import BlockCommon from "../BlockCommon";
import BlockBedrock from "./Bedrock";
import BlockColorSpawner from "./ColorSpawner";
import BlockWall from "./Wall";
import IBatrGame from "../../main/IBatrGame";
import LaserAbsorption from "../../entity/entities/projectile/LaserAbsorption";
import LaserBasic from "../../entity/entities/projectile/LaserBasic";
import LaserPulse from "../../entity/entities/projectile/LaserPulse";
import LaserTeleport from "../../entity/entities/projectile/LaserTeleport";
import { alignToEntity } from "../../../general/PosTransform";
import { getRandom } from "../../../general/GlobalRot";

export default class BlockLaserTrap extends BlockCommon {
	//============Static Variables============//
	public static readonly LINE_COLOR: uint = BlockBedrock.LINE_COLOR;
	public static readonly FILL_COLOR: uint = BlockBedrock.FILL_COLOR;
	public static readonly CENTER_COLOR: uint = BlockColorSpawner.CENTER_COLOR;

	public static readonly LINE_SIZE: uint = BlockWall.LINE_SIZE;

	/**
	 * 启用单例模式的方块，只有一个实例
	 * 
	 * ! 为属性安全，禁止一切对方块本身进行修改的行为
	 */
	public static readonly INSTANCE: BlockLaserTrap = new BlockLaserTrap();


	//============Constructor & Destructor============//
	public constructor() {
		super(NativeBlockAttributes.LASER_TRAP);
	}

	override clone(): BlockCommon {
		return new BlockLaserTrap();
	}

	//============Game Mechanics============//

	/**
	 * 原`laserTrapShootLaser`
	 * @param host 调用的游戏主体
	 * @param sourceX 被调用方块的x坐标
	 * @param sourceY 被调用方块的y坐标
	 */
	public override onRandomTick(host: IBatrGame, sourceX: number, sourceY: number): void {

		let randomRot: uint, rotX: number, rotY: number, laserLength: number;
		// add laser by owner=null
		let p: LaserBasic;
		let i: uint;
		do {
			randomRot = getRandom();
			rotX = alignToEntity(x) + GlobalRot.towardIntX(randomRot, GlobalGameVariables.PROJECTILES_SPAWN_DISTANCE);
			rotY = alignToEntity(y) + GlobalRot.towardIntY(randomRot, GlobalGameVariables.PROJECTILES_SPAWN_DISTANCE);
			if (isOutOfMap(rotX, rotY))
				continue;
			laserLength = getLaserLength2(rotX, rotY, randomRot);
			if (laserLength <= 0)
				continue;
			switch (exMath.random(4)) {
				case 1:
					p = new LaserTeleport(this, rotX, rotY, null, laserLength);
					break;
				case 2:
					p = new LaserAbsorption(this, rotX, rotY, null, laserLength);
					break;
				case 3:
					p = new LaserPulse(this, rotX, rotY, null, laserLength);
					break;
				default:
					p = new LaserBasic(this, rotX, rotY, null, laserLength, 1);
					break;
			}
			if (p != null) {
				p.rot = randomRot;
				this.entitySystem.registerProjectile(p);
				this._projectileContainer.addChild(p);
				// trace('laser at'+'('+p.entityX+','+p.entityY+'),'+p.life,p.length,p.visible,p.alpha,p.owner);
			}
		}
		while (laserLength <= 0 && ++i < 0x10);
	}

	//============Display Implements============//
	public shapeInit(shape: IBatrShape): void {
		// Line
		shape.graphics.beginFill(BlockLaserTrap.LINE_COLOR);
		shape.graphics.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
		shape.graphics.endFill();
		// Fill
		shape.graphics.beginFill(BlockLaserTrap.FILL_COLOR);
		shape.graphics.drawRect(BlockLaserTrap.LINE_SIZE, BlockLaserTrap.LINE_SIZE, DEFAULT_SIZE - BlockLaserTrap.LINE_SIZE * 2, DEFAULT_SIZE - BlockLaserTrap.LINE_SIZE * 2);
		shape.graphics.endFill();
		// Rhombus
		shape.graphics.lineStyle(BlockLaserTrap.LINE_SIZE, BlockLaserTrap.CENTER_COLOR);
		this.drawRhombus(
			shape,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 3
		);
		this.drawRhombus(
			shape,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 4
		);
		this.drawRhombus(
			shape,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 5
		);
		this.drawRhombus(
			shape,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 6
		);
		// Point
		shape.graphics.beginFill(BlockLaserTrap.CENTER_COLOR);
		shape.graphics.drawCircle(
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 16
		);
		shape.graphics.endFill();
	}

	protected drawRhombus(shape: IBatrShape, cX: number, cY: number, radius: number): void {
		shape.graphics.moveTo(cX - radius, cY);
		shape.graphics.lineTo(cX, cY + radius);
		shape.graphics.lineTo(cX + radius, cY);
		shape.graphics.lineTo(cX, cY - radius);
		shape.graphics.lineTo(cX - radius, cY);
	}
}