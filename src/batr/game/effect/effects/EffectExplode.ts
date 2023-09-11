
// import batr.common.*;
// import batr.general.*;

import { uint, uint$MAX_VALUE } from "../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../display/GlobalDisplayVariables";
import Game from "../../main/Game.1";
import EffectType from "../../registry/EffectRegistry";
import EffectCommon from "../EffectCommon";

// import batr.game.effect.*;
// import batr.game.main.*;

export default class EffectExplode extends EffectCommon {
	//============Static Variables============//
	public static readonly DEFAULT_COLOR: uint = 0xffdd00;
	public static readonly LINE_ALPHA: uint = 5 * (uint$MAX_VALUE >> 3); // 5/8
	public static readonly FILL_ALPHA: uint = (uint$MAX_VALUE / 5) << 1; // 2/5
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 25;

	//============Instance Variables============//
	protected _radius: number = 1; // Entity Pos
	protected _color: uint;

	//============Constructor & Destructor============//
	public constructor(host: IBatrGame, x: number, y: number, radius: number = 1,
		color: uint = DEFAULT_COLOR): void {
		super(host, x, y, GlobalGameVariables.TPS * 0.25);
		this._color = color;
		this._radius = radius;
		this.drawShape();
	}

	//============Destructor Function============//
	override destructor(): void {
		this._radius = 0;
		this._color = 0;
		super.destructor();
	}

	//============Instance Getter And Setter============//
	override get type(): EffectType {
		return EffectType.EXPLODE;
	}

	public get radius(): number {
		return this._radius;
	}

	public set radius(value: number) {
		this._radius = value;
		this.drawShape();
	}

	//============Instance Functions============//
	override onEffectTick(): void {
		this.alpha = life / LIFE;
		dealLife();
	}

	override drawShape(): void {
		shape.graphics.clear();
		shape.graphics.lineStyle(LINE_SIZE, this._color, Utils.uintToPercent(LINE_ALPHA));
		shape.graphics.beginFill(this._color, Utils.uintToPercent(FILL_ALPHA));
		shape.graphics.drawCircle(0, 0, PosTransform.localPosToRealPos(this._radius));
		shape.graphics.endFill();
	}
}