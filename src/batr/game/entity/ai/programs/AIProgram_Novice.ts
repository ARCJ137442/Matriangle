
// import batr.common.*;
// import batr.general.*;

import { uint, int } from "../../../../legacy/AS3Legacy";
import BonusBox from "../../entities/item/BonusBox";
import AIPlayer from "../../entities/player/AIPlayer";
import Player from "../../entities/player/Player";
import IAIProgram from "../IAIProgram";

// import batr.game.entity.ai.*;
// import batr.game.entity.entity.*;
// import batr.game.entity.entity.player.*;

/**
 * Running as a State Machine.
 */
export default class AIProgram_Novice implements IAIProgram {
	//============Static Variables============//
	public static readonly LABEL: string = 'Novice';
	public static readonly LABEL_SHORT: string = 'N';

	//============Static Functions============//
	protected static getLineEnemyPlayer(owner: AIPlayer): Player {
		if (owner == null)
			return null;
		var mapPlayers: Player[] = owner.host.getInMapPlayers();
		for (var player of mapPlayers) {
			if (player == owner)
				continue;
			if (player.gridX == owner.gridX || player.gridY == owner.gridY) {
				if (owner.canUseToolHurtPlayer(player, owner.tool))
					return player;
			}
		}
		return null;
	}

	protected static getLineBonusBox(owner: AIPlayer): BonusBox {
		if (owner == null)
			return null;
		var boxes: BonusBox[] = owner.host.allAvailableBonusBox;
		for (var box of boxes) {
			if (box == null)
				continue;
			if (box.gridX == owner.gridX || box.gridY == owner.gridY) {
				return box;
			}
		}
		return null;
	}

	//============Instance Variables============//
	protected _moveSum: uint = 0;
	protected _moveMaxSum: uint = 8;
	protected _tempRot: uint;

	protected _waitTime: int = 0;
	protected _maxWaitTime: uint = 40;

	//============Constructor & Destructor============//
	public constructor() {
	}

	//============Destructor Function============//
	public destructor(): void {
		this._moveSum = 0;
		this._moveMaxSum = 0;
		this._tempRot = 0;
	}

	//============Instance Functions============//

	/*====INTERFACE batr.Game.AI.IAIPlayerAI====*/
	/*========AI Getter And Setter========*/
	public get label(): string {
		return AIProgram_Novice.LABEL;
	}

	public get labelShort(): string {
		return AIProgram_Novice.LABEL_SHORT;
	}

	/**
	 * Returns use for AIRunSpeed
	 */
	public get referenceSpeed(): uint {
		return 10 + exMath.random(3) * 5;
	}

	/*========AI Program Main========*/
	public requestActionOnTick(player: AIPlayer): AIPlayerAction {
		if (player == null)
			return AIPlayerAction.NULL;
		// Refresh Wait
		if (this._waitTime >= this._maxWaitTime)
			this._waitTime = -this._moveMaxSum;
		var target: Player = AIProgram_Novice.getLineEnemyPlayer(player);
		var lineBonus: BonusBox = AIProgram_Novice.getLineBonusBox(player);
		// Auto Pickup BonusBox
		if (lineBonus != null && this._waitTime >= 0 && this._waitTime < this._maxWaitTime) {
			// Turn
			player.clearActionThread();
			this._moveSum = this._moveMaxSum;
			this._tempRot = GlobalRot.fromLinearDistance(lineBonus.entityX - player.gridX, lineBonus.entityY - player.gridY);
			// Act
			this._waitTime++;
			if (player.rot != this._tempRot) {
				return AIPlayerAction.getTurnActionFromEntityRot(this._tempRot);
			}
			else
				return AIPlayerAction.MOVE_FORWARD;
		}
		// Auto Attack Target
		else if (target != null && this._waitTime >= 0 && this._waitTime < this._maxWaitTime) {
			// Turn
			player.clearActionThread();
			this._moveSum = this._moveMaxSum;
			this._tempRot = GlobalRot.fromLinearDistance(target.entityX - player.entityX, target.entityY - player.entityY);
			// Act
			if (player.rot != this._tempRot) {
				player.addActionToThread(AIPlayerAction.getTurnActionFromEntityRot(this._tempRot));
			}
			// Press Use
			if (player.toolReverseCharge) {
				if (player.chargingPercent >= 1)
					return AIPlayerAction.PRESS_KEY_USE;
				else if (player.isPress_Use)
					return AIPlayerAction.RELEASE_KEY_USE;
			}
			else if (!player.isPress_Use)
				return AIPlayerAction.PRESS_KEY_USE;
			this._waitTime++;
			return AIPlayerAction.NULL;
		}
		// Dummy Behavior(Calm)
		else {
			if (player.isPress_Use)
				return AIPlayerAction.RELEASE_KEY_USE;
			if (this._moveSum >= this._moveMaxSum ||
				!player.host.testPlayerCanPassToFront(player)) {
				this._moveSum = 0;
				var i: uint = 0;
				do {
					this._tempRot = GlobalRot.getRandom();
					i++;
				}
				while (i <= 8 && !player.host.testPlayerCanPassToFront(player, this._tempRot, true));
				return AIPlayerAction.getTurnActionFromEntityRot(this._tempRot);
			}
			this._moveSum++;
		}
		if (this._waitTime < 0)
			this._waitTime++;
		return AIPlayerAction.MOVE_FORWARD;
	}

	public requestActionOnCauseDamage(player: AIPlayer, damage: uint, victim: Player): AIPlayerAction {
		this._waitTime = 0;
		return AIPlayerAction.NULL;
	}

	public requestActionOnHurt(player: AIPlayer, damage: uint, attacker: Player): AIPlayerAction {
		// random move beside on under attack
		if (Utils.randomBoolean())
			return AIPlayerAction.MOVE_LEFT_REL;
		else
			return AIPlayerAction.MOVE_RIGHT_REL;
	}

	public requestActionOnKill(player: AIPlayer, damage: uint, victim: Player): AIPlayerAction {
		this._waitTime = 0;
		return AIPlayerAction.NULL;
	}

	public requestActionOnDeath(player: AIPlayer, damage: uint, attacker: Player): AIPlayerAction {
		this._waitTime = 0;
		return AIPlayerAction.NULL;
	}

	public requestActionOnRespawn(player: AIPlayer): AIPlayerAction {
		return AIPlayerAction.NULL;
	}

	public requestActionOnMapTransform(player: AIPlayer): AIPlayerAction {
		this._waitTime = 0;
		return AIPlayerAction.NULL;
	}

	public requestActionOnPickupBonusBox(player: AIPlayer, box: BonusBox): AIPlayerAction {
		this._waitTime = 0;
		return AIPlayerAction.NULL;
	}
}