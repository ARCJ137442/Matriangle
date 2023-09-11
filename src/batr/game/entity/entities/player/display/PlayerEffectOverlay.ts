
// import batr.general.*;

import { uint, int, uint$MAX_VALUE } from "../../../../../legacy/AS3Legacy";
import AIPlayer from "../AIPlayer";
import Player from "../Player";

// import batr.game.entity.entity.player.*;

// import flash.display.Shape;

export default class PlayerEffectOverlay extends Shape {
	//============Static Variables============//
	public static readonly COLOR: uint = 0xff0000;
	public static readonly LIFE: uint = GlobalGameVariables.FIXED_TPS * 0.25;

	//============Instance Variables============//
	protected _life: int = -1;
	protected _lifeMax: uint = 0;

	protected _color: uint = COLOR;

	//============Constructor & Destructor============//
	public constructor(owner: Player | null, color: uint = PlayerEffectOverlay.COLOR) {
		super();
		this.drawShape(owner is AIPlayer ? (owner as AIPlayer).AILabel : null);
		this.dealLife();
	}

	//============Instance Getter And Setter============//
	public get life(): uint {
		return this._life;
	}

	//============Instance Functions============//
	protected drawShape(AILabel: string = null): void {
		let realRadiusX: number = Player.SIZE / 2; // -LINE_SIZE
		let realRadiusY: number = Player.SIZE / 2;
		shape.graphics.clear();
		// graphics.lineStyle(LINE_SIZE,this._lineColor);
		shape.graphics.beginFill(this._color);
		shape.graphics.moveTo(-realRadiusX, -realRadiusY);
		shape.graphics.lineTo(realRadiusX, 0);
		shape.graphics.lineTo(-realRadiusX, realRadiusY);
		shape.graphics.lineTo(-realRadiusX, -realRadiusY);
		if (AILabel != null)
			AIPlayer.drawAIDecoration(shape.graphics, AILabel);
		shape.graphics.endFill();
	}

	public playAnimation(life: uint = LIFE, color: uint = uint$MAX_VALUE): void {
		color = color == uint$MAX_VALUE ? this._color : color;
		if (this._color != color) {
			this._color = color;
			this.drawShape();
		}
		if (life > _lifeMax) {
			this._lifeMax = life;
		}
		this._life = life;
	}

	public dealLife(): void {
		if (_life > 0)
			this._life--;
		else {
			this._life = -1;
			this._lifeMax = 0;
			this.alpha = 0;
			return;
		}
		this.alpha = _life / _lifeMax;
	}

	public destructor(): void {
		shape.graphics.clear();
		this._life = -1;
		this._lifeMax = 0;
	}
}