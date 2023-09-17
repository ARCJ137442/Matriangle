import { IBatrJSobject, JSObject } from "../../../../../../common/abstractInterfaces";
import { safeMerge } from "../../../../../../common/utils";
import { uint } from "../../../../../../legacy/AS3Legacy";

export default class PlayerTeam implements IBatrJSobject<PlayerTeam> {

	/**
	 * 队伍的内部/显示名称
	 */
	protected _name: string;
	public get name(): string { return this._name; }

	/**
	 * 队伍在显示时的颜色
	 */
	protected _color: uint;
	public get color(): uint { return this._color; }

	//============Constructor & Destructor============//
	public constructor(color: uint = 0x000000, name: string = `#${color}`) {
		this._color = color;
		this._name = name;
	}

	public destructor(): void {
		this._color = 0x000000;
	}

	public clone(): PlayerTeam {
		return new PlayerTeam(this._color, this._name);
	}

	// JS对象 //
	/** 直接输出所有属性 */
	public toObject(): JSObject {
		return {
			name: this._name,
			color: this._color
		};
	}

	/** 使用「安全合并」从JS对象中加载值 */
	public copyFromObject(obj: JSObject): PlayerTeam {
		this._name = safeMerge(this._name, obj?.name);
		this._color = safeMerge(this._color, obj?.color);
		return this;
	}
}
