
// import batr.game.block.*;
// import batr.game.block.blocks.*;

// import flash.display.Shape;
// import flash.events.Event;

export default class BlockCommon extends Shape {
	//============Static Functions============//
	public static function fromType(type: BlockType): BlockCommon {
		switch (type) {
			case BlockType.X_TRAP_HURT:
			case BlockType.X_TRAP_KILL:
			case BlockType.X_TRAP_ROTATE:
				return new XTrap(type);
			case BlockType.GATE_OPEN:
				return new Gate(true);
			case BlockType.GATE_CLOSE:
				return new Gate(false);
			default:
				if (type != null && type.currentBlock != null)
					return new type.currentBlock();
				else
					return null;
		}
	}

	public static function fromMapColor(color: uint): BlockCommon {
		return BlockCommon.fromType(BlockType.fromMapColor(color));
	}

	//============Constructor Function============//
	public BlockCommon(): void {
		super();
	}

	public clone(): BlockCommon {
		return new BlockCommon();
	}

	//============Destructor Function============//
	public destructor(): void {
		this.graphics.clear();
	}

	//============Instance Getter And Setter============//
	public get attributes(): BlockAttributes {
		return BlockAttributes.ABSTRACT;
	}

	public get type(): BlockType {
		return BlockType.ABSTRACT;
	}

	public get pixelColor(): uint {
		if (this.attributes == null)
			return 0xffffff;
		return this.attributes.defaultPixelColor;
	}

	public get pixelAlpha(): uint {
		if (this.attributes == null)
			return uint$MAX_VALUE;
		return this.attributes.defaultPixelAlpha;
	}

	//============Instance Functions============//
	public displayEquals(block: BlockCommon): boolean {
		return this === block;
	}

	public reDraw(): void {
		this.graphics.clear();
		this.drawMain();
	}

	protected drawMain(): void {
	}
}