
// import batr.general.*;

import { uint } from "../../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../api/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../api/GlobalDisplayVariables";
import EffectTeleport from "../../../../game/mods/native/entities/effect/EffectTeleport";
import BonusType from "../../../../registry/BonusRegistry";
import PlayerGUI from "./player/PlayerGUI";

// import batr.game.main.*;
// import batr.game.effect.effects.*;
// import batr.game.model.*;

// import flash.display.Shape;

export default class BonusBoxSymbol extends Shape {
	//============Static Variables============//
	// General
	public static readonly GRID_SIZE: number = DEFAULT_SIZE / 5;

	// HHL
	public static readonly HEALTH_COLOR: uint = PlayerGUI.HEALTH_COLOR;

	// Tool
	public static readonly TOOL_COLOR: uint = 0x555555;
	public static readonly TOOL_LINE_SIZE: uint = 4;

	// Attributes
	public static readonly ATTRIBUTES_LINE_SIZE: uint = 4;
	public static readonly ATTRIBUTES_FILL_ALPHA: number = 3 / 4;

	public static readonly EXPERIENCE_COLOR: uint = 0xcc88ff;

	public static readonly BUFF_RANDOM_COLOR: uint = 0x7f7f7f;
	public static readonly BUFF_DAMAGE_COLOR: uint = 0xff6666;

	public static readonly BUFF_CD_COLOR: uint = 0x6666ff;

	public static readonly BUFF_RESISTANCE_COLOR: uint = 0x66ff66;

	public static readonly BUFF_RADIUS_COLOR: uint = 0xffff66;

	// Team
	public static readonly TEAM_LINE_SIZE: uint = 4;

	public static readonly RANDOM_CHANGE_TEAM_LINE_COLOR: uint = 0x555555;

	public static readonly UNITE_PLAYER_LINE_COLOR: uint = 0x6666ff;

	public static readonly UNITE_AI_LINE_COLOR: uint = 0x66ff66;

	//============Static Functions============//

	//============Instance Variables============//
	protected _type: BonusType;

	//============Constructor & Destructor============//
	public constructor(type: BonusType = BonusType.NULL) {
		super();
		this.drawShape();
	}

	//============Destructor Function============//
	public destructor(): void {
		this._type = null;
		shape.graphics.clear();
	}

	//============Instance Getters And Setters============//
	public get type(): BonusType {
		return this._type;
	}

	public set type(value: BonusType) {
		if (this._type == value)
			return;
		this._type = value;
		this.drawShape();
	}

	//============Instance Functions============//
	//========Symbol Shape========//
	public shapeInit(shape: IBatrShape): void {
		shape.graphics.clear();
		switch (this._type) {
			case BonusType.NULL:
				return;
			// HHL(Health,Heal&Life)
			case BonusType.ADD_HEALTH:
				this.drawHealthSymbol();
				break;
			case BonusType.ADD_HEAL:
				this.drawHealSymbol();
				break;
			case BonusType.ADD_LIFE:
				this.drawLifeSymbol();
				break;
			// Tool
			case BonusType.RANDOM_TOOL:
				this.drawToolSymbol();
				break;
			// Attributes
			case BonusType.BUFF_RANDOM:
				this.drawAttributesSymbol(BUFF_RANDOM_COLOR);
				break;
			case BonusType.BUFF_DAMAGE:
				this.drawAttributesSymbol(BUFF_DAMAGE_COLOR);
				break;
			case BonusType.BUFF_CD:
				this.drawAttributesSymbol(BUFF_CD_COLOR);
				break;
			case BonusType.BUFF_RESISTANCE:
				this.drawAttributesSymbol(BUFF_RESISTANCE_COLOR);
				break;
			case BonusType.BUFF_RADIUS:
				this.drawAttributesSymbol(BUFF_RADIUS_COLOR);
				break;
			case BonusType.ADD_EXPERIENCE:
				this.drawAttributesSymbol(EXPERIENCE_COLOR);
				break;
			// Team
			case BonusType.RANDOM_CHANGE_TEAM:
				this.drawTeamSymbol(RANDOM_CHANGE_TEAM_LINE_COLOR);
				break;
			case BonusType.UNITE_PLAYER:
				this.drawTeamSymbol(UNITE_PLAYER_LINE_COLOR);
				break;
			case BonusType.UNITE_AI:
				this.drawTeamSymbol(UNITE_AI_LINE_COLOR);
				break;
			// Other
			case BonusType.RANDOM_TELEPORT:
				this.drawRandomTeleportSymbol();
				break;
		}
	}

	//====HHL====//
	protected drawHealthSymbol(): void {
		// V
		shape.graphics.beginFill(HEALTH_COLOR);
		shape.graphics.drawRect(-GRID_SIZE / 2, -GRID_SIZE * 1.5, GRID_SIZE, GRID_SIZE * 3);
		shape.graphics.endFill();
		// H
		shape.graphics.beginFill(HEALTH_COLOR);
		shape.graphics.drawRect(-GRID_SIZE * 1.5, -GRID_SIZE / 2, GRID_SIZE * 3, GRID_SIZE);
		shape.graphics.endFill();
	}

