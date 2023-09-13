
// import batr.general.*;

// import batr.game.effect.*;
// import batr.game.main.*;

// import flash.display.*;

export default class EffectTeleport extends EffectCommon {
	//============Static Variables============//
	public static readonly DEFAULT_COLOR: uint = 0x44ff44;
	public static readonly LINE_ALPHA: number = 0.6;
	public static readonly FILL_ALPHA: number = 0.5;
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 25;
	public static readonly SIZE: uint = DEFAULT_SIZE * 2;
	public static readonly SCALE: number = 1;

	//============Instance Variables============//
	protected maxScale: number;
	protected block1: Shape = new Shape();
	protected block2: Shape = new Shape();

	//============Constructor & Destructor============//
	public constructor(host: IBatrGame, x: number, y: number, scale: number = EffectTeleport.SCALE) {
		super(host, x, y, GlobalGameVariables.FIXED_TPS);
		this.drawShape();
		this.maxScale = scale;
		this.initScale(scale);
		this.addChildren();
	}

	protected initScale(scale: number): void {
		this.scale = maxScale;
	}

	//============Destructor Function============//
	override destructor(): void {
		this.maxScale = NaN;
		if (this.block1 != null) {
			this.removeChild(this.block1);
			this.block1.graphics.clear();
			this.block1 = null;
		}
		if (this.block1 != null) {
			this.removeChild(this.block2);
			this.block2.graphics.clear();
			this.block2 = null;
		}
		super.destructor();
	}

	//============Instance Getter And Setter============//
	override get type(): EffectType {
		return EffectType.TELEPORT;
	}

	protected set scale(value: number) {
		this.scaleX = this.scaleY = value;
	}

	//============Instance Functions============//
	protected addChildren(): void {
		this.addChild(this.block1);
		this.addChild(this.block2);
	}

	override onEffectTick(): void {
		this.scale = (life / LIFE) * maxScale;
		this.rotation = ((LIFE - life) / LIFE) * 360;
		dealLife();
	}

	override drawShape(): void {
		drawBlocks(EffectTeleport.DEFAULT_COLOR, EffectTeleport.SIZE);
	}

	protected drawBlocks(color: uint, size: uint): void {
		drawBlock(this.block1.graphics, color, size);
		drawBlock(this.block2.graphics, color, size);
		this.block2.rotation = 45;
	}

	protected drawBlock(graphics: Graphics, color: uint, size: uint): void {
		graphics.clear();
		graphics.lineStyle(LINE_SIZE, color, LINE_ALPHA);
		graphics.beginFill(color, FILL_ALPHA);
		graphics.drawRect(-size / 2, -size / 2, size, size);
		graphics.endFill();
	}
}