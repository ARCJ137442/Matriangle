

import { uint, int } from "../../../../../legacy/AS3Legacy";
import { IBatrShape, IBatrShapeContainer } from "../../../../../display/api/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../../../display/api/GlobalDisplayVariables";
import Entity from "../../../../api/entity/Entity";
import Player from "../player/Player";
import { IEntityDisplayableContainer, IEntityInGrid } from "../../../../api/entity/EntityInterfaces";
import { iPoint, intPoint } from "../../../../../common/geometricTools";
import BonusBoxSymbol from "../../../../../display/mods/native/entity/BonusBoxSymbol";
import EntityType from "../../../../api/entity/EntityType";
import BonusType from "../../registry/BonusRegistry";
import { randInt } from "../../../../../common/exMath";
import IBatrGame from './../../../../main/IBatrGame';

/**
 * 「奖励箱」是
 * * 处于网格内的
 * * 以容器形式的
 * * 根据特定的「奖励类型」显示图形的
 * * 用于在游戏机制中被玩家拾取的
 * 实体
 */
export default class BonusBox extends Entity implements IEntityInGrid, IEntityDisplayableContainer {
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
	public constructor(position: iPoint, type: BonusType = BonusType.NULL) {
		super();
		this._bonusType = type;
		this._symbol = new BonusBoxSymbol(this._bonusType);
	}
	i_InGrid: true;
	get position(): intPoint {
		throw new Error("Method not implemented.");
	}
	set position(value: intPoint) {
		throw new Error("Method not implemented.");
	}
	i_displayableContainer: true;
	shapeRefresh(shape: IBatrShapeContainer): void {
		throw new Error("Method not implemented.");
	}
	shapeDestruct(shape: IBatrShapeContainer): void {
		throw new Error("Method not implemented.");
	}
	i_displayable: true;
	get zIndex(): number {
		throw new Error("Method not implemented.");
	}
	set zIndex(value: number) {
		throw new Error("Method not implemented.");
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
		this._symbol.shapeInit(shape: IBatrShape);
	}

	protected get borderSpace(): number {
		return (DEFAULT_SIZE - BonusBox.BOX_SIZE) / 2;
	}

	protected get boxRadius(): number {
		return BonusBox.BOX_SIZE / 2;
	}

	//============Instance Functions============//
	public shapeInit(shape: IBatrShapeContainer, symbol: IBatrShape): void {
		// 绘制盒子
		this.drawBox(shape);
		// 初始化符号
		this._symbol.type = this._bonusType;
		this._symbol.shapeInit(shape);
		symbol.x = symbol.y = DEFAULT_SIZE / 2; // 将「符号」置于中心
		shape.addChild(symbol); // 添加子元素
	}
	protected drawBox(shape: IBatrShape): void {
		// Define
		// let radius:Number=DEFAULT_SIZE/2;
		// Line
		shape.graphics.beginFill(BonusBox.LINE_COLOR);
		shape.graphics.drawRoundRect(this.borderSpace, this.borderSpace, BonusBox.BOX_SIZE, BonusBox.BOX_SIZE, BonusBox.BOX_ELLIPSE_SIZE, BonusBox.BOX_ELLIPSE_SIZE);
		shape.graphics.endFill();
		// Fill
		shape.graphics.beginFill(BonusBox.FILL_COLOR);
		shape.graphics.drawRoundRect(this.borderSpace + BonusBox.LINE_SIZE, this.borderSpace + BonusBox.LINE_SIZE, BonusBox.BOX_SIZE - 2 * BonusBox.LINE_SIZE, BonusBox.BOX_SIZE - 2 * BonusBox.LINE_SIZE, BonusBox.BOX_ELLIPSE_SIZE, BonusBox.BOX_ELLIPSE_SIZE);
		shape.graphics.endFill();
	}

	/**
	 * 当玩家「得到奖励」所用的逻辑
	 * 
	 * TODO: 似乎应该提取到「游戏逻辑」中，而非放到实体这里
	 * 
	 * @param host 调用的游戏主体
	 * @param player 奖励箱将作用到的玩家
	 * @param forcedBonusType 要强制应用的类型（若非空则强制应用此类型的奖励）
	 */
	public onPlayerPickup(host: IBatrGame, player: Player, forcedBonusType: BonusType = this._bonusType): void {
		if (player == null)
			return;
		// Deactivate
		this.isActive = false;
		// Effect
		let buffColor: int = -1;
		switch (forcedBonusType) {
			// Health,Heal&Life
			case BonusType.ADD_HEALTH:
				player.addHealth(5 * (1 + randInt(10)));
				break;
			case BonusType.ADD_HEAL:
				player.heal += 5 * (1 + randInt(25));
				break;
			case BonusType.ADD_LIFE:
				if (player.infinityLife || player.isFullHealth)
					player.maxHealth += host.rule.bonusMaxHealthAdditionAmount;
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
				player.buffDamage += host.rule.bonusBuffAdditionAmount;
				buffColor = BonusBoxSymbol.BUFF_DAMAGE_COLOR;

				break;
			case BonusType.BUFF_CD:
				player.buffCD += host.rule.bonusBuffAdditionAmount;
				buffColor = BonusBoxSymbol.BUFF_CD_COLOR;

				break;
			case BonusType.BUFF_RESISTANCE:
				player.buffResistance += host.rule.bonusBuffAdditionAmount;
				buffColor = BonusBoxSymbol.BUFF_RESISTANCE_COLOR;

				break;
			case BonusType.BUFF_RADIUS:
				player.buffRadius += host.rule.bonusBuffAdditionAmount;
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
			host.addPlayerLevelupEffect(player.entityX + 0.5, player.entityY + 0.5, buffColor, 0.75);
		// Stats Operations
		player.stats.pickupBonusBoxCount++;
		// Remove
		this._host.entitySystem.removeBonusBox(this);
	}
}
