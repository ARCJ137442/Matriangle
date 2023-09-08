
// import batr.common.*;
// import batr.general.*;
// import batr.i18n.ForcedI18nText;
// import batr.i18n.I18nText;

import ForcedI18nText from "../../i18n/ForcedI18nText";
import I18nText from "../../i18n/I18nText";
import { int } from "../../legacy/AS3Legacy";
import Game from "../main/Game";
import GameStats from "./GameStats";
import PlayerStats from "./PlayerStats";

// import batr.game.block.*;
// import batr.game.map.*;
// import batr.game.main.*;
// import batr.game.model.*;
// import batr.game.stat.*;

/**
 * The result stores information by game,at game end.
 * @author ARCJ137442
 */
export default class GameResult {
	//============Static Functions============//
	protected static scoreCompareFunc(x: PlayerStats, y: PlayerStats): int {
		return exMath.sgn(y.totalScore - x.totalScore);
	}

	//============Instance Variables============//
	protected _stats: GameStats;
	protected _message: I18nText;

	//============Constructor============//
	public constructor(host: Game, message: I18nText, stats: GameStats) {
		super();
		this._message = message;
		this._stats = stats;
	}

	//============Destructor============//
	public destructor(): void {
		this._message = null;
		this._stats = null;
	}

	//============Instance Getter And Setter============//
	public get message(): I18nText {
		return this._message;
	}

	public get stats(): GameStats {
		return this._stats;
	}

	public get rankingText(): ForcedI18nText {
		// W.I.P
		var text: string = '';
		var sortedStatList: PlayerStats[] = this._stats.player.concat().sort(scoreCompareFunc);
		var currentStats: PlayerStats;
		for (var i: int = 0; i < sortedStatList.length; i++) {
			currentStats = sortedStatList[i];
			text += currentStats.profile.customName + '\t\t\t' + currentStats.totalScore + '\n';
		}
		return new ForcedI18nText(null, null, text);
	}

	//============Instance Functions============//
}