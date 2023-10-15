/*

!【2023-10-02 21:55:52】整个类行将弃用
* 实际上不应该在「加载地图」时特别指定，更不应该变成一个「注册表」一样的机制

TODO: 或许「更正确的用法」在于——选择一些「有特定加载模式的世界」，类似于Matrix中可随意加载的「训练程序」

import { NULL } from "../general/GlobalRot";
import { uint } from "../../legacy/AS3Legacy";
import TypeCommon from "../api/template/TypeCommon";

export default class WorldModeType extends TypeCommon {
	//============Static Variables============//
	public static readonly NULL: WorldModeType = null;

	public static readonly REGULAR: WorldModeType = new WorldModeType('regular');
	public static readonly BATTLE: WorldModeType = new WorldModeType('battle');
	public static readonly SURVIVAL: WorldModeType = new WorldModeType('survival');
	public static readonly HARD: WorldModeType = new WorldModeType('hard');

	public static readonly _ALL_TYPE: WorldModeType[] =
		[
			REGULAR, BATTLE, SURVIVAL
		];

	//============Static Getter And Setter============//
	public static get RANDOM(): WorldModeType {
		return WorldModeType._ALL_TYPE[exMath.random(WorldModeType._ALL_TYPE.length)];
	}

	public static get NUM_TYPES(): uint {
		return WorldModeType._ALL_TYPE.length;
	}

	//============Static Functions============//
	public static fromString(str: string): WorldModeType {
		for (let type of WorldModeType._ALL_TYPE) {
			if (type.name == str)
				return type;
		}
		return NULL;
	}

	public static isIncludeIn(type: WorldModeType, types: WorldModeType[]): boolean {
		for (let type2 of types) {
			if (type === type2)
				return true;
		}
		return false;
	}

	//============Constructor & Destructor============//
	public constructor(name: string) {
		super(name);
	}

	//============Instance Getter And Setter============//
	override get label(): string {
		return 'worldMode';
	}
} */
