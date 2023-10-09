import I18nText from "../../../../display/api/i18n/I18nText";
import { int } from "../../../../legacy/AS3Legacy";
import World from "../../native/main/World_V1";
import MatrixStats from "./MatrixStats";
import PlayerStats from "../entity/player/stat/PlayerStats";

/**
 * !【2023-10-06 23:00:29】这段以前有关「世界结局」的代码，即将迁移
 * @author ARCJ137442
 */
export default class MatrixResult {
	/* //============Static Functions============//
	protected static scoreCompareFunc(x: PlayerStats, y: PlayerStats): int {
		return exMath.sgn(y.totalScore - x.totalScore);
	}

	//============Instance Variables============//
	protected _stats: MatrixStats;
	protected _message: I18nText;

	//============Constructor============//
	public constructor(host: IBatrWorld, message: I18nText, stats: MatrixStats) {
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

	public get stats(): MatrixStats {
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

	//============Instance Functions============// */
}