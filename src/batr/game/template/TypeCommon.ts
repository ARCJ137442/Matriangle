/**
 * All ChildClass:BlockType,EntityType,EffectType,WeaponType,BonusType
 */
export default class TypeCommon {
	//============Static Variables============//

	//============Static Getter And Setter============//

	//============Static Functions============//
	public static isIncludeIn(type: TypeCommon, types: TypeCommon[]): boolean {
		for (var type2 of types) {
			if (type === type2)
				return true;
		}
		return false;
	}

	//============Instance Variables============//
	protected _name: string;

	//============Constructor Function============//
	public constructor(name: string) {
		this._name = name;
	}

	//============Instance Getter And Setter============//
	public get name(): string {
		return this._name;
	}

	public get label(): string {
		return 'common';
	}
}
