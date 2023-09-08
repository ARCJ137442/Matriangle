
// import batr.common.*;
// import batr.general.*;

// import batr.game.effect.*;
// import batr.game.main.*;

// import flash.display.*;

export default class EffectSpawn extends EffectTeleport {
	//============Static Variables============//
	public static readonly DEFAULT_COLOR: uint = 0x6666ff;
	public static readonly LINE_ALPHA: number = 0.6;
	public static readonly FILL_ALPHA: number = 0.5;
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 25;
	public static readonly SIZE: uint = DEFAULT_SIZE * 1.6;
	public static readonly MAX_LIFE: uint = GlobalGameVariables.FIXED_TPS * 0.5;
	public static readonly SCALE: number = 1;
	public static readonly STAGE_1_START_TIME: uint = MAX_LIFE * 3 / 4;
	public static readonly STAGE_2_START_TIME: uint = MAX_LIFE / 4;
	public static readonly ROTATE_ANGLE: uint = 45;

	//============Instance Variables============//
	protected _animationStage: uint;

	protected _tempLife: uint;

	//============Constructor & Destructor============//
	public constructor(host: Game, x: number, y: number, scale: number = SCALE) {
		super(host, x, y, scale);
		this._animationStage = 0;
	}

	override initScale(scale: number): void {
		this.scale = 0;
	}

	//============Destructor Function============//
	override destructor(): void {
		this._animationStage = 0;
		this._tempLife = 0;
		super.destructor();
	}

	//============Instance Getter And Setter============//
	override get type(): EffectType {
		return EffectType.SPAWN;
	}

	//============Instance Functions============//
	override drawShape(): void {
		drawBlocks(EffectSpawn.DEFAULT_COLOR, EffectSpawn.SIZE);
	}

	override onEffectTick(): void {
		dealLife();

		if (this.life <= STAGE_2_START_TIME) {
			this._animationStage = 2;
		}
		else if (this.life <= STAGE_1_START_TIME) {
			this._animationStage = 1;
		}
		else {
			this._animationStage = 0;
		}
		if (_animationStage == 0) {
			this._tempLife = LIFE - life;
			this.scale = (_tempLife / (LIFE - STAGE_1_START_TIME)) * this.maxScale;
		}
		else if (_animationStage == 1) {
			this._tempLife = LIFE - life - STAGE_2_START_TIME;
			this.block1.rotation = -(_tempLife / (STAGE_1_START_TIME - STAGE_2_START_TIME)) * ROTATE_ANGLE;
			this.block2.rotation = 45 + (_tempLife / (STAGE_1_START_TIME - STAGE_2_START_TIME)) * ROTATE_ANGLE;
		}
		else if (_animationStage == 2) {
			this._tempLife = life;
			this.scale = _tempLife / STAGE_2_START_TIME * this.maxScale;
		}
	}
}