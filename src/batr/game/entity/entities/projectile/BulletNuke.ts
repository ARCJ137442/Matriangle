
// import batr.general.*;

// import batr.game.entity.*;
// import batr.game.entity.entity.player.*;
// import batr.game.entity.entity.projectile.*;
// import batr.game.model.*;
// import batr.game.main.*;

// import flash.display.*;
// import flash.geom.*;

export default class BulletNuke extends BulletBasic {
	//============Static Variables============//
	public static readonly SIZE: number = PosTransform.localPosToRealPos(1 / 2);
	public static readonly DEFAULT_SPEED: number = 12 / GlobalGameVariables.FIXED_TPS;
	public static readonly DEFAULT_EXPLODE_COLOR: uint = 0xffcc00;
	public static readonly DEFAULT_EXPLODE_RADIUS: number = 6.4;

	//============Constructor & Destructor============//
	public constructor(host: Game, x: number, y: number, owner: Player, chargePercent: number) {
		var scalePercent: number = (0.25 + chargePercent * 0.75);
		super(host, x, y, owner, DEFAULT_SPEED * (2 - scalePercent), DEFAULT_EXPLODE_RADIUS * (2 * scalePercent));
		this._currentTool = ToolType.NUKE;
		this.damage = this._currentTool.defaultDamage * scalePercent;
		this.drawShape();
	}

	//============Destructor Function============//
	override destructor(): void {
		shape.graphics.clear();
		super.destructor();
	}

	//============Instance Getter And Setter============//
	override get type(): EntityType {
		return EntityType.BULLET_NUKE;
	}

	//============Instance Functions============//
	override explode(): void {
		this._host.toolCreateExplode(this.entityX, this.entityY, this.finalExplodeRadius, this.damage, this, DEFAULT_EXPLODE_COLOR, 0.5);
		this._host.entitySystem.removeProjectile(this);
	}

	//====Graphics Functions====//
	override drawShape(): void {
		super.drawShape();
		this.drawNukeSign();
		this.scaleX = this.scaleY = BulletNuke.SIZE / BulletBasic.SIZE;
	}

	protected drawNukeSign(): void {
		graphics.beginFill(this.ownerLineColor);
		graphics.drawCircle(0, 0, BulletBasic.SIZE * 0.125);
		graphics.endFill();
	}
}