
// import batr.common.*;
// import batr.general.*;

import { uint, int } from "../../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../../display/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../../display/GlobalRenderVariables";
import Game from "../../../main/Game.1";
import BonusType from "../../../registry/BonusRegistry";
import EntityType from "../../../registry/EntityRegistry";
import ToolType from "../../../registry/ToolType";
import EntityCommon from "../../EntityCommon";
import Player from "../player/Player";
import BonusBoxSymbol from "./display/BonusBoxSymbol.1";

// import batr.game.entity.*;
// import batr.game.entity.object.*;
// import batr.game.entity.entity.player.*;
// import batr.game.model.*;
// import batr.game.main.*;

export default class BonusBox extends EntityCommon {
	//============Static Variables============//
	public static readonly LINE_COLOR: uint = 0x777777;
	public static readonly FILL_COLOR: uint = 0xdddddd;

	public static readonly BOX_SIZE: number = DEFAULT_SIZE * 0.8;
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 20;
	public static readonly BOX_ELLIPSE_SIZE: number = DEFAULT_SIZE / 16;

	//============Static Functions============//

	//============Instance Variables============//
	protected _bonusType: BonusType;

	protected _symbol: BonusBoxSymbol;

	//============Constructor & Destructor============//
	public constructor(host: Game, x: int, y: int, type: BonusType = BonusType.NULL) {
		super(host, x, y);
		this._bonusType = type;
		this._symbol = new BonusBoxSymbol(this._bonusType);
		this._symbol.x = this._symbol.y = DEFAULT_SIZE / 2;
		this.addChild(this._symbol);
		this.drawShape();
	}

	//============Destructor Function============//
	override destructor(): void {
		this._bonusType = null;
		this._symbol.destructor();
		this.removeChild(this._symbol);
		super.destructor();
	}

	//============Instance Getters And Setters============//
	override get type(): EntityType {
		return EntityType.BONUS_BOX;
	}

	public get bonusType(): BonusType {
		return this._bonusType;
	}

	public set bonusType(value: BonusType) {
		this._bonusType = value;
		this._symbol.drawShape();
	}

	protected get borderSpace(): number {
		return (DEFAULT_SIZE - BOX_SIZE) / 2;
	}

	protected get boxRadius(): number {
		return BOX_SIZE / 2;
	}

	//============Instance Functions============//
	public shapeInit(shape: IBatrShape): void {
		// Define
		// let radius:Number=DEFAULT_SIZE/2;
		// Line
		shape.graphics.beginFill(LINE_COLOR);
		shape.graphics.drawRoundRect(borderSpace, borderSpace, BOX_SIZE, BOX_SIZE, BOX_ELLIPSE_SIZE, BOX_ELLIPSE_SIZE);
		shape.graphics.endFill();
		// Fill
		shape.graphics.beginFill(FILL_COLOR);
		shape.graphics.drawRoundRect(borderSpace + LINE_SIZE, borderSpace + LINE_SIZE, BOX_SIZE - 2 * LINE_SIZE, BOX_SIZE - 2 * LINE_SIZE, BOX_ELLIPSE_SIZE, BOX_ELLIPSE_SIZE);
		shape.graphics.endFill();
		// Symbol
		this._symbol.type = this._bonusType;
	}

	public onPlayerPickup(player: Player, forcedBonusType: BonusType = null): void {
		if (player == null)
			return;
		// Deactivate
		this.isActive = false;
		// Effect
		let buffColor: int = -1;
		let type: BonusType = forcedBonusType == null ? this._bonusType : forcedBonusType;
		switch (type) {
			// Health,Heal&Life
			case BonusType.ADD_HEALTH:
				player.addHealth(5 * (1 + exMath.random(10)));
				break;
			case BonusType.ADD_HEAL:
				player.heal += 5 * (1 + exMath.random(25));
				break;
			case BonusType.ADD_LIFE:
				if (player.infinityLife || player.isFullHealth)
					player.maxHealth += this.host.rule.bonusMaxHealthAdditionAmount;
				else
					player.lives++;
				break;
			// Tool
			case BonusType.RANDOM_TOOL:
				player.tool = ToolType.getRandomAvailableWithout(player.tool);
				break;
			// Attributes
			case BonusType.BUFF_RANDOM:
				this.onPlayerPickup(player, BonusType.RANDOM_BUFF);
				return;
			case BonusType.BUFF_DAMAGE:
				player.buffDamage += this.host.rule.bonusBuffAdditionAmount;
				buffColor = BonusBoxSymbol.BUFF_DAMAGE_COLOR;

				break;
			case BonusType.BUFF_CD:
				player.buffCD += this.host.rule.bonusBuffAdditionAmount;
				buffColor = BonusBoxSymbol.BUFF_CD_COLOR;

				break;
			case BonusType.BUFF_RESISTANCE:
				player.buffResistance += this.host.rule.bonusBuffAdditionAmount;
				buffColor = BonusBoxSymbol.BUFF_RESISTANCE_COLOR;

				break;
			case BonusType.BUFF_RADIUS:
				player.buffRadius += this.host.rule.bonusBuffAdditionAmount;
				buffColor = BonusBoxSymbol.BUFF_RADIUS_COLOR;

				break;
			case BonusType.ADD_EXPERIENCE:
				player.experience += ((player.level >> 2) + 1) << 2;
				buffColor = BonusBoxSymbol.EXPERIENCE_COLOR;

				break;
			// Team
			case BonusType.RANDOM_CHANGE_TEAM:
				this._host.randomizePlayerTeam(player);
				break;
			case BonusType.UNITE_AI:
				this._host.setATeamToAIPlayer();
				break;
			case BonusType.UNITE_PLAYER:
				this._host.setATeamToNotAIPlayer();
				break;
			// Other
			case BonusType.RANDOM_TELEPORT:
				this._host.spreadPlayer(player, false, true);
				break;
		}
		if (buffColor >= 0)
			this.host.addPlayerLevelupEffect(player.entityX + 0.5, player.entityY + 0.5, buffColor, 0.75);
		// Stats Operations
		player.stats.pickupBonusBoxCount++;
		// Remove
		this._host.entitySystem.removeBonusBox(this);
	}
}
