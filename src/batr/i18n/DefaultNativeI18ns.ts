package batr.translations {

	import batr.general.*;
	import batr.game.block.*;
	import batr.game.effect.*;
	import batr.game.entity.*;
	import batr.game.model.*;

	internal class DefaultNativeI18ns {
		//============Constructor Function============//
		public function DefaultNativeI18ns(): void {
			throw new Error('Cannot construct this class!');
		}

		//============Default I18ns(Static)============//
		//========I18ns Create And Get========//
		public static function get EN_US(): I18ns {
			// EN_US._getFunction=DefaultNativeI18ns.getDefaultI18n;//=I18ns.fromStringArr2('')
			return new I18ns(
				// batr.language
				I18nKey.LANGUAGE_SELF, 'English',
				// batr.code
				I18nKey.INFINITY, 'Infinity',
				I18nKey.TRUE, 'True',
				I18nKey.FALSE, 'False',
				// batr.boolean
				I18nKey.BOOLEAN_YES, 'Yes',
				I18nKey.BOOLEAN_NO, 'No',
				// batr.menu
				I18nKey.LANGUAGE, 'Language',
				I18nKey.QUICK_GAME, 'Quick Game',
				I18nKey.SELECT_GAME, 'Select Game',
				I18nKey.CUSTOM_MODE, 'Custom Mode',
				I18nKey.START, 'Start',
				I18nKey.ADVANCED, 'Advanced',
				I18nKey.ADVANCED_CONFIG, 'Config File',
				I18nKey.SAVES, 'Saves',
				I18nKey.BACK, 'Back',
				I18nKey.CONTINUE, 'Continue',
				I18nKey.MAIN_MENU, 'Main Menu',
				I18nKey.GLOBAL_STAT, 'Global Stat',
				I18nKey.SCORE_RANKING, 'Score Ranking',
				I18nKey.PAUSED, 'Paused',
				I18nKey.RESTART, 'Restart',
				// batr.custom
				I18nKey.DEFAULT_WEAPON, 'Default Weapon',
				I18nKey.DEFAULT_HEALTH, 'Default Health',
				I18nKey.DEFAULT_MAX_HEALTH, 'Default MaxHealth',
				I18nKey.REMAIN_LIFES_PLAYER, 'Player Remain Lifes',
				I18nKey.REMAIN_LIFES_AI, 'AI Remain Lifes',
				I18nKey.MAX_BONUS_COUNT, 'Max Bonus Count',
				I18nKey.BONUS_SPAWN_AFTER_DEATH, 'Bonus Spawn After Death',
				I18nKey.MAP_TRANSFORM_TIME, 'Map Transfor Time(s)',
				I18nKey.WEAPONS_NO_CD, 'Weapons No CD',
				I18nKey.RESPAWN_TIME, 'Respawn Time(s)',
				I18nKey.ASPHYXIA_DAMAGE, 'Asphyxia Damage',
				// batr.select
				I18nKey.PLAYER_COUNT, 'Player Count',
				I18nKey.AI_PLAYER_COUNT, 'AIPlayer Count',
				I18nKey.GAME_MODE, 'Game Mode',
				I18nKey.INITIAL_MAP, 'Initial Map',
				I18nKey.LOCK_TEAMS, 'Lock Teams',
				// batr.game
				I18nKey.GAME_RESULT, 'Game Result',
				I18nKey.NOTHING_WIN, 'No player wins in the game',
				I18nKey.WIN_SINGLE_PLAYER, ' wins in the game',
				I18nKey.WIN_MULTI_PLAYER, ' win in the game',
				I18nKey.WIN_PER_PLAYER, ' players win in the game',
				I18nKey.WIN_ALL_PLAYER, 'All players win in the game',
				I18nKey.FILL_FRAME_OFF, 'Fill Frame:Off',
				I18nKey.FILL_FRAME_ON, 'Fill Frame:On',
				// batr.game.map
				I18nKey.MAP_RANDOM, 'Random',
				// batr.game.key
				I18nKey.REMAIN_TRANSFORM_TIME, 'Remain Transform Time',
				I18nKey.GAME_DURATION, 'Game Duration',
				// batr.stat
				I18nKey.TRANSFORM_MAP_COUNT, 'Map Transform Count',
				I18nKey.BONUS_GENERATE_COUNT, 'Bonus Generate Count',
				// batr.stat.player
				I18nKey.FINAL_LEVEL, 'Final Level',
				I18nKey.KILL_COUNT, 'Kill Count',
				I18nKey.DEATH_COUNT, 'Death Count',
				I18nKey.DEATH_COUNT_FROM_PLAYER, 'Death by Player Count',
				I18nKey.DAMAGE_CAUSE, 'Cause Damage',
				I18nKey.DAMAGE_BY, 'Damage By',
				I18nKey.PICKUP_BONUS, 'Ppckup Bonus',
				I18nKey.BE_TELEPORT_COUNT, 'Be Teleport Count',
				I18nKey.TOTAL_SCORE, 'Total Score',
				// batr.custom.property
				I18nKey.COMPLETELY_RANDOM, 'C-Random',
				I18nKey.UNIFORM_RANDOM, 'U-Random',
				I18nKey.CERTAINLY_DEAD, 'Certainly Dead',
				I18nKey.NEVER, 'Never',
				// GameModeTypes
				I18nKey.getTypeNameKey(GameModeType.REGULAR),
				'Regular',
				I18nKey.getTypeNameKey(GameModeType.BATTLE),
				'Battle',
				I18nKey.getTypeNameKey(GameModeType.SURVIVAL),
				'Survival',
				I18nKey.getTypeNameKey(GameModeType.HARD),
				'Hard'
			);
		}

		public static function get ZH_CN(): I18ns {
			return new I18ns(
				// batr.language
				I18nKey.LANGUAGE_SELF, '简体中文',
				// batr.code
				I18nKey.INFINITY, '无限',
				I18nKey.TRUE, '真',
				I18nKey.FALSE, '假',
				// batr.boolean
				I18nKey.BOOLEAN_YES, '是',
				I18nKey.BOOLEAN_NO, '否',
				// batr.menu
				I18nKey.LANGUAGE, '语言',
				I18nKey.QUICK_GAME, '快速游戏',
				I18nKey.SELECT_GAME, '选择游戏',
				I18nKey.CUSTOM_MODE, '自定义模式',
				I18nKey.START, '开始',
				I18nKey.ADVANCED, '高级',
				I18nKey.ADVANCED_CONFIG, '配置文件',
				I18nKey.SAVES, '存档',
				I18nKey.BACK, '返回',
				I18nKey.CONTINUE, '继续',
				I18nKey.MAIN_MENU, '主界面',
				I18nKey.GLOBAL_STAT, '全局统计',
				I18nKey.SCORE_RANKING, '总分排行',
				I18nKey.PAUSED, '已暂停',
				I18nKey.RESTART, '重新开始',
				// batr.custom
				I18nKey.DEFAULT_WEAPON, '默认武器',
				I18nKey.DEFAULT_HEALTH, '默认生命值',
				I18nKey.DEFAULT_MAX_HEALTH, '默认最大生命值',
				I18nKey.REMAIN_LIFES_PLAYER, '玩家剩余生命',
				I18nKey.REMAIN_LIFES_AI, 'AI剩余生命',
				I18nKey.MAX_BONUS_COUNT, '最大奖励箱数',
				I18nKey.BONUS_SPAWN_AFTER_DEATH, '奖励箱死后生成',
				I18nKey.MAP_TRANSFORM_TIME, '地图变换时间(s)',
				I18nKey.WEAPONS_NO_CD, '武器无冷却',
				I18nKey.RESPAWN_TIME, '重生时间(s)',
				I18nKey.ASPHYXIA_DAMAGE, '窒息伤害',
				// batr.select
				I18nKey.PLAYER_COUNT, '玩家数量',
				I18nKey.AI_PLAYER_COUNT, 'AI玩家数量',
				I18nKey.GAME_MODE, '游戏模式',
				I18nKey.INITIAL_MAP, '初始地图',
				I18nKey.LOCK_TEAMS, '锁定队伍',
				// batr.game
				I18nKey.GAME_RESULT, '游戏结果',
				I18nKey.NOTHING_WIN, '没有玩家在游戏中胜利',
				I18nKey.WIN_SINGLE_PLAYER, '在游戏中胜利',
				I18nKey.WIN_MULTI_PLAYER, '在游戏中胜利',
				I18nKey.WIN_PER_PLAYER, '个玩家在游戏中胜利',
				I18nKey.WIN_ALL_PLAYER, '所有玩家在游戏中胜利',
				I18nKey.FILL_FRAME_OFF, '补帧关闭',
				I18nKey.FILL_FRAME_ON, '补帧开启',
				// batr.game.map
				I18nKey.MAP_RANDOM, '随机',
				// batr.game.key
				I18nKey.REMAIN_TRANSFORM_TIME, '剩余变换时间',
				I18nKey.GAME_DURATION, '游戏时长',
				// batr.stat
				I18nKey.TRANSFORM_MAP_COUNT, '地图变换次数',
				I18nKey.BONUS_GENERATE_COUNT, '奖励箱生成数',
				// batr.stat.player
				I18nKey.FINAL_LEVEL, '最终等级',
				I18nKey.KILL_COUNT, '\n击杀数',
				I18nKey.DEATH_COUNT, '\n死亡数',
				I18nKey.DEATH_COUNT_FROM_PLAYER, '\n被玩家击杀数',
				I18nKey.DAMAGE_CAUSE, '\n造成伤害',
				I18nKey.DAMAGE_BY, '\n受到伤害',
				I18nKey.PICKUP_BONUS, '拾取奖励箱',
				I18nKey.BE_TELEPORT_COUNT, '被传送次数',
				I18nKey.TOTAL_SCORE, '总分',
				// batr.custom.property
				I18nKey.COMPLETELY_RANDOM, '完全随机',
				I18nKey.UNIFORM_RANDOM, '统一随机',
				I18nKey.CERTAINLY_DEAD, '必死',
				I18nKey.NEVER, '从不',
				// BlockTypes
				I18nKey.getTypeNameKey(BlockType.VOID),
				'空位',
				I18nKey.getTypeNameKey(BlockType.WALL),
				'墙',
				I18nKey.getTypeNameKey(BlockType.WATER),
				'水',
				I18nKey.getTypeNameKey(BlockType.GLASS),
				'玻璃',
				I18nKey.getTypeNameKey(BlockType.BEDROCK),
				'基岩',
				I18nKey.getTypeNameKey(BlockType.X_TRAP_HURT),
				'X陷阱-伤害',
				I18nKey.getTypeNameKey(BlockType.X_TRAP_KILL),
				'X陷阱-死亡',
				I18nKey.getTypeNameKey(BlockType.X_TRAP_ROTATE),
				'X陷阱-旋转',
				I18nKey.getTypeNameKey(BlockType.COLORED_BLOCK),
				'色块',
				I18nKey.getTypeNameKey(BlockType.COLOR_SPAWNER),
				'色块生成器',
				I18nKey.getTypeNameKey(BlockType.LASER_TRAP),
				'激光陷阱',
				I18nKey.getTypeNameKey(BlockType.METAL),
				'金属',
				// EntityTypes
				I18nKey.getTypeNameKey(EntityType.BULLET_BASIC),
				'基础子弹',
				I18nKey.getTypeNameKey(EntityType.BULLET_NUKE),
				'核弹',
				I18nKey.getTypeNameKey(EntityType.SUB_BOMBER),
				'子轰炸机',
				I18nKey.getTypeNameKey(EntityType.LASER_BASIC),
				'基础激光',
				I18nKey.getTypeNameKey(EntityType.LASER_PULSE),
				'脉冲激光',
				I18nKey.getTypeNameKey(EntityType.LASER_TELEPORT),
				'传送激光',
				I18nKey.getTypeNameKey(EntityType.LASER_ABSORPTION),
				'吸收激光',
				I18nKey.getTypeNameKey(EntityType.WAVE),
				'波浪',
				I18nKey.getTypeNameKey(EntityType.THROWN_BLOCK),
				'掷出的方块',
				I18nKey.getTypeNameKey(EntityType.BONUS_BOX),
				'奖励箱',
				I18nKey.getTypeNameKey(EntityType.PLAYER),
				'玩家',
				I18nKey.getTypeNameKey(EntityType.AI_PLAYER),
				'AI玩家',
				// EffectTypes
				I18nKey.getTypeNameKey(EffectType.EXPLODE),
				'爆炸',
				I18nKey.getTypeNameKey(EffectType.SPAWN),
				'重生',
				I18nKey.getTypeNameKey(EffectType.TELEPORT),
				'传送',
				I18nKey.getTypeNameKey(EffectType.PLAYER_DEATH_LIGHT),
				'玩家死亡炫光',
				I18nKey.getTypeNameKey(EffectType.PLAYER_DEATH_FADEOUT),
				'玩家死亡淡出',
				I18nKey.getTypeNameKey(EffectType.PLAYER_LEVELUP),
				'玩家升级',
				I18nKey.getTypeNameKey(EffectType.BLOCK_LIGHT),
				'方块高亮',
				// WeaponTypes
				I18nKey.getTypeNameKey(WeaponType.BULLET),
				'子弹',
				I18nKey.getTypeNameKey(WeaponType.NUKE),
				'核弹',
				I18nKey.getTypeNameKey(WeaponType.SUB_BOMBER),
				'子轰炸机',
				I18nKey.getTypeNameKey(WeaponType.TRACKING_BULLET),
				'追踪子弹',
				I18nKey.getTypeNameKey(WeaponType.LASER),
				'激光',
				I18nKey.getTypeNameKey(WeaponType.PULSE_LASER),
				'脉冲激光',
				I18nKey.getTypeNameKey(WeaponType.TELEPORT_LASER),
				'传送激光',
				I18nKey.getTypeNameKey(WeaponType.ABSORPTION_LASER),
				'吸收激光',
				I18nKey.getTypeNameKey(WeaponType.WAVE),
				'波浪',
				I18nKey.getTypeNameKey(WeaponType.BLOCK_THROWER),
				'方块投掷者',
				I18nKey.getTypeNameKey(WeaponType.MELEE),
				'近战',
				I18nKey.getTypeNameKey(WeaponType.LIGHTNING),
				'闪电',
				I18nKey.getTypeNameKey(WeaponType.SHOCKWAVE_ALPHA),
				'冲击波-α',
				I18nKey.getTypeNameKey(WeaponType.SHOCKWAVE_BETA),
				'冲击波-β',
				// GameModeTypes
				I18nKey.getTypeNameKey(GameModeType.REGULAR),
				'正常',
				I18nKey.getTypeNameKey(GameModeType.BATTLE),
				'混战',
				I18nKey.getTypeNameKey(GameModeType.SURVIVAL),
				'生存',
				I18nKey.getTypeNameKey(GameModeType.HARD),
				'困难'
			);
		}

		public static function getDefaultI18n(key: String): String {
			var type: TypeCommon;
			// Block Type
			for (let type of BlockType._NORMAL_BLOCKS) {
				if (type == null)
					continue;
				if (key == I18nKey.getTypeNameKey(type))
					return type.name;
			}
			// Entity Type
			for (let type of EntityType._ALL_ENTITY) {
				if (type == null)
					continue;
				if (key == I18nKey.getTypeNameKey(type))
					return type.name;
			}
			// Effect Type
			for (let type of EffectType._ALL_EFFECT) {
				if (type == null)
					continue;
				if (key == I18nKey.getTypeNameKey(type))
					return type.name;
			}
			// Weapon Type
			for (let type of WeaponType._ALL_WEAPON) {
				if (type == null)
					continue;
				if (key == I18nKey.getTypeNameKey(type))
					return type.name;
			}
			// Bonus Type
			for (let type of BonusType._ALL_TYPE) {
				if (type == null)
					continue;
				if (key == I18nKey.getTypeNameKey(type))
					return type.name;
			}
			// Else
			return I18nKey.NULL;
		}
	}
}