	protected drawHealSymbol(): void {
		// V
		shape.graphics.beginFill(HEALTH_COLOR);
		shape.graphics.drawRect(-GRID_SIZE / 2, -GRID_SIZE * 1.5, GRID_SIZE, GRID_SIZE * 3);
		// H
		shape.graphics.drawRect(-GRID_SIZE * 1.5, -GRID_SIZE / 2, GRID_SIZE * 3, GRID_SIZE);
		shape.graphics.endFill();
	}

	protected drawLifeSymbol(): void {
		// L
		shape.graphics.beginFill(HEALTH_COLOR);
		shape.graphics.drawRect(-GRID_SIZE * 1.5, -GRID_SIZE * 1.5, GRID_SIZE, GRID_SIZE * 2);
		shape.graphics.endFill();
		shape.graphics.beginFill(HEALTH_COLOR);
		shape.graphics.drawRect(-GRID_SIZE * 1.5, GRID_SIZE / 2, GRID_SIZE * 3, GRID_SIZE);
		shape.graphics.endFill();
	}

	//====Tool====//
	protected drawToolSymbol(): void {
		// Circle
		shape.graphics.lineStyle(TOOL_LINE_SIZE, TOOL_COLOR);
		shape.graphics.drawCircle(0, 0, GRID_SIZE);
	}

	//====Attributes====//
	protected drawAttributesSymbol(color: uint): void {
		// Colored Rectangle
		/*shape.graphics.lineStyle(ATTRIBUTES_LINE_SIZE,color);
		shape.graphics.beginFill(color,ATTRIBUTES_FILL_ALPHA);
		shape.graphics.drawRect(-GRID_SIZE*7/8,-GRID_SIZE*7/8,GRID_SIZE*7/4,GRID_SIZE*7/4);
		shape.graphics.endFill();*/
		// Colored Arrow
		// Top
		shape.graphics.lineStyle(ATTRIBUTES_LINE_SIZE, color);
		shape.graphics.beginFill(color, ATTRIBUTES_FILL_ALPHA);
		shape.graphics.moveTo(0, -GRID_SIZE * 1.5); // T1
		shape.graphics.lineTo(GRID_SIZE * 1.5, 0); // T2
		shape.graphics.lineTo(GRID_SIZE / 2, 0);
		// B1
		shape.graphics.lineTo(GRID_SIZE / 2, GRID_SIZE * 1.5);
		// B2
		shape.graphics.lineTo(-GRID_SIZE / 2, GRID_SIZE * 1.5);
		// B3
		shape.graphics.lineTo(-GRID_SIZE / 2, 0);
		// B4
		shape.graphics.lineTo(-GRID_SIZE * 1.5, 0); // T3
		shape.graphics.lineTo(0, -GRID_SIZE * 1.5); // T1
		shape.graphics.endFill();
		// Bottom
	}

	//====Team====//
	protected drawTeamSymbol(color: uint): void {
		shape.graphics.lineStyle(TEAM_LINE_SIZE, color);
		graphics.moveTo(-GRID_SIZE, -GRID_SIZE);
		graphics.lineTo(GRID_SIZE, 0);
		graphics.lineTo(-GRID_SIZE, GRID_SIZE);
		graphics.lineTo(-GRID_SIZE, -GRID_SIZE);
	}

	//====Other====//
	protected drawRandomTeleportSymbol(): void {
		// Teleport Effect
		// 1
		shape.graphics.lineStyle(EffectTeleport.LINE_SIZE, EffectTeleport.DEFAULT_COLOR, EffectTeleport.LINE_ALPHA);
		shape.graphics.beginFill(EffectTeleport.DEFAULT_COLOR, EffectTeleport.FILL_ALPHA);
		shape.graphics.drawRect(-GRID_SIZE, -GRID_SIZE, GRID_SIZE * 2, GRID_SIZE * 2);
		shape.graphics.endFill();
		// 2
		shape.graphics.lineStyle(EffectTeleport.LINE_SIZE, EffectTeleport.DEFAULT_COLOR, EffectTeleport.LINE_ALPHA);
		shape.graphics.beginFill(EffectTeleport.DEFAULT_COLOR, EffectTeleport.FILL_ALPHA);
		graphics.moveTo(0, -GRID_SIZE * Math.SQRT2);
		graphics.lineTo(GRID_SIZE * Math.SQRT2, 0);
		graphics.lineTo(0, GRID_SIZE * Math.SQRT2);
		graphics.lineTo(-GRID_SIZE * Math.SQRT2, 0);
		graphics.lineTo(0, -GRID_SIZE * Math.SQRT2);
		shape.graphics.endFill();
	}
}