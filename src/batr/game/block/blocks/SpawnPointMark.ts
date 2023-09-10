import { uint } from "../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../display/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../display/GlobalDisplayVariables";
import { NativeBlockAttributes } from "../../registry/BlockAttributesRegistry";
import BlockCommon from "../BlockCommon";

// A Mark to SpawnPoint
export default class BlockSpawnPointMark extends BlockCommon {
	//============Static Variables============//
	public static readonly LINE_COLOR: uint = 0x808080;
	public static readonly FILL_COLOR: uint = 0xcccccc;
	public static readonly CENTER_COLOR: uint = 0x8000ff;
	public static readonly BASE_ALPHA: number = 0.5;

	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 32;

	/**
	 * 启用单例模式的方块，只有一个实例
	 * 
	 * ! 为属性安全，禁止一切对方块本身进行修改的行为
	 */
	public static readonly INSTANCE: BlockSpawnPointMark = new BlockSpawnPointMark();

	//============Constructor & Destructor============//
	public constructor() {
		super(NativeBlockAttributes.SPAWN_POINT_MARK);
	}

	override destructor(): void {
		super.destructor();
	}

	override clone(): BlockCommon {
		return new BlockSpawnPointMark();
	}

	//============Display Implements============//
	public shapeInit(shape: IBatrShape): void {
		// Base
		shape.graphics.beginFill(BlockSpawnPointMark.LINE_COLOR, BlockSpawnPointMark.BASE_ALPHA);
		shape.graphics.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
		shape.graphics.drawRect(BlockSpawnPointMark.LINE_SIZE, BlockSpawnPointMark.LINE_SIZE, DEFAULT_SIZE - BlockSpawnPointMark.LINE_SIZE * 2, DEFAULT_SIZE - BlockSpawnPointMark.LINE_SIZE * 2);
		shape.graphics.endFill();
		shape.graphics.beginFill(BlockSpawnPointMark.FILL_COLOR, BlockSpawnPointMark.BASE_ALPHA);
		shape.graphics.drawRect(BlockSpawnPointMark.LINE_SIZE, BlockSpawnPointMark.LINE_SIZE, DEFAULT_SIZE - BlockSpawnPointMark.LINE_SIZE * 2, DEFAULT_SIZE - BlockSpawnPointMark.LINE_SIZE * 2);
		shape.graphics.endFill();
		// Center
		shape.graphics.lineStyle(BlockSpawnPointMark.LINE_SIZE, BlockSpawnPointMark.CENTER_COLOR);
		this.drawSpawnMark(
			shape,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 3
		);
		this.drawSpawnMark(
			shape,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 4
		);
		this.drawSpawnMark(
			shape,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 5
		);
		this.drawSpawnMark(
			shape,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 6
		);
		/*shape.graphics.beginFill(LINE_COLOR);
		shape.graphics.drawCircle(
			DEFAULT_SIZE/2,
			DEFAULT_SIZE/2,
			DEFAULT_SIZE/10
		);
		shape.graphics.endFill();*/
	}

	protected drawSpawnMark(shape: IBatrShape, cX: number, cY: number, radius: number): void {
		shape.graphics.drawRect(cX - radius, cY - radius, radius * 2, radius * 2);
		shape.graphics.moveTo(cX - radius, cY);
		shape.graphics.lineTo(cX, cY + radius);
		shape.graphics.lineTo(cX + radius, cY);
		shape.graphics.lineTo(cX, cY - radius);
		shape.graphics.lineTo(cX - radius, cY);
	}
}