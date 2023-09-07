package batr.game.entity.ai.programs {

	import batr.game.entity.ai.*;
	import batr.game.entity.entity.*;
	import batr.game.entity.entity.player.*;

	/**
	 * Running as a Agent:Perception->Decision->Behavior
	 */
	public interface IAIProgram {
		// Destructor
		function destructor(): void;
	// AI Variables
	function get label(): string;
	function get labelShort(): string;
	function get referenceSpeed(): uint;
	// AI Methods
	function requestActionOnTick(player: AIPlayer): AIPlayerAction;
	function requestActionOnCauseDamage(player: AIPlayer, damage: uint, victim: Player): AIPlayerAction;
	function requestActionOnHurt(player: AIPlayer, damage: uint, attacker: Player): AIPlayerAction;
	function requestActionOnKill(player: AIPlayer, damage: uint, victim: Player): AIPlayerAction;
	function requestActionOnDeath(player: AIPlayer, damage: uint, attacker: Player): AIPlayerAction;
	function requestActionOnRespawn(player: AIPlayer): AIPlayerAction;

	function requestActionOnMapTransfrom(player: AIPlayer): AIPlayerAction;

	function requestActionOnPickupBonusBox(player: AIPlayer, box: BonusBox): AIPlayerAction;
}
}