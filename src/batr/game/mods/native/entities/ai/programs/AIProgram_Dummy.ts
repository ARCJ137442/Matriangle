
// import batr.common.*;
// import batr.general.*;
// import batr.game.entity.ai.*;
// import batr.game.entity.entity.*;
// import batr.game.entity.entity.player.*;

import { randInt } from "../../../../../../common/exMath";
import { randomRot as randomRot } from "../../../../../api/general/GlobalRot";
import { uint } from "../../../../../../legacy/AS3Legacy";
import BonusBox from "../../item/BonusBox";
import AIPlayer from "../../player/AIPlayer";
import Player from "../../player/Player";
import IAIProgram from "../IAIProgram";

/**
 * Random move and Always Press Use.
 */
export default class AIProgram_Dummy implements IAIProgram {
	//============Static Variables============//
	public static readonly LABEL: string = 'Dummy';
	public static readonly LABEL_SHORT: string = 'D';

	//============Instance Variables============//
	protected _moveSum: uint;
	protected _moveMaxSum: uint = 4 + randInt(16);
	protected _tempRot: uint;

	//============Constructor & Destructor============//
	public constructor() {
	}

	//============Destructor Function============//
	public destructor(): void {
		this._moveSum = 0;
		this._moveMaxSum = 0;
		this._tempRot = 0;
	}

	/*====INTERFACE batr.Game.AI.IAIPlayerAI====*/
	/*========AI Getter And Setter========*/
	public get label(): string {
		return AIProgram_Dummy.LABEL;
	}

	public get labelShort(): string {
		return AIProgram_Dummy.LABEL_SHORT;
	}

	public get referenceSpeed(): uint {
		return 5 + exMath.random(6) * exMath.random(6);
	}

	/*========AI Program Main========*/
	public requestActionOnTick(player: AIPlayer): AIPlayerAction {
		if (player == null)
			return AIPlayerAction.NULL;
		// Press Use
		if (player.toolReverseCharge) {
			if (player.chargingPercent >= 1)
				return AIPlayerAction.PRESS_KEY_USE;
			else if (player.isPress_Use)
				return AIPlayerAction.RELEASE_KEY_USE;
		}
		else if (!player.isPress_Use)
			return AIPlayerAction.PRESS_KEY_USE;
		// Act
		if (this._moveSum >= this._moveMaxSum ||
			!player.host.testPlayerCanPassToFront(player)) {
			this._moveSum = 0;
			let i: uint = 0;
			do {
				this._tempRot = randomRot();
				i++;
			}
			while (i <= 8 && !player.host.testPlayerCanPassToFront(player, this._tempRot, true));
			player.addActionToThread(AIPlayerAction.DISABLE_CHARGE);

			return AIPlayerAction.getTurnActionFromEntityRot(this._tempRot);
		}
		this._moveSum++;

		return AIPlayerAction.MOVE_FORWARD;

		return AIPlayerAction.NULL;
	}

	public requestActionOnCauseDamage(player: AIPlayer, damage: uint, victim: Player): AIPlayerAction {
		return AIPlayerAction.NULL;
	}

	public requestActionOnHurt(player: AIPlayer, damage: uint, attacker: Player): AIPlayerAction {
		return AIPlayerAction.NULL;
	}

	public requestActionOnKill(player: AIPlayer, damage: uint, victim: Player): AIPlayerAction {
		return AIPlayerAction.NULL;
	}

	public requestActionOnDeath(player: AIPlayer, damage: uint, attacker: Player): AIPlayerAction {
		return AIPlayerAction.NULL;
	}

	public requestActionOnRespawn(player: AIPlayer): AIPlayerAction {
		return AIPlayerAction.NULL;
	}

	public requestActionOnMapTransform(player: AIPlayer): AIPlayerAction {
		return AIPlayerAction.NULL;
	}

	public requestActionOnPickupBonusBox(player: AIPlayer, box: BonusBox): AIPlayerAction {
		return AIPlayerAction.NULL;
	}
}