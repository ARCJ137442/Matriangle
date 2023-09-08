package batr.game.stat {

	import batr.game.main.*;
	import batr.game.model.*;
	import batr.game.entity.entity.player.*;

	/**
	 * This's a stats(or scoreboard) use for a game
	 * @author ARCJ137442
	 */
	export default class GameStats {
		//============Static Functions============//

		//============Instance Variables============//
		protected _rule: GameRule;
		protected _players: PlayerStats[] = new PlayerStats[]();

		protected _mapTransformCount: uint = 0;
		protected _bonusGenerateCount: uint = 0;

		//============Constructor============//
		public constructor(rule: GameRule, players: Player[] = null) {
			super();
			this.rule = rule;
			if (players != null)
				this.loadPlayers(players);
		}

		// Unfinished
		public clone(): GameStats {
			return new GameStats(this._rule).setPlayers(this._players);
		}

		//============Destructor============//
		public destructor(): void {
			this.rule = null;
			this.clearPlayers();
			this._players = null;
		}

		//============Instance Getter And Setter============//
		public get rule(): GameRule {
			return this._rule;
		}

		public set rule(value: GameRule) {
			this._rule = value;
		}

		public get players(): PlayerStats[] {
			return this._players;
		}

		public get mapTransformCount(): uint {
			return this._mapTransformCount;
		}

		public set mapTransformCount(value: uint) {
			this._mapTransformCount = value;
		}

		public get bonusGenerateCount(): uint {
			return this._bonusGenerateCount;
		}

		public set bonusGenerateCount(value: uint) {
			this._bonusGenerateCount = value;
		}

		//============Instance Functions============//
		public addPlayer(player: Player): GameStats {
			this._players.push(player.stats);
			return this;
		}

		public setPlayers(players: PlayerStats[]): GameStats {
			this._players = players;
			return this;
		}

		public loadPlayers(players: Player[]): void {
			for (var player of players)
				this.addPlayer(player);
		}

		public clearPlayers(): void {
			this._players.splice(0, int.MAX_VALUE);
		}

		public importPlayersFromGame(game: Game): void {
			for (var player of game.entitySystem.players) {
				if (player != null)
					this._players.push(player.stats);
			}
		}
	}
}