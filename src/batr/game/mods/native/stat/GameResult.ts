

import ForcedI18nText from "../../../../display/api/i18n/ForcedI18nText";
import I18nText from "../../../../display/api/i18n/I18nText";
import { int } from "../../../../legacy/AS3Legacy";
import Game from "../../../main/Game";
import GameStats from "./GameStats";
import PlayerStats from "./PlayerStats";

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
	public constructor(host: IBatrGame, message: I18nText, stats: GameStats) {
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
		let text: string = '';
		let sortedStatList: PlayerStats[] = this._stats.player.concat().sort(scoreCompareFunc);
		let currentStats: PlayerStats;
		for (let i: int = 0; i < sortedStatList.length; i++) {
			currentStats = sortedStatList[i];
			text += currentStats.profile.customName + '\t\t\t' + currentStats.totalScore + '\n';
		}
		return new ForcedI18nText(null, null, text);
	}

	//============Instance Functions============//
}