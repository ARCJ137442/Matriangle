
// import batr.game.entity.entity.player.Player;

import { uint } from "../../../../../legacy/AS3Legacy";
import IPlayerProfile from "./IPlayerProfile";

/**
 * ...
 * @author ARCJ137442
 */
export default class PlayerProfile implements IPlayerProfile {
	//============Instance Variables============//
	protected _customName: string;
	protected _experience: uint;
	protected _level: uint;
	protected _teamColor: uint;

	//============Constructor============//
	public constructor(profile: IPlayerProfile = null) {
		if (profile == null)
			return;
		this.copyFrom(profile);
	}

	public copyFrom(profile: IPlayerProfile): void {
		this._customName = profile.customName;
		this._experience = profile.experience;
		this._level = profile.level;
		this._teamColor = profile.teamColor;
	}

	//============Instance Functions============//
	/* INTERFACE batr.game.entity.model.IPlayerProfile */
	public get customName(): string {
		return this._customName;
	}

	public get experience(): uint {
		return this._experience;
	}

	public get level(): uint {
		return this._level;
	}

	public get teamColor(): uint {
		return this._teamColor;
	}
}