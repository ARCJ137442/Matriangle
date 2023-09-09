
// import batr.common.*;
// import batr.general.*;

import { NULL } from "../../general/GlobalRot";
import { int } from "../../legacy/AS3Legacy";
import TypeCommon from "../template/TypeCommon";

export default class EffectType extends TypeCommon {
	//============Static Variables============//
	public static readonly NULL: EffectType = null;
	public static readonly ABSTRACT: EffectType = new EffectType('Abstract');

	public static readonly EXPLODE: EffectType = new EffectType('Explode', 1);
	public static readonly SPAWN: EffectType = new EffectType('Spawn', -1);
	public static readonly TELEPORT: EffectType = new EffectType('Teleport', -1);
	public static readonly PLAYER_DEATH_LIGHT: EffectType = new EffectType('PlayerDeathLight', 1);
	public static readonly PLAYER_DEATH_FADEOUT: EffectType = new EffectType('PlayerDeathFadeout', 0);
	public static readonly PLAYER_HURT: EffectType = new EffectType('PlayerHurt', 1);
	public static readonly PLAYER_LEVELUP: EffectType = new EffectType('PlayerLevelUp', 1);
	public static readonly BLOCK_LIGHT: EffectType = new EffectType('BlockLight', 1);

	public static readonly _ALL_EFFECT: EffectType[] = [
		EffectType.EXPLODE,
		EffectType.SPAWN,
		EffectType.TELEPORT,
		EffectType.PLAYER_DEATH_LIGHT,
		EffectType.PLAYER_DEATH_FADEOUT,
		EffectType.PLAYER_HURT,
		EffectType.PLAYER_LEVELUP,
		EffectType.BLOCK_LIGHT];

	//============Static Getter And Setter============//
	public static get RANDOM(): EffectType {
		return _ALL_EFFECT[exMath.random(_ALL_EFFECT.length)];
	}

	//============Static Functions============//
	public static fromString(str: string): EffectType {
		for (let type of EffectType._ALL_EFFECT) {
			if (type.name == str)
				return type;
		}
		return NULL;
	}

	public static isIncludeIn(type: EffectType, types: EffectType[]): boolean {
		for (let type2 of types) {
			if (type == type2)
				return true;
		}
		return false;
	}

	//============Instance Variables============//
	protected _effectLayer: int;

	//============Constructor & Destructor============//
	public constructor(name: string, effectLayer: int = -1) {
		super(name);

		this._effectLayer = effectLayer;
	}

	//============Instance Getter And Setter============//
	override get label(): string {
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