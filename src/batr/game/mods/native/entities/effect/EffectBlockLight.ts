
// import batr.common.*;
// import batr.general.*;

import { uint, uint$MAX_VALUE } from "../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../display/api/GlobalDisplayVariables";
import Block from "../../../../api/block/Block";
import Game from "../../main/Game.1";
import EffectType from "../../registry/EffectRegistry";
import EntityEffect from "../../../../api/entity/EntityEffect";

// import batr.game.block.*;
// import batr.game.effect.*;
// import batr.game.main.*;

export default class EffectBlockLight extends EntityEffect {
	//============Static Variables============//
	public static readonly SIZE: number = DEFAULT_SIZE;
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 25;
	public static readonly MAX_LIFE: uint = GlobalGameVariables.TPS * 0.4;
	public static readonly MAX_SCALE: number = 2;
	public static readonly MIN_SCALE: number = 1;

	//============Static Functions============//
	public static fromBlock(host: IBatrGame, x: number, y: number, block: Block, reverse: boolean = false): EffectBlockLight {
		return new EffectBlockLight(host, x, y, block.pixelColor, block.pixelAlpha, reverse);
	}

	//============Instance Variables============//
	protected _color: uint = 0x000000;

	/** The uint percent. */
	protected _alpha: uint;
	public reverse: boolean = false;

	//============Constructor & Destructor============//
	public constructor(host: IBatrGame, x: number, y: number, color: uint = 0xffffff, alpha: uint = uint$MAX_VALUE, reverse: boolean = false, life: uint = EffectBlockLight.MAX_LIFE) {
		super(host, x, y, life);
		this._color = color;
		this._alpha = alpha;
		this.reverse = reverse;
		this.drawShape();
	}

	//============Destructor Function============//

	//============Instance Getter And Setter============//
	override get type(): EffectType {
		return EffectType.BLOCK_LIGHT;
	}

	public get color(): uint {
		return this._color;
	}

	public set color(value: uint) {
		this._color = value;
		this.drawShape();
	}

	//============Instance Functions============//
	override onEffectTick(): void {
		this.alpha = (this.reverse ? (1 - life / LIFE) : (life / LIFE));
		this.scaleX = this.scaleY = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * (1 - this.alpha);
		dealLife();
	}

	override drawShape(): void {
		let realRadiusX: number = SIZE / 2;
		let realRadiusY: number = SIZE / 2;
		graphics.clear();
		graphics.beginFill(this._color, Utils.uintToPercent(this._alpha));
		graphics.drawRect(-realRadiusX, -realRadiusY, SIZE, SIZE);
		graphics.drawRect(LINE_SIZE - realRadiusX, LINE_SIZE - realRadiusY, SIZE - LINE_SIZE * 2, SIZE - LINE_SIZE * 2);
		graphics.endFill();
	}
}
