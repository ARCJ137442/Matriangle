import { uint } from "../../../../legacy/AS3Legacy";
import MatrixRule_V1 from "../rule/MatrixRule_V1";

/**
 * 母体の统计
 * 
 * TODO: 有待迁移，或将部分纳入API范畴
 * 
 * @author ARCJ137442
 */
export default class MatrixStats {
	//============Static Functions============//

	//============Instance Variables============//
	protected _rule: MatrixRule_V1;
	// protected _players: PlayerStats[] = new Array<PlayerStats>();
	// public get players(): PlayerStats[] { return this._players; }

	protected _mapTransformCount: uint = 0;
	protected _bonusGenerateCount: uint = 0;

	//============Constructor============//
	public constructor(rule: MatrixRule_V1) {
		this._rule = rule;
		/* if (players !== null)
			this.loadPlayers(players); */
	}

	// Unfinished
	public clone(): MatrixStats {
		return new MatrixStats(this._rule)/* .setPlayers(this._players); */
	}

	//============Destructor============//
	public destructor(): void {
		// this.rule = null;
		// this.clearPlayers();
		// this._players = null;
	}

	//============Instance Getter And Setter============//
	public get rule(): MatrixRule_V1 {
		return this._rule;
	}

	public set rule(value: MatrixRule_V1) {
		this._rule = value;
	}

	public get mapTransformCount(): uint {
		return this._mapTransformCount;
	}

	public set mapTransformCount(value: uint) {
		this._mapTransformCount = value;
	}

	public get bonusGenerateCount(): uint {
		return this._bonusGenerateCount;
	}

	public set bonusGenerateCount(value: uint) {
		this._bonusGenerateCount = value;
	}

	//============Instance Functions============//
	// !【2023-10-06 22:58:35】这些涉及玩家的函数因「过于专用」废除
	/* public addPlayer(player: IPlayer): MatrixStats {
		this._players.push(player.stats);
		return this;
	}

	public setPlayers(players: PlayerStats[]): MatrixStats {
		this._players = players;
		return this;
	}

	public loadPlayers(players: IPlayer[]): void {
		for (let player of players)
			this.addPlayer(player);
	}

	public clearPlayers(): void {
		this._players.splice(0, int.MAX_VALUE);
	}

	public importPlayersFromMatrix(matrix: World): void {
		for (let player of getPlayers) {
			if (player !== null)
				this._players.push(player.stats);
		}
	} */
}