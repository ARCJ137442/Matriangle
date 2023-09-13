
// import batr.common.*;
// import batr.general.*;

import { uint, int } from "../../../legacy/AS3Legacy";
import { EventDispatcher } from "../../../legacy/flash/events";
import IMap from "../map/IMap";
import PlayerTeam from "../../mods/native/entities/player/team/PlayerTeam";
import Game from "../../main/Game";
import BonusType from "../registry/BonusRegistry";
import ToolType from "../registry/ToolType";
import GameRuleEvent from "./GameRuleEvent";

// import batr.game.map.*;
// import batr.game.main.*;
// import batr.game.model.*;
// import batr.game.events.*;

// import flash.events.EventDispatcher;

/**
 * This class contains the rules that can affects gameplay.
 */
export default class GameRule extends EventDispatcher {
	//============Static Variables============//
	//========Rules========//
	//====Player====//
	protected static readonly d_playerCount: uint = 1;
	protected static readonly d_AICount: uint = 3;

	//====Team====//
	protected static readonly d_coloredTeamCount: uint = 8;
	protected static readonly d_grayscaleTeamCount: uint = 3;
	protected static readonly d_playerTeams: PlayerTeam[] = initPlayerTeams(d_coloredTeamCount, d_grayscaleTeamCount);

	/**
	 * Allows players change their teams by general means
	 */
	protected static readonly d_allowPlayerChangeTeam: boolean = true;

	//====GamePlay====//
	protected static readonly d_defaultHealth: uint = 100;
	protected static readonly d_defaultMaxHealth: uint = 100;

	/**
	 * Use as a int with negative numbers means infinity
	 */
	protected static readonly d_remainLivesPlayer: int = -1;

	protected static readonly d_remainLivesAI: int = -1;

	protected static readonly d_defaultRespawnTime: uint = 3 * GlobalGameVariables.TPS; // tick
	protected static readonly d_deadPlayerMoveToX: number = -10;

	protected static readonly d_deadPlayerMoveToY: number = -10;

	protected static readonly d_recordPlayerStats: boolean = true;

	/**
	 * Negative Number means asphyxia can kill player
	 */
	protected static readonly d_playerAsphyxiaDamage: int = 15;

	//====Bonus====//

	/**
	 * negative number means infinity
	 */
	protected static readonly d_bonusBoxMaxCount: int = 8;

	/**
	 * [{Type:<Type>,Weight:<Number>},...]
	 */
	protected static readonly d_bonusBoxSpawnPotentials: object[] = null;

	/**
	 * null means all type can be spawned and they have same weight
	 */
	protected static readonly d_bonusBoxSpawnAfterPlayerDeath: boolean = true;

	//====Bonus's Buff====//

	/**
	 * Determines bonus(type=buffs)'s amount of addition
	 */
	protected static readonly d_bonusBuffAdditionAmount: uint = 1;

	/**
	 * Determines bonus(type=ADD_LIFE)'s amount of addition
	 */
	protected static readonly d_bonusMaxHealthAdditionAmount: uint = 5;

	//====Map====//

	/**
	 * [{map:<MAP>,weight:<Number>},...]
	 */
	protected static readonly d_mapRandomPotentials: object[] = null;

	protected static readonly d_initialMapID: int = -1;

	/**
	 * The time of the map transform loop.
	 * stranded by second.
	 */
	protected static readonly d_mapTransformTime: uint = 60;

	//====Tools====//
	protected static readonly d_enableTools: ToolType[] = ToolType._ALL_AVAILABLE_TOOL;

	protected static readonly d_defaultToolID: int = 0;

	protected static readonly d_defaultLaserLength: uint = 32;

	protected static readonly d_allowLaserThroughAllBlock: boolean = false;

	protected static readonly d_toolsNoCD: boolean = false;

	//====End&Victory====//
	protected static readonly d_allowTeamVictory: boolean = true;

	//========Preview========//
	public static readonly MENU_BACKGROUND: GameRule = GameRule.getBackgroundRule();

	public static readonly DEFAULT_DRONE_TOOL: ToolType = ToolType.LASER;

	protected static getBackgroundRule(): GameRule {
		let rule: GameRule = new GameRule();
		rule.playerCount = 0;
		rule.AICount = 8;
		rule.defaultToolID = -2;
		rule.remainLivesPlayer = -1;
		rule.remainLivesAI = -1;
		return rule;
	}

	//============Static Getter And Setter============//

