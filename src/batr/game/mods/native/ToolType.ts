
// import batr.common.*;
// import batr.general.*;

import { NULL } from "../../general/GlobalRot";
import { uint, int } from "../../legacy/AS3Legacy";
import TypeCommon from "../template/TypeCommon";

export default class ToolType extends TypeCommon {
	//============Static Variables============//
	public static readonly NULL: ToolType = null;
	public static readonly ABSTRACT: ToolType = new ToolType('Abstract', 0, 0);

	public static readonly BULLET: ToolType = new ToolType('Bullet', 0.25, 5).setExtraProperty(1, 1);
	public static readonly NUKE: ToolType = new ToolType('Nuke', 5, 320, 5).setCanHurt(true, true, true).setExtraProperty(10, 15).setDroneProperty(0);
	public static readonly SUB_BOMBER: ToolType = new ToolType('Sub Bomber', 1, 10, 1, true).setExtraProperty(2, 1).setDroneProperty(0);
	public static readonly TRACKING_BULLET: ToolType = new ToolType('Tracking Bullet', 0.25, 5, 0.5, true).setExtraProperty(1, 1).setDroneProperty(0);

	public static readonly LASER: ToolType = new ToolType('Laser', 3, 120, 1).setExtraProperty(8, 6).setDroneProperty(0.8);
	public static readonly PULSE_LASER: ToolType = new ToolType('Pulse Laser', 0.5, 5, 0.5, true).setExtraProperty(3, 3);
	public static readonly TELEPORT_LASER: ToolType = new ToolType('Teleport Laser', 3.5, 40).setExtraProperty(4, 3);
	public static readonly ABSORPTION_LASER: ToolType = new ToolType('Absorption Laser', 4, 10).setExtraProperty(4, 2);

	public static readonly WAVE: ToolType = new ToolType('Wave', 0.5, 20, 2).setExtraProperty(3, 3).setDroneProperty(0.25); // Not Full Charge

	public static readonly MELEE: ToolType = new ToolType('Melee', 0.25, 5).setExtraProperty(5, 3); // Used in BATR-alpha&beta
	public static readonly BLOCK_THROWER: ToolType = new ToolType('Block Thrower', .5, 200, 1).setCanHurt(true, true, true).setExtraProperty(10, 10);
	public static readonly LIGHTNING: ToolType = new ToolType('Lightning', 0.25, 20, 0.5, true).setCanHurt(true, true, true).setExtraProperty(12, 10);

	// BOSS TOOL
	public static readonly SHOCKWAVE_ALPHA: ToolType = new ToolType('Shockwave-α', 10, 100).setExtraProperty(10, 2);
	public static readonly SHOCKWAVE_BETA: ToolType = new ToolType('Shockwave-β', 10, 100).setExtraProperty(10, 2, true);

	// TOOL SET
	public static readonly _BULLETS: ToolType[] = new Array<ToolType>(ToolType.BULLET, ToolType.NUKE, ToolType.SUB_BOMBER, ToolType.TRACKING_BULLET);
	public static readonly _LASERS: ToolType[] = new Array<ToolType>(ToolType.LASER, ToolType.PULSE_LASER, ToolType.TELEPORT_LASER, ToolType.ABSORPTION_LASER);
	public static readonly _SPECIAL: ToolType[] = new Array<ToolType>(ToolType.WAVE, ToolType.MELEE, ToolType.BLOCK_THROWER, ToolType.LIGHTNING);
	public static readonly _BOSS_TOOL: ToolType[] = new Array<ToolType>(ToolType.SHOCKWAVE_ALPHA, ToolType.SHOCKWAVE_BETA);
	public static readonly _ALL_TOOL: ToolType[] = _BULLETS.concat(_LASERS).concat(_SPECIAL).concat(_BOSS_TOOL);

	public static readonly _ALL_AVAILABLE_TOOL: ToolType[] = [
		ToolType.BULLET,
		ToolType.NUKE,
		ToolType.SUB_BOMBER,
		ToolType.TRACKING_BULLET,
		ToolType.LASER,
		ToolType.PULSE_LASER,
		ToolType.TELEPORT_LASER,
		ToolType.ABSORPTION_LASER,
		ToolType.WAVE,
		ToolType.BLOCK_THROWER,
		ToolType.LIGHTNING,
		ToolType.SHOCKWAVE_ALPHA,
		ToolType.SHOCKWAVE_BETA];

	//============Static Getter And Setter============//
	public static get label(): string {
		return 'tool';
	}

	public static get RANDOM_ID(): uint {
		return exMath.random(_ALL_TOOL.length);
	}

	public static get RANDOM(): ToolType {
		return _ALL_TOOL[ToolType.RANDOM_ID];
	}

	public static get RANDOM_AVAILABLE_ID(): uint {
		return exMath.random(_ALL_AVAILABLE_TOOL.length);
	}

	public static get RANDOM_AVAILABLE(): ToolType {
		return _ALL_AVAILABLE_TOOL[ToolType.RANDOM_AVAILABLE_ID];
	}

	//============Static Functions============//
	public static isValidToolID(id: int): boolean {
		return (id >= 0 && id < ToolType._ALL_TOOL.length);
	}

	public static isValidAvailableToolID(id: int): boolean {
		return (id >= 0 && id < ToolType._ALL_AVAILABLE_TOOL.length);
	}

	public static fromString(str: string): ToolType {
		for (let type of ToolType._ALL_TOOL) {
			if (type.name == str)
				return type;
		}
		return NULL;
	}

