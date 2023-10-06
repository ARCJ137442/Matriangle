

import { IJSObjectifiable, JSObjectifyMap } from "../../../../../../common/JSObjectify";
import { uint } from "../../../../../../legacy/AS3Legacy";
import IPlayerProfile from "./IPlayerProfile";

/**
 * 用于在「世界统计」中存储玩家档案
 * * 【2023-09-27 19:07:50】一般是「只读不写」的
 * @author ARCJ137442
 */
export default class PlayerProfile implements IPlayerProfile, IJSObjectifiable<PlayerProfile> {

	// JS对象 //
	public static readonly OBJECTIFY_MAP: JSObjectifyMap = {}
	public get objectifyMap(): JSObjectifyMap { return PlayerProfile.OBJECTIFY_MAP }
	public cloneBlank(): PlayerProfile { return new PlayerProfile(this) };

	protected _customName: string;
	public get customName(): string { return this._customName; }

	protected _experience: uint;
	public get experience(): uint { return this._experience; }

	protected _level: uint;
	public get level(): uint { return this._level; }

	protected _teamColor: uint;
	public get teamColor(): uint { return this._teamColor; }

	protected _teamID: string;
	public get teamID(): string { return this._teamID; }


	//============Constructor============//
	public constructor(profile: IPlayerProfile) {
		this._customName = profile.customName;
		this._experience = profile.experience;
		this._level = profile.level;
		this._teamColor = profile.teamColor;
		this._teamID = profile.teamID;
	}

	public copyFrom(profile: IPlayerProfile): void {
		this._customName = profile.customName;
		this._experience = profile.experience;
		this._level = profile.level;
		this._teamColor = profile.teamColor;
		this._teamID = profile.teamID;
	}

}