	//============Static Functions============//

	/**
	 * Create a list of PlayerTeam that have different colors.
	 * @param	coloredTeamCount	the number of team that color is colorful
	 * @param	grayscaleTeamCount	the number of team that color is grayscale
	 * @return	A list of PlayerTeam,contains different colors.
	 */
	protected static initPlayerTeams(coloredTeamCount: uint, grayscaleTeamCount: uint): PlayerTeam[] {
		let returnTeams: PlayerTeam[] = new Array<PlayerTeam>();
		let h: uint, s: number, v: number, color: uint;
		let i: uint;
		// Grayscale Team
		h = 0;
		s = 0;
		for (i = 0; i < grayscaleTeamCount; i++) {
			v = i / (grayscaleTeamCount - 1) * 100;
			color = Color.HSVtoHEX(h, s, v);
			returnTeams.push(new PlayerTeam(color));
		}
		h = 0;
		s = 100;
		v = 100;
		// Colored Team
		for (i = 0; i < coloredTeamCount; i++) {
			h = 360 * i / coloredTeamCount;
			color = Color.HSVtoHEX(h, s, v);
			returnTeams.push(new PlayerTeam(color));
		}
		return returnTeams;
	}

	public static toJSON(rule: GameRule, replacer: any = null, space: any = null): string {
		let i = true;

		// get all getter value
		let o: object = JSON.parse(JSON.stringify(rule)); // if not: recursive reference problem
		// filter
		let k: string, v: any;
		let result: object = {};

		let blankRule: GameRule = new GameRule();
		for (k in o) {
			v = o[k];
			// Make sure the property is writable
			try {
				// write as itself
				blankRule[k] = v;
			}
			catch (e) {
				continue;
			}
			// not support with Infinity when JSON.stringify
			// if (v == Infinity || v == -Infinity) {
			// result[k] = v.toString();
			// }
			// Type
			if (
				v is Boolean ||
					v is Number ||
						v is String ||
							v is int ||
								v is uint ||
									v === null
					) // Filter
			if (
				k != 'initialMap'
			)
				result[k] = v;
			trace('Saving data', k, '=', result[k], '(' + v + ')');
		}
		return JSON.stringify(result, replacer, space);
	}

	public static fromJSON(rule: string): GameRule {
		let r: GameRule = new GameRule();
		let o: object = JSON.parse(rule);
		let v: any;
		for (let k in o) {
			try {
				v = o[k];
				// Infinity
				if (v === ' Infinity')
					r[k] = Infinity;
				else if (v === '-Infinity')
					r[k] = -Infinity;
				else {
					r[k] = v;
					trace('Loaded data', k, '=', o[k]);
				}
			}
			catch (error: Error) {
				trace('Error loading data', k, '=', o[k]);
			}
		}
		return r;
	}

	//============Instance Variables============//
	//====rules====//
	// Player
	protected _playerCount: uint;

	protected _AICount: uint;

	// Team
	protected _coloredTeamCount: uint;

	protected _grayscaleTeamCount: uint;

	protected _playerTeams: PlayerTeam[];

	protected _allowPlayerChangeTeam: boolean;

	// GamePlay
	protected _defaultHealth: uint;

	protected _defaultMaxHealth: uint;

	protected _remainLivesPlayer: int;

	protected _remainLivesAI: int;

	protected _defaultRespawnTime: uint;

	protected _deadPlayerMoveToX: number;

	protected _deadPlayerMoveToY: number;

	protected _recordPlayerStats: boolean;

	/**
	 * int.MAX_VALUE -> uint$MAX_VALUE
	 * Negative number -> uint$MAX_VALUE
	 * damage operator function=Game.computeFinalPlayerHurtDamage
	 */
	protected _playerAsphyxiaDamage: int;

	// Bonus

	/**
	 * Negative number means infinity
	 */
	protected _bonusBoxMaxCount: int;

	protected _bonusBoxSpawnChance: number = 1 / GlobalGameVariables.TPS / 8;

	// Spawn per tick
	protected _bonusBoxSpawnPotentials: object -[];

		// [{type:<BonusBoxType>,weight:<Number>},...]
		protected _bonusBoxSpawnAfterPlayerDeath: boolean;

		// Bonus's Buff
		protected _bonusBuffAdditionAmount: uint;

		protected _bonusMaxHealthAdditionAmount: uint;

		// Map

		/**
		 * Null means all type can be spawned and they have same weight
		 */
		protected _mapRandomPotentials: object - [];