	/**
	 * Returns a ToolType by ID in int.
	 * @param	id	A int determines tool.
	 * @return	A tool type based on id.
	 */
	public static fromToolID(id: int): ToolType {
		if (id < 0 || id >= _ALL_AVAILABLE_TOOL.length)
			return null;
		return _ALL_AVAILABLE_TOOL[id];
	}

	/**
	 * Returns a ID by ToolType.
	 * @param	id	A int determines tool.
	 * @return	A tool type based on id.
	 */
	public static toToolID(type: ToolType): int {
		return ToolType._ALL_AVAILABLE_TOOL.indexOf(type);
	}

	public static isIncludeIn(type: ToolType, types: ToolType[]): boolean {
		return types.indexOf(type) >= 0;
	}

	public static isBulletTool(type: ToolType): boolean {
		return ToolType.isIncludeIn(type, ToolType._BULLETS);
	}

	public static isLaserTool(type: ToolType): boolean {
		return ToolType.isIncludeIn(type, ToolType._LASERS);
	}

	public static getRandomAvailableWithout(tool: ToolType): ToolType {
		let tempW: ToolType, i: uint = 0;
		do {
			tempW = ToolType.RANDOM_AVAILABLE;
		}
		while (tempW == tool && ++i < 0xf);
		return tempW;
	}

	/**
	 * @return true if the tool uses player's droneTool
	 */
	public static isDroneTool(tool: ToolType): boolean {
		return tool == ToolType.SHOCKWAVE_ALPHA || tool == ToolType.SHOCKWAVE_BETA;
	}

	public static isAvailableDroneNotUse(tool: ToolType): boolean {
		return isDroneTool(tool) || tool == ToolType.BLOCK_THROWER || tool == ToolType.MELEE || tool == ToolType.SUB_BOMBER;
	}

	//============Instance Variables============//
	protected _defaultCD: uint;

	// Tick
	protected _defaultChargeTime: uint;

	// Tick
	protected _defaultDamage: uint;

	protected _reverseCharge: boolean;

	// Whether the tool will auto charge and can use before full charge
	// canHurt
	protected _canHurtEnemy: boolean;

	protected _canHurtSelf: boolean;

	protected _canHurtAlly: boolean;

	// Extra
	protected _extraDamageCoefficient: uint = 5;
	protected _extraResistanceCoefficient: uint = 1;
	protected _useOnCenter: boolean = false;

	// Drone
	protected _chargePercentInDrone: number = 1;

	//============Constructor & Destructor============//
	public constructor(name: string,
		defaultCD: number = 0,
		defaultDamage: uint = 1,
		defaultChargeTime: number = 0,
		reverseCharge: boolean = false): void {
		// defaultCD,defaultChargeTime is Per Second
		super(name);
		this._defaultCD = defaultCD * GlobalGameVariables.FIXED_TPS;
		this._defaultDamage = defaultDamage;
		this._defaultChargeTime = defaultChargeTime * GlobalGameVariables.FIXED_TPS;
		this._reverseCharge = reverseCharge;
		// default
		this._canHurtEnemy = true;
		this._canHurtSelf = false;
		this._canHurtAlly = false;
	}

	protected setCanHurt(enemy: boolean, self: boolean, ally: boolean): ToolType {
		this._canHurtEnemy = enemy;
		this._canHurtSelf = self;
		this._canHurtAlly = ally;
		return this;
	}

	protected setExtraProperty(damageCoefficient: uint,
		resistanceCoefficient: uint,
		useOnCenter: boolean = false): ToolType {
		this._extraDamageCoefficient = damageCoefficient;
		this._extraResistanceCoefficient = resistanceCoefficient;
		this._useOnCenter = useOnCenter;
		return this;
	}

	protected setDroneProperty(chargePercentInDrone: number = 1): ToolType {
		this._chargePercentInDrone = chargePercentInDrone;
		return this;
	}

	//============Instance Getter And Setter============//
	override get label(): string {
		return 'tool';
	}

	/**
	 * Dynamic when Tool List Changing
	 */
	public get toolID(): int {
		return ToolType.toToolID(this);
	}

	public get defaultCD(): uint {
		return this._defaultCD;
	}

	public get defaultDamage(): uint {
		return this._defaultDamage;
	}

	public get defaultChargeTime(): uint {
		return this._defaultChargeTime;
	}

	public get reverseCharge(): boolean {
		return this._reverseCharge;
	}

	public get defaultDamageOutput(): uint {
		return this._defaultDamage / (this._defaultCD + this._defaultChargeTime);
	}

	public get toolCanHurtEnemy(): boolean {
		return this._canHurtEnemy;
	}

	public get toolCanHurtSelf(): boolean {
		return this._canHurtSelf;
	}

	public get toolCanHurtAlly(): boolean {
		return this._canHurtAlly;
	}

	//====Extra Property====//
	public get extraDamageCoefficient(): uint {
		return this._extraDamageCoefficient;
	}

	public get extraResistanceCoefficient(): uint {
		return this._extraResistanceCoefficient;
	}

	public get useOnCenter(): boolean {
		return this._useOnCenter;
	}

	// About Drone
	public get chargePercentInDrone(): number {
		return this._chargePercentInDrone;
	}

	//============Instance Functions============//
	//====Buffed Property====//
	public getBuffedDamage(defaultDamage: uint, buffDamage: uint, buffResistance: uint): uint {
		return Math.max(defaultDamage + buffDamage * this.extraDamageCoefficient - buffResistance * this.extraResistanceCoefficient, 1);
	}

	public getBuffedCD(buffCD: uint): uint {
		return Math.ceil(this.defaultCD / (1 + buffCD / 10));
	}
}