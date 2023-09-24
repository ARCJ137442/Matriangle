import { IJSObjectifiable, JSObjectifyMap, fastAddJSObjectifyMapProperty_dashP } from "../../../../../../common/JSObjectify";
import { key } from "../../../../../../common/utils";
import { uint } from "../../../../../../legacy/AS3Legacy";

export default class PlayerTeam implements IJSObjectifiable<PlayerTeam> {


	// JS对象 //

	/** JS对象化映射表 */
	public static readonly OBJECTIFY_MAP: JSObjectifyMap = {}
	public get objectifyMap(): JSObjectifyMap { return PlayerTeam.OBJECTIFY_MAP }

	/**
	 * 用于「区分敌我」的唯一识别标识
	 */
	protected _id: string;
	public get id(): string { return this._id; }
	public static readonly key_id: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'id', 'string',
	)

	/**
	 * 队伍的内部/显示名称
	 */
	protected _name: string;
	public get name(): string { return this._name; }
	public static readonly key_name: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'name', 'string',
	)

	/**
	 * 队伍在显示时的颜色
	 */
	protected _color: uint;
	public get color(): uint { return this._color; }
	public static readonly key_color: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'color', 'number',
	)

	/**
	 * 判断其是否「非敌方」
	 * * 逻辑：匹配「队伍ID」是否相同
	 * 
	 * @param t1 第一个队伍
	 * @param t2 第二个队伍
	 */
	public static isTeamAlly(t1: PlayerTeam, t2: PlayerTeam): boolean {
		return t1._id === t2._id;
	}

	/**
	 * 判断其是否全等
	 * * 逻辑：匹配所有「可对象化属性」是否相同
	 * 
	 * ! 注意：这只能匹配基础类型
	 * 
	 * @param t1 第一个队伍
	 * @param t2 第二个队伍
	 */
	public static isTeamEqual(t1: PlayerTeam, t2: PlayerTeam): boolean {
		// let k: keyof PlayerTeam
		for (let k in this.OBJECTIFY_MAP) {
			// 只要有一个不全等，就判断不相等
			if (t1[k as keyof PlayerTeam] !== t2[k as keyof PlayerTeam])
				return false;
		}
		return true;
	}

	//============Constructor & Destructor============//
	public constructor(
		color: uint = 0x000000,
		id: string = color.toString(16),
		name: string = `#${id}`,
	) {
		this._id = id;
		this._color = color;
		this._name = name;
	}

	public destructor(): void {
		this._color = 0x000000;
	}

	public clone(): PlayerTeam {
		return new PlayerTeam(this._color, this._id, this._name);
	}

}
