

import TypeCommon from "../../../game/api/template/TypeCommon";

export default class I18nKey {
	//============Static Variables============//
	//====Keys====//
	public static readonly NULL: string = '';

	// batr.language
	public static readonly LANGUAGE_SELF: string = 'batr.language.self';

	// batr.code
	public static readonly INFINITY: string = 'batr.code.infinity';
	public static readonly TRUE: string = 'batr.code.true';
	public static readonly FALSE: string = 'batr.code.false';

	// batr.boolean
	public static readonly BOOLEAN_YES: string = 'batr.boolean.yes';
	public static readonly BOOLEAN_NO: string = 'batr.boolean.no';

	// batr.menu
	public static readonly LANGUAGE: string = 'batr.menu.language';
	public static readonly QUICK_GAME: string = 'batr.menu.quickGame';
	public static readonly SELECT_GAME: string = 'batr.menu.selectGame';
	public static readonly CUSTOM_MODE: string = 'batr.menu.customMode';
	public static readonly START: string = 'batr.menu.start';
	public static readonly ADVANCED: string = 'batr.menu.advanced';
	public static readonly ADVANCED_CONFIG: string = 'batr.menu.advancedConfig';
	public static readonly SAVES: string = 'batr.menu.saves';
	public static readonly BACK: string = 'batr.menu.back';
	public static readonly CONTINUE: string = 'batr.menu.continue';
	public static readonly MAIN_MENU: string = 'batr.menu.mainMenu';
	public static readonly GLOBAL_STAT: string = 'batr.menu.globalStat';
	public static readonly SCORE_RANKING: string = 'batr.menu.scoreRanking';
	public static readonly PAUSED: string = 'batr.menu.paused';
	public static readonly RESTART: string = 'batr.menu.restart';

	// batr.select
	public static readonly PLAYER_COUNT: string = 'batr.select.playerCount';
	public static readonly AI_PLAYER_COUNT: string = 'batr.select.AIPlayerCount';
	public static readonly GAME_MODE: string = 'batr.select.gameMode';
	public static readonly INITIAL_MAP: string = 'batr.select.initialMap';
	public static readonly LOCK_TEAMS: string = 'batr.select.lockTeam';

	// batr.custom
	public static readonly DEFAULT_TOOL: string = 'batr.custom.defaultTool';
	public static readonly DEFAULT_HP: string = 'batr.custom.defaultHP';
	public static readonly DEFAULT_MAX_HP: string = 'batr.custom.defaultMaxHP';
	public static readonly REMAIN_LIVES_PLAYER: string = 'batr.custom.remainLivesPlayer';
	public static readonly REMAIN_LIVES_AI: string = 'batr.custom.remainLivesAI';
	public static readonly MAX_BONUS_COUNT: string = 'batr.custom.maxBonusCount';
	public static readonly BONUS_SPAWN_AFTER_DEATH: string = 'batr.custom.bonusSpawnAfterPlayerDeath';
	public static readonly MAP_TRANSFORM_TIME: string = 'batr.custom.mapTransformTime';
	public static readonly TOOLS_NO_CD: string = 'batr.custom.toolsNoCD';
	public static readonly RESPAWN_TIME: string = 'batr.custom.respawnTime';
	public static readonly ASPHYXIA_DAMAGE: string = 'batr.custom.asphyxiaDamage';

	// batr.game
	public static readonly GAME_RESULT: string = 'batr.game.gameResult';
	public static readonly NOTHING_WIN: string = 'batr.game.nothingWin';
	public static readonly WIN_SINGLE_PLAYER: string = 'batr.game.winSinglePlayer';
	public static readonly WIN_MULTI_PLAYER: string = 'batr.game.winMultiPlayer';
	public static readonly WIN_PER_PLAYER: string = 'batr.game.winPerPlayer';
	public static readonly WIN_ALL_PLAYER: string = 'batr.game.winAllPlayer';
	public static readonly FILL_FRAME_ON: string = 'batr.game.fillFrameOn';
	public static readonly FILL_FRAME_OFF: string = 'batr.game.fillFrameOff';

	// batr.game.map
	public static readonly MAP_RANDOM: string = 'batr.game.map.random';

	// batr.game.key
	public static readonly REMAIN_TRANSFORM_TIME: string = 'batr.game.key.mapTransformTime';
	public static readonly GAME_DURATION: string = 'batr.game.key.gameDuration';

	// batr.stat
	public static readonly TRANSFORM_MAP_COUNT: string = 'batr.stat.transformMapCount';
	public static readonly BONUS_GENERATE_COUNT: string = 'batr.stat.bonusGenerateCount';

	// batr.stat.player
	public static readonly FINAL_LEVEL: string = 'batr.stat.player.finalLevel';
	public static readonly KILL_COUNT: string = 'batr.stat.player.killCount';
	public static readonly DEATH_COUNT: string = 'batr.stat.player.deathCount';
	public static readonly DEATH_COUNT_FROM_PLAYER: string = 'batr.stat.player.deathByPlayerCount';
	public static readonly DAMAGE_CAUSE: string = 'batr.stat.player.causeDamage';
	public static readonly DAMAGE_BY: string = 'batr.stat.player.damageBy';
	public static readonly PICKUP_BONUS: string = 'batr.stat.player.pickupBonus';
	public static readonly BE_TELEPORT_COUNT: string = 'batr.stat.player.beTeleport';
	public static readonly TOTAL_SCORE: string = 'batr.stat.player.totalScore';

	// batr.custom.property
	public static readonly CERTAINLY_DEAD: string = 'batr.custom.property.certainlyDead';
	public static readonly COMPLETELY_RANDOM: string = 'batr.custom.property.completelyRandom';
	public static readonly UNIFORM_RANDOM: string = 'batr.custom.property.uniformRandom';
	public static readonly NEVER: string = 'batr.custom.property.never';

	//============Constructor & Destructor============//
	public constructor() {
		throw new Error('Cannot construct this class!');
	}

	//============Static Getter And Setter===========//

	//============Static Functions===========//
	//========Common========//
	protected static getCommonKey(label: string, name: string, suffix: string): string {
		return ('batr.' + label + '.' + name + '.' + suffix);
	}

	//========Block========//
	public static getTypeNameKey(type: TypeCommon): string {
		return I18nKey.getCommonKey(type.label, type.name, 'name');
	}

	public static getTypeDescriptionKey(type: TypeCommon): string {
		return I18nKey.getCommonKey(type.label, type.name, 'description');
	}

	/**
	 * Returns a translational key(String) that can use for native text display.
	 * @param	type	a type extends TypeCommon.
	 * @param	isDescription	The boolean determines name/description.
	 * @return	A string based on the type.
	 */
	public static getTypeKey(type: TypeCommon, isDescription: boolean): string {
		return (isDescription ? I18nKey.getTypeDescriptionKey : I18nKey.getTypeNameKey)(type);
	}
}