		// [{map:<IMAP>,weight:<Number>},...]
		protected _initialMapID: int;

		/**
		 * The unit is second
		 * 0 means never transform map by time
		 */
		protected _mapTransformTime: uint;

		// Tools
		protected _enableTools: ToolType[];

		/**
		 * -1 means uniform random
		 * <-1 means certainly random
		 */
		protected _defaultToolID: int;

		protected _defaultLaserLength: uint;

		protected _allowLaserThroughAllBlock: boolean;

		protected _toolsNoCD: boolean;

		// End&Victory
		protected _allowTeamVictory: boolean;

	//============Constructor & Destructor============//
	public constructor() {
	super();
	loadAsDefault();
}

	//============Destructor Function============//
	public destructor(): void {
	this._bonusBoxSpawnPotentials = null;
	this._mapRandomPotentials = null;
	this._enableTools = null;
	this._playerTeams = null;
}

	//============Instance Getter And Setter============//
	// Rule Random About
	public get randomToolEnable(): ToolType {
	return this.enableTools[exMath.random(this.enableTools.length)];
}

	public get randomToolIDEnable(): int {
	return ToolType.toToolID(this.enableTools[exMath.random(this.enableTools.length)]);
}

	public get randomMapEnable(): IMap {
	// Test
	if (this._mapRandomPotentials == null) {
		return Game.ALL_MAPS[exMath.random(Game.ALL_MAPS.length)];
	}
	// Add
	let maps: IMap[] = new Array<IMap>();
	let weights: number[] = new Array<Number>();
	let sum: number = 0;
	for (let mapPotential of this._mapRandomPotentials) {
		if (mapPotential['map'] is IMap && mapPotential['weight'] is Number) {
			maps.push(mapPotential['map'] as IMap);
			weights.push(Number(mapPotential['weight']));
			sum += Number(mapPotential['weight']);
		}
	}
	let randomNum: number = exMath.randomFloat(sum);
	// Choose
	for (let i: uint = 0; i < weights.length; i++) {
		if (weights[i] >= randomNum && randomNum < weights[i + 1]) {
			return maps[i];
		}
	}
	return null;
}

	public get randomBonusEnable(): BonusType {
	// Test
	if (this._bonusBoxSpawnPotentials == null) {
		// return BonusType.RANDOM_AVAILABLE
		// 20230902: now initialize an equivalent potentials
		this._bonusBoxSpawnPotentials = BonusType.AVAILABLE_SPAWN_POTENTIALS;
	}
	// Add
	let types: BonusType[] = new Array<BonusType>();
	let weights: number[] = new Array<Number>();
	let sum: number = 0;
	for (let bonusPotential of this._bonusBoxSpawnPotentials) {
		if (bonusPotential['type'] is BonusType && bonusPotential['weight'] is Number) {
			// Filter
			if (
				// if the rule disallow player change their team, the type that potential can change player's team won't be push
				!this._allowPlayerChangeTeam && (
					bonusPotential['type'] == BonusType.RANDOM_CHANGE_TEAM ||
					bonusPotential['type'] == BonusType.UNITE_PLAYER ||
					bonusPotential['type'] == BonusType.UNITE_AI
				)
			)
				continue;
			// Push
			types.push(bonusPotential['type'] as BonusType);
			sum += Number(bonusPotential['weight']);
			weights.push(sum);
		}
	}
	let randomNum: number = exMath.randomFloat(sum);
	// Choose
	for (let i: uint = 0; i < weights.length; i++) {
		if (randomNum <= weights[i]) {
			return types[i];
		}
	}
	trace('warn@GameRule.as: no bonus type is selected, return NULL!');
	return BonusType.NULL;
}

	public get randomTeam(): PlayerTeam {
	if (this._playerTeams == null)
		return null;

	return this._playerTeams[exMath.random(this._playerTeams.length)];
}

	//====Rules====//
	// Player
	public get playerCount(): uint {
	return this._playerCount;
}

