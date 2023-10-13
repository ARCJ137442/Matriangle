import { IJSObjectifiable, JSObjectifyMap } from "../../../../../../common/JSObjectify";
import { uint } from "../../../../../../legacy/AS3Legacy";
import IPlayer from "../../../../native/entities/player/IPlayer";
import IPlayerHasExperience from "../IPlayerHasExperience";
import IPlayerHasTeam from "../IPlayerHasTeam";
import IPlayerProfile from "./IPlayerProfile";

/**
 * 用于在「世界统计」中存储玩家档案
 * * 可用于向下兼容没有「经验」「队伍」等机制的玩家
 * * 【2023-09-27 19:07:50】一般是「只读不写」的
 * @author ARCJ137442
 */
export default class PlayerProfile implements IPlayerProfile, IJSObjectifiable<PlayerProfile> {

	copyFromPlayer(p: IPlayer): this {
		this._customName = p.customName;
		this._experience = (p as IPlayerHasExperience)?.experience ?? 0;
		this._level = (p as IPlayerHasExperience)?.level ?? 0;
		this._teamColor = (p as IPlayerHasTeam)?.team.color ?? 0;
		this._teamID = (p as IPlayerHasTeam)?.team.id ?? 0;
		return this;
	}

	public static getBlank(): PlayerProfile {
		return new PlayerProfile(
			'blank', 0, 0, 0, 'blank'
		);
	}

	// JS对象 //
	public static readonly OBJECTIFY_MAP: JSObjectifyMap = {};
	get objectifyMap(): JSObjectifyMap { return PlayerProfile.OBJECTIFY_MAP; }
	cloneBlank(): PlayerProfile {
		return PlayerProfile.getBlank();
	}

	protected _customName: string;
	get customName(): string { return this._customName; }

	protected _experience: uint;
	get experience(): uint { return this._experience; }

	protected _level: uint;
	get level(): uint { return this._level; }

	protected _teamColor: uint;
	get teamColor(): uint { return this._teamColor; }

	protected _teamID: string;
	get teamID(): string { return this._teamID; }


	//============Constructor============//
	public constructor(
		customName: string,
		experience: uint,
		level: uint,
		teamColor: uint,
		teamID: string,
	) {
		this._customName = customName;
		this._experience = experience;
		this._level = level;
		this._teamColor = teamColor;
		this._teamID = teamID;
	}

	copyFrom(profile: IPlayerProfile): void {
		this._customName = profile.customName;
		this._experience = profile.experience;
		this._level = profile.level;
		this._teamColor = profile.teamColor;
		this._teamID = profile.teamID;
	}

}
