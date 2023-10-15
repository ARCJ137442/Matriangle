import { uint, int, uint$MAX_VALUE } from '../../../../../legacy/AS3Legacy'
import { Shape } from '../../../../../legacy/flash/display'
import { FIXED_TPS } from '../../../../../server/main/GlobalWorldVariables'
import PlayerBatr from '../../../../../server/mods/batr/entity/player/PlayerBatr'
import IPlayer from '../../../../../server/mods/native/entities/player/IPlayer'

export default class PlayerEffectOverlay extends Shape {
	//============Static Variables============//
	public static readonly COLOR: uint = 0xff0000
	public static readonly LIFE: uint = FIXED_TPS * 0.25

	//============Instance Variables============//
	protected _life: int = -1
	protected _lifeMax: uint = 0

	protected _color: uint = COLOR

	//============Constructor & Destructor============//
	public constructor(
		owner: IPlayer | null,
		color: uint = PlayerEffectOverlay.COLOR
	) {
		super()
		this.drawShape(
			owner instanceof AIPlayer
				? (owner as AIPlayer).decorationLabel
				: null
		)
		this.dealLife()
	}

	//============Instance Getter And Setter============//
	public get life(): uint {
		return this._life
	}

	//============Instance Functions============//
	protected drawShape(decorationLabel: string = null): void {
		let realRadiusX: number = PlayerBatr.SIZE / 2 // -LINE_SIZE
		let realRadiusY: number = PlayerBatr.SIZE / 2
		shape.graphics.clear()
		// graphics.lineStyle(LINE_SIZE,this._lineColor);
		shape.graphics.beginFill(this._color)
		shape.graphics.moveTo(-realRadiusX, -realRadiusY)
		shape.graphics.lineTo(realRadiusX, 0)
		shape.graphics.lineTo(-realRadiusX, realRadiusY)
		shape.graphics.lineTo(-realRadiusX, -realRadiusY)
		if (decorationLabel !== null)
			AIPlayer.drawAIDecoration(shape.graphics, decorationLabel)
		shape.graphics.endFill()
	}

	public playAnimation(
		life: uint = LIFE,
		color: uint = uint$MAX_VALUE
	): void {
		color = color == uint$MAX_VALUE ? this._color : color
		if (this._color != color) {
			this._color = color
			this.shapeInit(shape)
		}
		if (life > _lifeMax) {
			this._lifeMax = life
		}
		this._life = life
	}

	public dealLife(): void {
		if (_life > 0) this._life--
		else {
			this._life = -1
			this._lifeMax = 0
			this.alpha = 0
			return
		}
		this.alpha = _life / _lifeMax
	}

	public destructor(): void {
		shape.graphics.clear()
		this._life = -1
		this._lifeMax = 0
	}
}
