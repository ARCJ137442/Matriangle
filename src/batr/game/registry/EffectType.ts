package batr.game.effect {

	import batr.common.*;
	import batr.general.*;

	export default class EffectType extends TypeCommon {
		//============Static Variables============//
		public static const NULL: EffectType = null;
		public static const ABSTRACT: EffectType = new EffectType('Abstract');

		public static const EXPLODE: EffectType = new EffectType('Explode', 1);
		public static const SPAWN: EffectType = new EffectType('Spawn', -1);
		public static const TELEPORT: EffectType = new EffectType('Teleport', -1);
		public static const PLAYER_DEATH_LIGHT: EffectType = new EffectType('PlayerDeathLight', 1);
		public static const PLAYER_DEATH_FADEOUT: EffectType = new EffectType('PlayerDeathFadeout', 0);
		public static const PLAYER_HURT: EffectType = new EffectType('PlayerHurt', 1);
		public static const PLAYER_LEVELUP: EffectType = new EffectType('PlayerLevelUp', 1);
		public static const BLOCK_LIGHT: EffectType = new EffectType('BlockLight', 1);

		public static const _ALL_EFFECT: EffectType[] = new < EffectType > [
			EffectType.EXPLODE,
			EffectType.SPAWN,
			EffectType.TELEPORT,
			EffectType.PLAYER_DEATH_LIGHT,
			EffectType.PLAYER_DEATH_FADEOUT,
			EffectType.PLAYER_HURT,
			EffectType.PLAYER_LEVELUP,
			EffectType.BLOCK_LIGHT];

		//============Static Getter And Setter============//
		public static function get RANDOM(): EffectType {
			return _ALL_EFFECT[exMath.random(_ALL_EFFECT.length)];
		}

		//============Static Functions============//
		public static function fromString(str: string): EffectType {
			for (var type of EffectType._ALL_EFFECT) {
				if (type.name == str)
					return type;
			}
			return NULL;
		}

		public static function isIncludeIn(type: EffectType, types: EffectType[]): boolean {
			for (var type2 of types) {
				if (type == type2)
					return true;
			}
			return false;
		}

		//============Instance Variables============//
		protected _effectLayer: int;

		//============Constructor Function============//
		public EffectType(name: string, effectLayer: int = -1): void {
			super(name);

			this._effectLayer = effectLayer;
		}

		//============Instance Getter And Setter============//
		public override function get label(): string {
			return 'effect';
		}

		/**
		 * GUI,HUD
		 * <Top>:POSITIVE
		 * MapTop,Projectile,MapMiddle,Player
		 * <Middle>:ZERO
		 * BonusBox,MapBottom
		 * <Bottom>:NEGATIVE
		 * Background
		 */
		public get effectLayer(): int {
			return this._effectLayer;
		}
	}
}