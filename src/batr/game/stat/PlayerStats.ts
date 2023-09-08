package batr.game.stat {

	import batr.common.*;
	import batr.game.entity.entity.player.*;
	import batr.game.entity.model.*;

	import flash.utils.Dictionary;

	/* Thst's a stats(or scoreboard) use for a player
	 * */
	export default class PlayerStats {
		//============Instance Variables============//
		// Profile
		protected _profile: IPlayerProfile = null;

		// kills and deaths
		protected _killCount: uint = 0;
		protected _killAICount: uint = 0;
		protected _deathCount: uint = 0;
		protected _deathByPlayer: uint = 0;
		protected _deathByAI: uint = 0;
		protected _killPlayers: Stat_PlayerCount = new Stat_PlayerCount();
		protected _deathByPlayers: Stat_PlayerCount = new Stat_PlayerCount();
		protected _causeDamage: uint = 0;

		protected _damageBy: uint = 0;

		protected _causeDamagePlayers: Stat_PlayerCount = new Stat_PlayerCount();

		protected _damageByPlayers: Stat_PlayerCount = new Stat_PlayerCount();

		protected _suicideCount: uint = 0;

		protected _killAllyCount: uint = 0;

		protected _deathByAllyCount: uint = 0;

		protected _causeDamageOnSelf: uint = 0;

		protected _causeDamageOnAlly: uint = 0;

		protected _damageByAlly: uint = 0;

		// weapons

		// bonus boxes
		protected _pickupBonusBoxCount: uint = 0;

		// misc
		protected _beTeleportCount: uint = 0;

		//============Constructor============//
		public PlayerStats(owner: Player): void {
			this._profile = owner as IPlayerProfile;
		}

		//============Destructor============//
		public destructor(): void {
			this._profile = null;
			this._killPlayers.destructor();
			this._deathByPlayers.destructor();
			this._causeDamagePlayers.destructor();
			this._damageByPlayers.destructor();
		}

		//============Instance Getter And Setter============//
		public get profile(): IPlayerProfile {
			return this._profile;
		}

		public get killCount(): uint {
			return this._killCount;
		}

		public set killCount(value: uint): void {
			this._killCount = value;
		}

		public get killAICount(): uint {
			return this._killAICount;
		}

		public set killAICount(value: uint): void {
			this._killAICount = value;
		}

		public get deathCount(): uint {
			return this._deathCount;
		}

		public set deathCount(value: uint): void {
			this._deathCount = value;
		}

		public get deathByPlayer(): uint {
			return this._deathByPlayer;
		}

		public set deathByPlayer(value: uint): void {
			this._deathByPlayer = value;
		}

		public get deathByAI(): uint {
			return this._deathByAI;
		}

		public set deathByAI(value: uint): void {
			this._deathByAI = value;
		}

		public get causeDamage(): uint {
			return this._causeDamage;
		}

		public set causeDamage(value: uint): void {
			this._causeDamage = value;
		}

		public get damageBy(): uint {
			return this._damageBy;
		}

		public set damageBy(value: uint): void {
			this._damageBy = value;
		}

		public get suicideCount(): uint {
			return this._suicideCount;
		}

		public set suicideCount(value: uint): void {
			this._suicideCount = value;
		}

		public get killAllyCount(): uint {
			return this._killAllyCount;
		}

		public set killAllyCount(value: uint): void {
			this._killAllyCount = value;
		}

		public get deathByAllyCount(): uint {
			return this._deathByAllyCount;
		}

		public set deathByAllyCount(value: uint): void {
			this._deathByAllyCount = value;
		}

		public get causeDamageOnSelf(): uint {
			return this._causeDamageOnSelf;
		}

		public set causeDamageOnSelf(value: uint): void {
			this._causeDamageOnSelf = value;
		}

		public get causeDamageOnAlly(): uint {
			return this._causeDamageOnAlly;
		}

		public set causeDamageOnAlly(value: uint): void {
			this._causeDamageOnAlly = value;
		}

		public get damageByAlly(): uint {
			return this._damageByAlly;
		}

		public set damageByAlly(value: uint): void {
			this._damageByAlly = value;
		}

		public get pickupBonusBoxCount(): uint {
			return this._pickupBonusBoxCount;
		}

		public set pickupBonusBoxCount(value: uint): void {
			this._pickupBonusBoxCount = value;
		}

		public get beTeleportCount(): uint {
			return this._beTeleportCount;
		}

		public set beTeleportCount(value: uint): void {
			this._beTeleportCount = value;
		}

		// Game Score about Playing
		public get totalScore(): uint {
			return exMath.intMax(
				this.profile.level * 50 + this.profile.experience * 5 +
				this.killAllyCount - this.suicideCount,
				0) + exMath.intMax(this.pickupBonusBoxCount * 10 + this.killCount * 2 - this.deathCount, 0) * 50 + exMath.intMax(this.causeDamage - this.damageBy, 0);
		}

		//============Instance Functions============//
		// About Profile

		/**
		 * If profile is player,then convert it to PlayeProfile.
		 * @return	this
		 */
		public flushProfile(): PlayerStats {
			if (this._profile is Player)
			this._profile = new PlayerProfile(this._profile);
			return this;
		}

		public redirectPlayer(player: Player): PlayerStats {
			this._profile = player;
			return this;
		}

		// Kill And Death By
		public getKillPlayerCount(player: Player): uint {
			return this._killPlayers.getPlayerValue(player);
		}

		public getDeathByPlayerCount(player: Player): uint {
			return this._deathByPlayers.getPlayerValue(player);
		}

		public setKillPlayerCount(player: Player, value: uint): void {
			this._killPlayers.setPlayerValue(player, value);
		}

		public setDeathByPlayerCount(player: Player, value: uint): void {
			this._deathByPlayers.setPlayerValue(player, value);
		}

		public addKillPlayerCount(player: Player, value: uint = 1): void {
			this._killPlayers.setPlayerValue(player, getKillPlayerCount(player) + value);
		}

		public addDeathByPlayerCount(player: Player, value: uint = 1): void {
			this._deathByPlayers.setPlayerValue(player, getDeathByPlayerCount(player) + value);
		}
		// Cause Damage And Damage By
		public getCauseDamagePlayerCount(player: Player): uint {
			return this._causeDamagePlayers.getPlayerValue(player);
		}

		public getDamageByPlayerCount(player: Player): uint {
			return this._damageByPlayers.getPlayerValue(player);
		}

		public setCauseDamagePlayerCount(player: Player, value: uint): void {
			this._causeDamagePlayers.setPlayerValue(player, value);
		}

		public setDamageByPlayerCount(player: Player, value: uint): void {
			this._damageByPlayers.setPlayerValue(player, value);
		}

		public addCauseDamagePlayerCount(player: Player, value: uint = 1): void {
			this._causeDamagePlayers.setPlayerValue(player, getCauseDamagePlayerCount(player) + value);
		}

		public addDamageByPlayerCount(player: Player, value: uint = 1): void {
			this._damageByPlayers.setPlayerValue(player, getDamageByPlayerCount(player) + value);
		}
	}
}

import batr.game.entity.entity.player.*;

import flash.utils.Dictionary;

class Stat_PlayerCount {
	//============Instance Variables============//
	protected _dictionary: Dictionary = new Dictionary(true);

	//============Constructor Function============//
	public Stat_PlayerCount(...params): void {
		setPlayerValues2(params);
	}

	//============Instance Functions============//
	public getPlayerValue(player: Player): uint {
		if (player == null)
			return 0;

		return uint(this._dictionary[player]);
	}

	public setPlayerValue(player: Player, value: uint): void {
		if (player == null)
			return;

		this._dictionary[player] = value;
	}

	public setPlayerValues(...params): void {
		setPlayerValues2(params);
	}

	public setPlayerValues2(params: Array): void {
		var player: Player, count: uint;

		for (var i: uint = 0; i < params.length - 1; i += 2) {
			player = params[i] as Player;

			count = uint(params[i + 1]);

			setPlayerValue(player, count);
		}
	}

	public resetPlayerValue(player: Player): void {
		if (player == null)
			return;

		this._dictionary[player] = 0;
	}

	public destructor(): void {
		for (var p in this._dictionary) {
			delete this._dictionary[p];
		}
		this._dictionary = null;
	}
}