
// import batr.common.*;
// import batr.general.*;

// import batr.game.entity.*;
// import batr.game.entity.entity.player.*;
// import batr.game.entity.entity.projectile.*;
// import batr.game.model.*;
// import batr.game.main.*;

// import flash.display.Sprite;

/**
 * ...
 * @author ARCJ137442
 */
export default class ShockWaveBase extends ProjectileCommon {
	//============Static Variables============//
	public static readonly BLOCK_RADIUS: number = DEFAULT_SIZE * 1.2;

	/**
	 * Life For Charge
	 */
	public static readonly LIFE: uint = GlobalGameVariables.FIXED_TPS;

	//============Static Functions============//

	//============Instance Variables============//
	protected _leftBlock: Sprite;
	protected _rightBlock: Sprite;

	protected _life: uint = 0;

	protected _tool: ToolType;
	protected _toolChargePercent: number;

	/**
	 * Default is 0,Vortex is 1
	 */
	public mode: uint = 0;

	//============Constructor & Destructor============//
	public constructor(host: Game, x: number, y: number, owner: Player, tool: ToolType, toolCharge: number, mode: uint = 0) {
		super(host, x, y, owner);
		this._currentTool = ToolType.SHOCKWAVE_ALPHA;
		this._tool = tool;
		this.mode = mode;
		this._toolChargePercent = toolCharge;
		this.drawShape();
	}

	//============Instance Getter And Setter============//
	override get type(): EntityType {
		return EntityType.SHOCKWAVE_LASER_BASE;
	}

	//============Instance Functions============//
	override onProjectileTick(): void {
		// Charging
		if (this._life >= LIFE) {
			this.summonDrones();
			// Remove
			this._host.entitySystem.removeProjectile(this);
		}
		else {
			this._life++;
			this.scaleX = this.scaleY = 1 - this._life / LIFE;
			this.alpha = 0.5 + (this._life / LIFE) / 2;
		}
	}

	override drawShape(): void {
		shape.graphics.beginFill(this.ownerColor);
		shape.graphics.drawRect(-BLOCK_RADIUS, -BLOCK_RADIUS, BLOCK_RADIUS * 2, BLOCK_RADIUS * 2);
		shape.graphics.drawRect(-BLOCK_RADIUS / 2, -BLOCK_RADIUS / 2, BLOCK_RADIUS, BLOCK_RADIUS);
		shape.graphics.endFill();
	}

	public summonDrones(): void {
		// Summon Drone
		switch (this.mode) {
			case 1:
				var i: int = exMath.random1();
				for (var u: int = 0; u < 4; u++)
					this.summonDrone(u, u + i);
				break;
			default:
				this.summonDrone(GlobalRot.rotateInt(this.rot, 1));
				this.summonDrone(GlobalRot.rotateInt(this.rot, -1));
		}
	}

	public summonDrone(rot: int, toolRot: int = int.MIN_VALUE): void {
		var drone: ShockWaveDrone = new ShockWaveDrone(this.host, this.entityX, this.entityY, this.owner, this._tool, toolRot == int.MIN_VALUE ? this.rot : GlobalRot.lockIntToStandard(toolRot), this._toolChargePercent);
		drone.rot = GlobalRot.lockIntToStandard(rot);
		this.host.entitySystem.registerProjectile(drone);
		this.host.projectileContainer.addChild(drone);
	}
}