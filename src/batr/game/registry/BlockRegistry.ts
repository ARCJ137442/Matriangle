// import batr.common.*;
// import batr.general.*;

import { Class, uint } from "../../legacy/AS3Legacy";
import BlockAttributes from "../block/BlockAttributes";
import TypeCommon from "../template/TypeCommon";
import * as exMath from "../../common/exMath";

// import batr.game.block.*;
// import batr.game.block.blocks.*;

export default class BlockType extends TypeCommon {
	//============Static Getter And Setter============//
	public static get RANDOM_NORMAL(): BlockType {
		return BlockType._NORMAL_BLOCKS[exMath.random(BlockType._NORMAL_BLOCKS.length)];
	}

	//============Static Functions============//
	/**
	 * Get a BlockType from a string name
	 * @param str The name of the BlockType
	 * @param range the field where the function search, default the native registry
	 * @returns if searched, return the type in the range, otherwise it is null
	 */
	public static fromString(str: string, range = BlockType._NORMAL_BLOCKS): BlockType | null {
		for (var type of range) {
			if (type.name == str)
				return type;
		}
		return null;
	}

	public static isIncludeIn(type: BlockType, types: BlockType[]): boolean {
		for (var type2 of types) {
			if (type == type2)
				return true;
		}
		return false;
	}

	public static fromMapColor(color: uint): BlockType | null {
		for (var type of BlockType._ALL_BLOCKS) {
			if (type._mapColor == color)
				return type;
		}
		return null;
	}

	//============Instance Variables============//
	protected _currentBlock: Class;

	protected _currentAttributes: BlockAttributes;

	/**
	 * Be use for BitMap importing.
	 */
	protected _mapColor: uint = 0xffffffff;

	//============Constructor & Destructor============//
	public constructor(name: string, currentBlock: Class, currentAttributes: BlockAttributes) {
		super(name);
		this._currentBlock = currentBlock;
		this._currentAttributes = currentAttributes;
	}

	//============Instance Getter And Setter============//
	override get label(): string {
		return 'block';
	}

	public get currentBlock(): Class {
		return this._currentBlock;
	}

	public get currentAttributes(): BlockAttributes {
		return this._currentAttributes;
	}

	public get mapColor(): uint {
		return this._mapColor;
	}

	//============Instance Functions============//
	protected setMapColor(color: uint): BlockType {
		this._mapColor = color;
		return this;
	}

	//============Static Constants: Native Registry============//
	public static readonly ABSTRACT: BlockType = new BlockType('Abstract', null, BlockAttributes.ABSTRACT);

	public static readonly VOID: BlockType = new BlockType('Void', null, BlockAttributes.VOID).setMapColor(0xffffff);
	public static readonly WALL: BlockType = new BlockType('Wall', Wall, BlockAttributes.WALL).setMapColor(0x888888);
	public static readonly WATER: BlockType = new BlockType('Water', Water, BlockAttributes.WATER).setMapColor(0x00b0ff);
	public static readonly GLASS: BlockType = new BlockType('Glass', Glass, BlockAttributes.GLASS).setMapColor(0xeeeeee);
	public static readonly BEDROCK: BlockType = new BlockType('BedRock', Bedrock, BlockAttributes.BEDROCK).setMapColor(0x444444);
	public static readonly X_TRAP_HURT: BlockType = new BlockType('XTrapHurt', XTrap, BlockAttributes.X_TRAP_HURT).setMapColor(0xff8000);
	public static readonly X_TRAP_KILL: BlockType = new BlockType('XTrapKill', XTrap, BlockAttributes.X_TRAP_KILL).setMapColor(0xff0000);
	public static readonly X_TRAP_ROTATE: BlockType = new BlockType('XTrapRotate', XTrap, BlockAttributes.X_TRAP_ROTATE).setMapColor(0x0000ff);
	public static readonly COLORED_BLOCK: BlockType = new BlockType('ColoredBlock', ColoredBlock, BlockAttributes.COLORED_BLOCK);
	public static readonly COLOR_SPAWNER: BlockType = new BlockType('ColorSpawner', ColorSpawner, BlockAttributes.COLOR_SPAWNER).setMapColor(0xff00ff);
	public static readonly LASER_TRAP: BlockType = new BlockType('LaserTrap', LaserTrap, BlockAttributes.LASER_TRAP).setMapColor(0x00ffff);
	public static readonly METAL: BlockType = new BlockType('Metal', Metal, BlockAttributes.METAL).setMapColor(0x999999);
	public static readonly SPAWN_POINT_MARK: BlockType = new BlockType('SpawnPointMark', SpawnPointMark, BlockAttributes.SPAWN_POINT_MARK).setMapColor(0x6600ff);
	public static readonly SUPPLY_POINT: BlockType = new BlockType('Supplypoint', SupplyPoint, BlockAttributes.SUPPLY_POINT).setMapColor(0x66ff00);
	public static readonly GATE_OPEN: BlockType = new BlockType('GateOpen', Gate, BlockAttributes.GATE_OPEN).setMapColor(0xcccccc);
	public static readonly GATE_CLOSE: BlockType = new BlockType('GateClose', Gate, BlockAttributes.GATE_CLOSE).setMapColor(0x666666);
	public static readonly MOVEABLE_WALL: BlockType = new BlockType('MoveableWall', MoveableWall, BlockAttributes.MOVEABLE_WALL).setMapColor(0x88cc88);

	public static readonly _SOLID_BLOCKS: BlockType[] = new < BlockType > [
	];
	public static readonly _LIQUID_BLOCKS: BlockType[] = new Array<BlockType>(BlockType.WATER);

	public static readonly _GAS_BLOCKS: BlockType[] = new Array < BlockType > [BlockType.GATE_OPEN];

	public static readonly _BASE_BLOCKS: BlockType[] = new Array < BlockType > [BlockType.SUPPLY_POINT];

	public static readonly _OTHER_BLOCKS: BlockType[] = new Array < BlockType > [BlockType.X_TRAP_HURT, BlockType.X_TRAP_KILL, BlockType.X_TRAP_ROTATE];
	public static readonly _NORMAL_BLOCKS: BlockType[] = BlockType._SOLID_BLOCKS.concat(BlockType._LIQUID_BLOCKS).concat(BlockType._GAS_BLOCKS).concat(BlockType._OTHER_BLOCKS);
	public static readonly _SPECIAL: BlockType[] = new Array<BlockType>(BlockType.VOID, BlockType.SPAWN_POINT_MARK);

	public static readonly _ALL_BLOCKS: BlockType[] = [

	]
}