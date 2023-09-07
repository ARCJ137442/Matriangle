package batr.translations {

	import batr.common.*;
	import batr.general.*;

	import batr.game.block.*;
	import batr.game.entity.*;
	import batr.game.entity.ai.*;
	import batr.game.effect.*;
	import batr.game.model.*;
	import batr.game.map.*;
	import batr.game.main.*;
	import batr.game.events.*;

	import batr.menu.events.*;
	import batr.menu.object.*;
	import batr.menu.object.selector.*;

	import batr.main.*;
	import batr.fonts.*;
	import batr.i18n.*;

	export default class I18nKey {
		//============Static Variables============//
		//====Keys====//
		public static const NULL: string = '';

		// batr.language
		public static const LANGUAGE_SELF: string = 'batr.language.self';

		// batr.code
		public static const INFINITY: string = 'batr.code.infinity';
		public static const TRUE: string = 'batr.code.true';
		public static const FALSE: string = 'batr.code.false';

		// batr.boolean
		public static const BOOLEAN_YES: string = 'batr.boolean.yes';
		public static const BOOLEAN_NO: string = 'batr.boolean.no';

		// batr.menu
		public static const LANGUAGE: string = 'batr.menu.language';
		public static const QUICK_GAME: string = 'batr.menu.quickGame';
		public static const SELECT_GAME: string = 'batr.menu.selectGame';
		public static const CUSTOM_MODE: string = 'batr.menu.customMode';
		public static const START: string = 'batr.menu.start';
		public static const ADVANCED: string = 'batr.menu.advanced';
		public static const ADVANCED_CONFIG: string = 'batr.menu.advancedConfig';
		public static const SAVES: string = 'batr.menu.saves';
		public static const BACK: string = 'batr.menu.back';
		public static const CONTINUE: string = 'batr.menu.continue';
		public static const MAIN_MENU: string = 'batr.menu.mainMenu';
		public static const GLOBAL_STAT: string = 'batr.menu.globalStat';
		public static const SCORE_RANKING: string = 'batr.menu.scoreRanking';
		public static const PAUSED: string = 'batr.menu.paused';
		public static const RESTART: string = 'batr.menu.restart';

		// batr.select
		public static const PLAYER_COUNT: string = 'batr.select.playerCount';
		public static const AI_PLAYER_COUNT: string = 'batr.select.AIPlayerCount';
		public static const GAME_MODE: string = 'batr.select.gameMode';
		public static const INITIAL_MAP: string = 'batr.select.initialMap';
		public static const LOCK_TEAMS: string = 'batr.select.lockTeam';

		// batr.custom
		public static const DEFAULT_WEAPON: string = 'batr.custom.defaultWeapon';
		public static const DEFAULT_HEALTH: string = 'batr.custom.defaultHealth';
		public static const DEFAULT_MAX_HEALTH: string = 'batr.custom.defaultMaxHealth';
		public static const REMAIN_LIFES_PLAYER: string = 'batr.custom.remainLifesPlayer';
		public static const REMAIN_LIFES_AI: string = 'batr.custom.remainLifesAI';
		public static const MAX_BONUS_COUNT: string = 'batr.custom.maxBonusCount';
		public static const BONUS_SPAWN_AFTER_DEATH: string = 'batr.custom.bonusSpawnAfterPlayerDeath';
		public static const MAP_TRANSFORM_TIME: string = 'batr.custom.mapTransformTime';
		public static const WEAPONS_NO_CD: string = 'batr.custom.weaponsNoCD';
		public static const RESPAWN_TIME: string = 'batr.custom.respawnTime';
		public static const ASPHYXIA_DAMAGE: string = 'batr.custom.asphyxiaDamage';

		// batr.game
		public static const GAME_RESULT: string = 'batr.game.gameResult';
		public static const NOTHING_WIN: string = 'batr.game.nothingWin';
		public static const WIN_SINGLE_PLAYER: string = 'batr.game.winSinglePlayer';
		public static const WIN_MULTI_PLAYER: string = 'batr.game.winMultiPlayer';
		public static const WIN_PER_PLAYER: string = 'batr.game.winPerPlayer';
		public static const WIN_ALL_PLAYER: string = 'batr.game.winAllPlayer';
		public static const FILL_FRAME_ON: string = 'batr.game.fillFrameOn';
		public static const FILL_FRAME_OFF: string = 'batr.game.fillFrameOff';

		// batr.game.map
		public static const MAP_RANDOM: string = 'batr.game.map.random';

		// batr.game.key
		public static const REMAIN_TRANSFORM_TIME: string = 'batr.game.key.mapTransformTime';
		public static const GAME_DURATION: string = 'batr.game.key.gameDuration';

		// batr.stat
		public static const TRANSFORM_MAP_COUNT: string = 'batr.stat.transformMapCount';
		public static const BONUS_GENERATE_COUNT: string = 'batr.stat.bonusGenerateCount';

		// batr.stat.player
		public static const FINAL_LEVEL: string = 'batr.stat.player.finalLevel';
		public static const KILL_COUNT: string = 'batr.stat.player.killCount';
		public static const DEATH_COUNT: string = 'batr.stat.player.deathCount';
		public static const DEATH_COUNT_FROM_PLAYER: string = 'batr.stat.player.deathByPlayerCount';
		public static const DAMAGE_CAUSE: string = 'batr.stat.player.causeDamage';
		public static const DAMAGE_BY: string = 'batr.stat.player.damageBy';
		public static const PICKUP_BONUS: string = 'batr.stat.player.pickupBonus';
		public static const BE_TELEPORT_COUNT: string = 'batr.stat.player.beTeleport';
		public static const TOTAL_SCORE: string = 'batr.stat.player.totalScore';

		// batr.custom.property
		public static const CERTAINLY_DEAD: string = 'batr.custom.property.certainlyDead';
		public static const COMPLETELY_RANDOM: string = 'batr.custom.property.completelyRandom';
		public static const UNIFORM_RANDOM: string = 'batr.custom.property.uniformRandom';
		public static const NEVER: string = 'batr.custom.property.never';

		//============Constructor Function============//
		public I18nKey() {
			throw new Error('Cannot construct this class!');
		}

		//============Static Getter And Setter===========//

		//============Static Functions===========//
		//========Common========//
		protected static function getCommonKey(label: string, name: string, suffix: string): string {
			return ('batr.' + label + '.' + name + '.' + suffix);
		}

		//========Block========//
		public static function getTypeNameKey(type: TypeCommon): string {
			return I18nKey.getCommonKey(type.label, type.name, 'name');
		}

		public static function getTypeDescriptionKey(type: TypeCommon): string {
			return I18nKey.getCommonKey(type.label, type.name, 'description');
		}

		/**
		 * Returns a translational key(String) that can use for native text display.
		 * @param	type	a type extends TypeCommon.
		 * @param	isDescription	The boolean determines name/description.
		 * @return	A string based on the type.
		 */
		public static function getTypeKey(type: TypeCommon, isDescription: boolean): string {
			return (isDescription ? getTypeDescriptionKey : getTypeNameKey)(type);
		}
	}
}