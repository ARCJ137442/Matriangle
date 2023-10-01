import { uint } from "../../../../legacy/AS3Legacy";
import IPlayer from "../entities/player/IPlayer";
import IPlayerProfile from "../entities/player/profile/IPlayerProfile";

/**
 * 玩家统计信息
 */
export default class PlayerStats {
	//============Instance Variables============//
	// 档案：仅记录信息 //
	protected _profile: IPlayerProfile | null;

	/** 重定向玩家 */
	public redirectPlayer(player: IPlayer): PlayerStats {
		this._profile = player;
		return this;
	}

	// 击杀/死亡 //
	/** 玩家击杀数 */
	public killCount: uint = 0;
	// public killAICount: uint = 0;

	/** 死亡次数 */
	public deathCount: uint = 0;
	/** 因玩家死亡次数 */
	public deathByPlayer: uint = 0;
	// public deathByAI: uint = 0;

	/** 击杀之玩家 */
	public killPlayers: Stat_PlayerCount = new Stat_PlayerCount();
	/** 死亡因玩家 */
	public deathByPlayers: Stat_PlayerCount = new Stat_PlayerCount();

	public getKillPlayerCount(player: IPlayer): uint { return this.killPlayers.getPlayerValue(player); }
	public setKillPlayerCount(player: IPlayer, value: uint): void {
		this.killPlayers.setPlayerValue(player, value);
	}
	public addKillPlayerCount(player: IPlayer, value: uint = 1): void {
		this.killPlayers.setPlayerValue(player, this.getKillPlayerCount(player) + value);
	}

	public getDeathByPlayerCount(player: IPlayer): uint { return this.deathByPlayers.getPlayerValue(player); }
	public setDeathByPlayerCount(player: IPlayer, value: uint): void {
		this.deathByPlayers.setPlayerValue(player, value);
	}
	public addDeathByPlayerCount(player: IPlayer, value: uint = 1): void {
		this.deathByPlayers.setPlayerValue(player, this.getDeathByPlayerCount(player) + value);
	}

	// 伤害 //
	/** 造成伤害 */
	public causeDamage: uint = 0;
	/** 受到伤害 */
	public damageBy: uint = 0;

	/** 对玩家造成伤害 */
	public causeDamagePlayers: Stat_PlayerCount = new Stat_PlayerCount();
	public getCauseDamagePlayerCount(player: IPlayer): uint { return this.causeDamagePlayers.getPlayerValue(player); }
	public setCauseDamagePlayerCount(player: IPlayer, value: uint): void {
		this.causeDamagePlayers.setPlayerValue(player, value);
	}
	public addCauseDamagePlayerCount(player: IPlayer, value: uint = 1): void {
		this.causeDamagePlayers.setPlayerValue(player, this.getCauseDamagePlayerCount(player) + value);
	}
	/** 受到玩家之伤害 */
	public damageByPlayers: Stat_PlayerCount = new Stat_PlayerCount();
	public getDamageByPlayerCount(player: IPlayer): uint { return this.damageByPlayers.getPlayerValue(player); }
	public setDamageByPlayerCount(player: IPlayer, value: uint): void {
		this.damageByPlayers.setPlayerValue(player, value);
	}
	public addDamageByPlayerCount(player: IPlayer, value: uint = 1): void {
		this.damageByPlayers.setPlayerValue(player, this.getDamageByPlayerCount(player) + value);
	}

	/** 击杀自己⇒击杀 */
	public suicideCount: uint = 0;
	/** 击杀友方次数 */
	public killAllyCount: uint = 0;
	/** 被友方击杀次数 */
	public deathByAllyCount: uint = 0;

	/** 自我伤害 */
	public causeDamageOnSelf: uint = 0;
	/** 造成友方伤害 */
	public causeDamageOnAlly: uint = 0;
	/** 受到友方伤害 */
	public damageByAlly: uint = 0;

	// tools
	/** 🆕工具使用次数 */
	public toolUses: uint = 0;

	// bonus boxes
	/** 奖励箱拾取次数 */
	public pickupBonusBoxCount: uint = 0;

	// misc
	/** 被传送次数 */
	public beTeleportCount: uint = 0;

	//============Constructor============//
	public constructor(owner: IPlayer) {
		this._profile = owner as IPlayerProfile;
	}

	public destructor(): void {
		this._profile = null;
		this.killPlayers.destructor();
		this.deathByPlayers.destructor();
		this.causeDamagePlayers.destructor();
		this.damageByPlayers.destructor();
	}

	public get profile(): IPlayerProfile | null {
		return this._profile;
	}

	// !【2023-10-01 15:28:03】现在「计算玩家总分」的函数迁移至「原生游戏机制」的`computeTotalPlayerScore`中

}

/**
 * 内部类：用于统计「玩家: 数量」的信息
 * * 例如：击杀玩家XXX多少次
 * 
 * !【2023-10-01 14:29:06】现在直接继承Map
 */
class Stat_PlayerCount extends Map<IPlayer | null, uint> {
	//============Constructor & Destructor============//
	/**
	 * 析构函数：清空自身
	 */
	public destructor(): void {
		this.clear();
	}

	//============Instance Functions============//
	/**
	 * 从玩家获取值
	 * @param player 获取的玩家
	 * @returns 这个玩家对应的值
	 */
	public getPlayerValue(player: IPlayer | null): uint {
		return uint(this.get(player));
	}

	/**
	 * 从玩家设置值
	 * @param player 获取的玩家
	 * @param value 设置的值
	 * @returns 自身
	 */
	public setPlayerValue(player: IPlayer | null, value: uint): Stat_PlayerCount {
		this.set(player, value);
		return this;
	}

	public resetPlayerValue(player: IPlayer): Stat_PlayerCount {
		this.set(player, 0);
		return this;
	}
}
