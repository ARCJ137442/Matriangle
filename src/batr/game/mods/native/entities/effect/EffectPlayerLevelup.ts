
// import batr.common.*;
// import batr.general.*;

import { uint } from "../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../display/api/GlobalDisplayVariables";
import Game from "../../main/Game.1";
import EffectType from "../../registry/EffectRegistry";
import EntityEffect from "../../../../api/entity/EntityEffect";

// import batr.game.effect.*;
// import batr.game.main.*;

export default class EffectPlayerLevelup extends EntityEffect {
	//============Static Variables============//
	public static readonly DEFAULT_COLOR: uint = 0x000000;
	public static readonly LINE_ALPHA: number = 0.8;
	public static readonly FILL_ALPHA: number = 0.75;
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 25;
	public static readonly GRID_SIZE: number = DEFAULT_SIZE / 5;

	//============Instance Variables============//

	//============Constructor & Destructor============//
	public constructor(host: IBatrGame, x: number, y: number,
		color: uint = DEFAULT_COLOR,
		scale: number = 1): void {
		super(host, x, y, GlobalGameVariables.TPS / 2);
		this.scaleX = this.scaleY = scale;
		this.drawArrow(color);
	}

	//============Destructor Function============//

	//============Instance Getter And Setter============//
	override get type(): EffectType {
		return EffectType.PLAYER_LEVELUP;
	}

	//============Instance Functions============//
	override onEffectTick(): void {
		this.alpha = this.life / LIFE;
		dealLife();
		this.y -= GRID_SIZE / 4 * (1 - this.life / LIFE);
	}

	override drawShape(): void {
		shape.graphics.clear();
		this.drawArrow(DEFAULT_COLOR);
	}

	protected drawArrow(color: uint): void {
		// Colored Arrow
		shape.graphics.lineStyle(LINE_SIZE, color, LINE_ALPHA);
		shape.graphics.beginFill(color, FILL_ALPHA);
		shape.graphics.moveTo(0, -GRID_SIZE * 1.5); // T1
		shape.graphics.lineTo(GRID_SIZE * 1.5, 0); // T2
		shape.graphics.lineTo(GRID_SIZE / 2, 0); // B1
		shape.graphics.lineTo(GRID_SIZE / 2, GRID_SIZE * 1.5); // B2
		shape.graphics.lineTo(-GRID_SIZE / 2, GRID_SIZE * 1.5); // B3
		shape.graphics.lineTo(-GRID_SIZE / 2, 0); // B4
		shape.graphics.lineTo(-GRID_SIZE * 1.5, 0); // T3
		shape.graphics.lineTo(0, -GRID_SIZE * 1.5); // T1
		shape.graphics.endFill();
	}
}