	public set playerCount(value: uint) {
	if (value == this._playerCount)
		return;
	onVariableUpdate(this._playerCount, value);
	this._playerCount = value;
}

public get AICount(): uint {
	return this._AICount;
}

public set AICount(value: uint) {
	if (value == this._AICount)
		return;
	onVariableUpdate(this._AICount, value);
	this._AICount = value;
}

// Health
public get defaultHealth(): uint {
	return this._defaultHealth;
}

public set defaultHealth(value: uint) {
	if (value == this._defaultHealth)
		return;
	onVariableUpdate(this._defaultHealth, value);
	this._defaultHealth = value;
}

public get defaultMaxHealth(): uint {
	return this._defaultMaxHealth;
}

public set defaultMaxHealth(value: uint) {
	if (value == this._defaultMaxHealth)
		return;
	onVariableUpdate(this._defaultMaxHealth, value);
	this._defaultMaxHealth = value;
}

// Bonus
public get bonusBoxMaxCount(): int {
	return this._bonusBoxMaxCount;
}

public set bonusBoxMaxCount(value: int) {
	if (value == this._bonusBoxMaxCount)
		return;
	onVariableUpdate(this._bonusBoxMaxCount, value);
	this._bonusBoxMaxCount = value;
}

public get bonusBoxSpawnChance(): number {
	return this._bonusBoxSpawnChance;
}

public set bonusBoxSpawnChance(value: number) {
	if (value == this._bonusBoxSpawnChance)
		return;
	onVariableUpdate(this._bonusBoxSpawnChance, value);
	this._bonusBoxSpawnChance = value;
}

public get bonusBoxSpawnPotentials(): object - [] {
	return this._bonusBoxSpawnPotentials;
}

public set bonusBoxSpawnPotentials(value: object - []) {
	if (value == this._bonusBoxSpawnPotentials)
		return;

	let _v: object[] = value;

	for (let i: int = _v.length - 1; i >= 0; i--) {
		if (_v[i] is BonusType) {
			_v[i] = { type: _v[i], weight: 1 };

			continue;
		}
		if (!(_v[i].type is BonusType) || !(_v[i].weight is Number)) {
			_v.splice(i, 1);

			continue;
		}
		if (isNaN(_v[i].weight)) {
			_v[i].weight = 1;
		}
	}
	onVariableUpdate(this._bonusBoxSpawnPotentials, _v);

	this._bonusBoxSpawnPotentials = _v;
}

public get bonusBoxSpawnAfterPlayerDeath(): boolean {
	return this._bonusBoxSpawnAfterPlayerDeath;
}

public set bonusBoxSpawnAfterPlayerDeath(value: boolean) {
	if (value == this._bonusBoxSpawnAfterPlayerDeath)
		return;
	onVariableUpdate(this._bonusBoxSpawnAfterPlayerDeath, value);
	this._bonusBoxSpawnAfterPlayerDeath = value;
}

// Bonus's Buff
public get bonusBuffAdditionAmount(): uint {
	return this._bonusBuffAdditionAmount;
}

public set bonusBuffAdditionAmount(value: uint) {
	if (value == this._bonusBuffAdditionAmount)
		return;
	onVariableUpdate(this._bonusBuffAdditionAmount, value);
	this._bonusBuffAdditionAmount = value;
}

public get bonusMaxHealthAdditionAmount(): uint {
	return this._bonusMaxHealthAdditionAmount;
}

public set bonusMaxHealthAdditionAmount(value: uint) {
	if (value == this._bonusMaxHealthAdditionAmount)
		return;
	onVariableUpdate(this._bonusMaxHealthAdditionAmount, value);
	this._bonusMaxHealthAdditionAmount = value;
}

// Map
public get mapRandomPotentials(): object - [] {
	return this._mapRandomPotentials;
}

public set mapRandomPotentials(value: object - []) {
	if (value == this._mapRandomPotentials)
		return;

	let _v: object[] = value;

	for (let i: int = _v.length - 1; i >= 0; i--) {
		if (_v[i] is IMap) {
			_v[i] = { map: _v[i], weight: 1 };

			continue;
		}
		if (!(_v[i].map is IMap) || !(_v[i].weight is Number)) {
			_v.splice(i, 1);

			continue;
		}
		if (isNaN(_v[i].weight)) {
			_v[i].weight = 1;
		}
	}
	onVariableUpdate(this._mapRandomPotentials, _v);

	this._mapRandomPotentials = _v;
}

public get mapWeightsByGame(): number[] {
	let wv: number[] = new Array<Number>(Game.ALL_MAPS.length);

	for (let i: uint = 0; i <= Game.ALL_MAPS.length; i++) {
		for (let map in this.mapRandomPotentials) {
			if (map.map == Game.ALL_MAPS[i]) {
				wv[i] = map.weight;
			}
		}
	}
	return wv;
}

public get initialMapID(): int {
	return this._initialMapID;
}

public set initialMapID(value: int) {
	if (value == this._initialMapID)
		return;
	onVariableUpdate(this._initialMapID, value);
	this._initialMapID = value;
}

public get mapTransformTime(): uint {
	return this._mapTransformTime;
}

public set mapTransformTime(value: uint) {
	if (value == this._mapTransformTime)
		return;
	onVariableUpdate(this._mapTransformTime, value);
	this._mapTransformTime = value;
}

/* The Copy Operation is in Menu:getRuleFromMenu
	 * The Negative Number returns null and The Game will be start as random map
	 */
public get initialMap(): IMap {
	if (this._initialMapID < 0)
		return null;
	return Game.getMapFromID(this._initialMapID);
}

/* The Map must be the true object in Game.ALL_MAPS not a clone!
	 * The initial map will be loaded in Game:loadMap
	 */
public set initialMap(value: IMap) {
	this.initialMapID = Game.getIDFromMap(value);
}

// Tool
public get defaultToolID(): int {
	return this._defaultToolID;
}

public set defaultToolID(value: int) {
	if (value == this._defaultToolID)
		return;
	onVariableUpdate(this._defaultToolID, value);
	this._defaultToolID = value;
}

public get defaultLaserLength(): uint {
	return this._defaultLaserLength;
}

public set defaultLaserLength(value: uint) {
	if (value == this._defaultLaserLength)
		return;
	onVariableUpdate(this._defaultLaserLength, value);
	this._defaultLaserLength = value;
}

public get allowLaserThroughAllBlock(): boolean {
	return this._allowLaserThroughAllBlock;
}

public set allowLaserThroughAllBlock(value: boolean) {
	if (value == this._allowLaserThroughAllBlock)
		return;
	onVariableUpdate(this._allowLaserThroughAllBlock, value);
	this._allowLaserThroughAllBlock = value;
}

public get toolsNoCD(): boolean {
	return this._toolsNoCD;
}

public set toolsNoCD(value: boolean) {
	if (value == this._toolsNoCD)
		return;
	onVariableUpdate(this._toolsNoCD, value);
	this._toolsNoCD = value;
}

// Respawn
public get defaultRespawnTime(): uint {
	return this._defaultRespawnTime;
}

public set defaultRespawnTime(value: uint) {
	if (value == this._defaultRespawnTime)
		return;
	onVariableUpdate(this._defaultRespawnTime, value);
	this._defaultRespawnTime = value;
}

public get deadPlayerMoveToX(): number {
	return this._deadPlayerMoveToX;
}

public set deadPlayerMoveToX(value: number) {
	if (value == this._deadPlayerMoveToX)
		return;
	onVariableUpdate(this._deadPlayerMoveToX, value);
	this._deadPlayerMoveToX = value;
}

public get deadPlayerMoveToY(): number {
	return this._deadPlayerMoveToY;
}

public set deadPlayerMoveToY(value: number) {
	if (value == this._deadPlayerMoveToY)
		return;
	onVariableUpdate(this._deadPlayerMoveToY, value);
	this._deadPlayerMoveToY = value;
}

// Life
public get remainLivesPlayer(): int {
	return this._remainLivesPlayer;
}

public set remainLivesPlayer(value: int) {
	if (value == this._remainLivesPlayer)
		return;
	onVariableUpdate(this._remainLivesPlayer, value);
	this._remainLivesPlayer = value;
}

public get remainLivesAI(): int {
	return this._remainLivesAI;
}

public set remainLivesAI(value: int) {
	if (value == this._remainLivesAI)
		return;
	onVariableUpdate(this._remainLivesAI, value);
	this._remainLivesAI = value;
}

// Stats
public get recordPlayerStats(): boolean {
	return this._recordPlayerStats;
}

public set recordPlayerStats(value: boolean) {
	if (value == this._recordPlayerStats)
		return;
	onVariableUpdate(this._recordPlayerStats, value);
	this._recordPlayerStats = value;
}

// Tool Enable
public get enableTools(): ToolType[] {
	return this._enableTools == null ? ToolType._ALL_AVAILABLE_TOOL : this._enableTools;
}

public set enableTools(value: ToolType[]) {
	if (value == this._enableTools)
		return;
	onVariableUpdate(this._enableTools, value);
	this._enableTools = value;
}

public get enableToolCount(): int {
	return this._enableTools == null ? ToolType._ALL_AVAILABLE_TOOL.length : this._enableTools.length;
}

// Asphyxia Damage
public get playerAsphyxiaDamage(): int {
	return this._playerAsphyxiaDamage;
}

public set playerAsphyxiaDamage(value: int) {
	if (value == this._playerAsphyxiaDamage)
		return;
	onVariableUpdate(this._playerAsphyxiaDamage, value);
	this._playerAsphyxiaDamage = value;
}

// Team
public get coloredTeamCount(): uint {
	return this._coloredTeamCount;
}

public set coloredTeamCount(value: uint) {
	if (value == this._coloredTeamCount)
		return;
	onVariableUpdate(this._coloredTeamCount, value);
	this._coloredTeamCount = value;
	this._playerTeams = initPlayerTeams(value, this._grayscaleTeamCount);
	dispatchEvent(new GameRuleEvent(GameRuleEvent.TEAMS_CHANGE));
}

public get grayscaleTeamCount(): uint {
	return this._grayscaleTeamCount;
}

public set grayscaleTeamCount(value: uint) {
	if (value == this._grayscaleTeamCount)
		return;
	onVariableUpdate(this._grayscaleTeamCount, value);
	this._grayscaleTeamCount = value;
	this._playerTeams = initPlayerTeams(this._coloredTeamCount, value);
	dispatchEvent(new GameRuleEvent(GameRuleEvent.TEAMS_CHANGE));
}

public get playerTeams(): PlayerTeam[] {
	return this._playerTeams;
}

public get allowPlayerChangeTeam(): boolean {
	return this._allowPlayerChangeTeam;
}

public set allowPlayerChangeTeam(value: boolean) {
	if (value == this._allowPlayerChangeTeam)
		return;
	onVariableUpdate(this._allowPlayerChangeTeam, value);
	this._allowPlayerChangeTeam = value;
}

// End&Victory
public get allowTeamVictory(): boolean {
	return this._allowTeamVictory;
}

public set allowTeamVictory(value: boolean) {
	if (value == this._allowTeamVictory)
		return;
	onVariableUpdate(this._allowTeamVictory, value);
	this._allowTeamVictory = value;
}

//============Instance Functions============//
public loadAsDefault(): void {
	// Player
	this._playerCount = d_playerCount;
	this._AICount = d_AICount;
	// Health
	this._defaultHealth = d_defaultHealth;
	this._defaultMaxHealth = d_defaultMaxHealth;
	// Bonus
	this._bonusBoxMaxCount = d_bonusBoxMaxCount;
	this._bonusBoxSpawnPotentials = d_bonusBoxSpawnPotentials;
	this._bonusBoxSpawnAfterPlayerDeath = d_bonusBoxSpawnAfterPlayerDeath;
	// Bonus's Buff
	this._bonusBuffAdditionAmount = d_bonusBuffAdditionAmount;
	this._bonusMaxHealthAdditionAmount = d_bonusMaxHealthAdditionAmount;
	// Map
	this._mapRandomPotentials = d_mapRandomPotentials;
	this._initialMapID = d_initialMapID;
	this._mapTransformTime = d_mapTransformTime;
	// Tool
	this._defaultToolID = d_defaultToolID;
	this._defaultLaserLength = d_defaultLaserLength;
	this._allowLaserThroughAllBlock = d_allowLaserThroughAllBlock;
	this._toolsNoCD = d_toolsNoCD;
	// Respawn
	this._defaultRespawnTime = d_defaultRespawnTime;
	this._deadPlayerMoveToX = d_deadPlayerMoveToX;
	this._deadPlayerMoveToY = d_deadPlayerMoveToY;
	// Life
	this._remainLivesPlayer = d_remainLivesPlayer;
	this._remainLivesAI = d_remainLivesAI;
	// Stat
	this._recordPlayerStats = d_recordPlayerStats;
	// Tool Enable
	this._enableTools = d_enableTools;
	// Asphyxia Damage
	this._playerAsphyxiaDamage = d_playerAsphyxiaDamage;
	// Team
	this._playerTeams = d_playerTeams;
	this._allowPlayerChangeTeam = d_allowPlayerChangeTeam;
	// End&Victory
	this._allowTeamVictory = d_allowTeamVictory;
}

protected onVariableUpdate(oldValue: any, newValue: any): void {
	dispatchEvent(new GameRuleEvent(GameRuleEvent.VARIABLE_UPDATE, oldValue, newValue));
}
	}
