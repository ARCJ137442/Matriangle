
// import batr.game.entity.ai.*;
// import batr.game.entity.entity.*;
// import batr.game.entity.entity.player.*;

import { uint } from "../../../../../legacy/AS3Legacy";
import BonusBox from "../item/BonusBox";
import AIPlayer from "../player/AIPlayer";
import Player from "../player/Player";

/**
 * Running as a Agent:Perception->Decision->Behavior
 */
export default interface IAIProgram {
	// Destructor
	destructor(): void;
	// AI Variables
	get label(): string;
	get labelShort(): string;
	get referenceSpeed(): uint;
	// AI Methods
	requestActionOnTick(player: AIPlayer): AIPlayerAction;
	requestActionOnCauseDamage(player: AIPlayer, damage: uint, victim: Player): AIPlayerAction;
	requestActionOnHurt(player: AIPlayer, damage: uint, attacker: Player): AIPlayerAction;
	requestActionOnKill(player: AIPlayer, damage: uint, victim: Player): AIPlayerAction;
	requestActionOnDeath(player: AIPlayer, damage: uint, attacker: Player): AIPlayerAction;
	requestActionOnRespawn(player: AIPlayer): AIPlayerAction;

	requestActionOnMapTransform(player: AIPlayer): AIPlayerAction;

	requestActionOnPickupBonusBox(player: AIPlayer, box: BonusBox): AIPlayerAction;
}