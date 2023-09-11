import { int, uint } from "../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../display/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../display/GlobalDisplayVariables";
import BlockCommon from "../BlockCommon";
import { NativeBlockAttributes } from "../../registry/BlockAttributesRegistry";
import { iPoint } from "../../../common/geometricTools";
import BlockColored from "./Colored";
import { NativeBlockTypes } from "../../registry/BlockTypeRegistry";
import { alignToEntity } from "../../../general/PosTransform";
import IBatrGame from "../../main/IBatrGame";

export default class BlockColorSpawner extends BlockCommon {
	//============Static Variables============//
	public static readonly LINE_COLOR: uint = 0x999999;
	public static readonly FILL_COLOR: uint = 0xaaaaaa;
	public static readonly CENTER_COLOR: uint = 0x444444;

	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 32;

	/**
	 * 启用单例模式的方块，只有一个实例
	 * 
	 * ! 为属性安全，禁止一切对方块本身进行修改的行为
	 */
	public static readonly INSTANCE: BlockColorSpawner = new BlockColorSpawner();

	//============Constructor & Destructor============//
	public constructor() {
		super(NativeBlockAttributes.COLOR_SPAWNER);
	}

	override clone(): BlockCommon {
		return new BlockColorSpawner();
	}

	/**
	 * 原`colorSpawnerSpawnBlock`
	 */
	public override onRandomTick(host: IBatrGame, sourceX: int, sourceY: int): void {
		// ? 是否还是要用高开销的「自定义对象」呢？不好扩展又性能妨碍
		let randomPoint: iPoint = host.map.storage.randomPoint;
		let x: int = randomPoint.x;
		let y: int = randomPoint.y;
		let block: BlockCommon = BlockColored.randomInstance(NativeBlockTypes.COLORED);
		if (!host.map.logic.isOutOfMap(x, y) && host.map.storage.isVoid(x, y)) {
			host.setBlock(x, y, block); // * 后续游戏需要处理「方块更新事件」
			host.addBlockLightEffect2(
				alignToEntity(x),
				alignToEntity(y),
				block, false
			);
		}
	}

	//============Display Implements============//
	override shapeInit(shape: IBatrShape): void {
		super.shapeInit(shape);
		// Line
		shape.graphics.beginFill(BlockColorSpawner.LINE_COLOR);
		shape.graphics.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
		shape.graphics.endFill();
		// Fill
		shape.graphics.beginFill(BlockColorSpawner.FILL_COLOR);
		shape.graphics.drawRect(BlockColorSpawner.LINE_SIZE, BlockColorSpawner.LINE_SIZE, DEFAULT_SIZE - BlockColorSpawner.LINE_SIZE * 2, DEFAULT_SIZE - BlockColorSpawner.LINE_SIZE * 2);
		shape.graphics.endFill();
		// Circle
		shape.graphics.lineStyle(DEFAULT_SIZE / 32, BlockColorSpawner.CENTER_COLOR);
		// 1
		shape.graphics.drawCircle(DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE * 0.4);
		// 2
		shape.graphics.drawCircle(DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE * 0.25);
		// 3
		shape.graphics.drawCircle(DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE * 0.325);
	}
}