import { int, uint, int$MIN_VALUE, int$MAX_VALUE, uint$MAX_VALUE } from "../../legacy/AS3Legacy";
import BlockType from "../registry/BlockType";

export default class BlockAttributes {

	//============Static Functions============//
	public static fromType(type: BlockType): BlockAttributes {
		return type.currentAttributes;
	}

	//============Instance Variables============//
	//==Attributes==//
	public playerCanPass: boolean = false;

	public bulletCanPass: boolean = false;

	public laserCanPass: boolean = false;

	public isTransParent: boolean = false;

	/**
	 * GUI,HUD,EffectTop
	 * <Top>:POSITIVE
	 * Projectile
	 * <Middle>:ZERO
	 * Player,EffectMiddle,BonusBox
	 * <Bottom>:NEGATIVE
	 * EffectBottom,Background
	 */
	public drawLayer: int = 1;

	/**
	 * Weapon:BlockThrower can carry
	 */
	public isCarryable: boolean = true;

	/**
	 * Weapon:BlockThrower can carry
	 */
	public isBreakable: boolean = true;

	/**
	 * -1 means is will damage player as asphyxia
	 * -2 means it will supplying player health and experience
	 * int.MIN_VALUE means no damage
	 * int.MAX_VALUE means they can kill player once a damage
	 */
	public playerDamage: int = int$MIN_VALUE;

	/**
	 * True means player/projectile will rotate when move in the block.
	 */
	public rotateWhenMoveIn: boolean = false;

	/**
	 * this attribute determines electric flow in the block,
	 * 0 means lightning can flow in the block without energy
	 * energy-=electricResistance
	 */
	public electricResistance: uint = 100;

	/**
	 * Can't be control in Arena Map.
	 */
	public unbreakableInArenaMap: boolean = false;

	/**
	 * Spawn BonusBox ignore max count.
	 */
	public supplyingBonus: boolean = false;

	//==Information==//
	public defaultPixelColor: uint;

	/**
	 * Using UINT PERCENT!
	 */
	public defaultPixelAlpha: uint;

	//============Constructor Function============//
	public constructor(defaultPixelColor: uint = 0xffffff, defaultPixelAlpha: uint = uint$MAX_VALUE) {
		this.defaultPixelColor = defaultPixelColor;
		this.defaultPixelAlpha = defaultPixelAlpha;
	}

	public clone(): BlockAttributes {
		var tempAttributes: BlockAttributes = new BlockAttributes();

		tempAttributes.playerCanPass = this.playerCanPass;

		tempAttributes.bulletCanPass = this.bulletCanPass;

		tempAttributes.laserCanPass = this.laserCanPass;

		tempAttributes.isTransParent = this.isTransParent;

		tempAttributes.drawLayer = this.drawLayer;

		tempAttributes.isCarryable = this.isCarryable;

		tempAttributes.isBreakable = this.isBreakable;

		tempAttributes.playerDamage = this.playerDamage;

		tempAttributes.rotateWhenMoveIn = this.rotateWhenMoveIn;

		tempAttributes.electricResistance = this.electricResistance;

		tempAttributes.unbreakableInArenaMap = this.unbreakableInArenaMap;

		tempAttributes.supplyingBonus = this.supplyingBonus;

		tempAttributes.defaultPixelAlpha = this.defaultPixelAlpha;

		tempAttributes.defaultPixelColor = this.defaultPixelColor;

		return tempAttributes;

	}

	//============Destructor Function============//
	public destructor(): void {

	}

	//============Instance Getter And Setter============//
	public get asSolid(): BlockAttributes {
		return this.loadAsSolid();
	}

	public get asLiquid(): BlockAttributes {
		return this.loadAsLiquid();
	}

	public get asGas(): BlockAttributes {
		return this.loadAsGas();
	}

	public get asTransParent(): BlockAttributes {
		return this.loadAsTransParent();
	}

	public get asUnbreakable(): BlockAttributes {
		return this.loadAsUnbreakable();
	}

	public get asHurtZone(): BlockAttributes {
		return this.loadAsHurtZone();
	}

	public get asKillZone(): BlockAttributes {
		return this.loadAsKillZone();
	}

	public get asRotateZone(): BlockAttributes {
		return this.loadAsRotateZone();
	}

	public get asMetal(): BlockAttributes {
		return this.loadAsMetal();
	}

	public get asArenaBlock(): BlockAttributes {
		return this.loadAsArenaBlock();
	}

	public get asBase(): BlockAttributes {
		return this.loadAsBase();
	}

	public get asSupplyPoint(): BlockAttributes {
		return this.loadAsSupplyPoint();
	}

	public get asGate(): BlockAttributes {
		return this.loadAsGate();
	}

	public get asGateClose(): BlockAttributes {
		return this.loadAsGateClose();
	}

	//============Instance Functions============//
	public loadAsSolid(): BlockAttributes {
		this.playerCanPass = false;

		this.bulletCanPass = false;

		this.laserCanPass = false;

		this.isTransParent = false;

		this.isCarryable = true;

		this.isBreakable = true;

		this.drawLayer = 0;

		this.playerDamage = -1;

		this.rotateWhenMoveIn = false;

		this.electricResistance = 80;

		return this;

	}

	public loadAsLiquid(): BlockAttributes {
		this.playerCanPass = false;

		this.bulletCanPass = true;

		this.laserCanPass = true;

		this.isTransParent = true;

		this.isCarryable = false;

		this.isBreakable = true;

		this.drawLayer = -1;

		this.rotateWhenMoveIn = false;

		this.electricResistance = 160;

		return this;

	}

	public loadAsGas(): BlockAttributes {
		this.playerCanPass = true;

		this.bulletCanPass = true;

		this.laserCanPass = true;

		this.isTransParent = true;

		this.isCarryable = false;

		this.isBreakable = true;

		this.drawLayer = -1;

		this.rotateWhenMoveIn = false;

		this.electricResistance = 10;

		return this;

	}

	public loadAsTransParent(): BlockAttributes {
		this.playerCanPass = false;

		this.bulletCanPass = false;

		this.laserCanPass = true;

		this.isTransParent = true;

		this.isCarryable = true;

		this.isBreakable = true;

		this.drawLayer = 1;

		this.playerDamage = -1;

		this.rotateWhenMoveIn = false;

		this.electricResistance = 120;

		return this;

	}

	public loadAsUnbreakable(): BlockAttributes {
		this.isCarryable = false;

		this.isBreakable = false;

		return this;

	}

	public loadAsHurtZone(damage: int = 10): BlockAttributes {
		this.playerDamage = damage;

		this.electricResistance = 20;

		return this;

	}

	public loadAsKillZone(): BlockAttributes {
		this.playerDamage = int$MAX_VALUE;

		this.electricResistance = 40;

		return this;

	}

	public loadAsRotateZone(): BlockAttributes {
		this.rotateWhenMoveIn = true;

		this.electricResistance = 20;

		return this;

	}

	public loadAsMetal(): BlockAttributes {
		this.electricResistance = 2;

		return this;

	}

	public loadAsArenaBlock(): BlockAttributes {
		this.unbreakableInArenaMap = true;
		return this;
	}

	public loadAsSupplyPoint(): BlockAttributes {
		this.playerDamage = -2;
		this.supplyingBonus = true;
		return this;
	}

	public loadAsBase(): BlockAttributes {
		this.playerCanPass = true;
		this.bulletCanPass = false;
		this.laserCanPass = true;
		this.isTransParent = true;
		this.isCarryable = false;
		this.isBreakable = false;
		this.electricResistance = 100;
		this.playerDamage = int$MIN_VALUE;
		this.drawLayer = -1;
		return this;
	}

	/**
	 * Gate Open
	 */
	public loadAsGate(): BlockAttributes {
		this.loadAsGas();
		this.isCarryable = true;
		this.unbreakableInArenaMap = true;
		this.drawLayer = -1;
		return this;
	}

	/**
	 * Gate Close
	 */
	public loadAsGateClose(): BlockAttributes {
		this.loadAsSolid();
		this.unbreakableInArenaMap = true;
		// No Damage on preMoveOut,still developing
		this.playerDamage = -int$MIN_VALUE;
		return this;
	}

	//============Static Constants: Native Registry============//
	public static readonly NULL: BlockAttributes | null = null;
	public static readonly ABSTRACT: BlockAttributes = new BlockAttributes();

	public static readonly VOID: BlockAttributes = new BlockAttributes(0xffffff, 0x0).asGas;
	public static readonly WALL: BlockAttributes = new BlockAttributes(0xBBBBBB).asSolid;
	public static readonly WATER: BlockAttributes = new BlockAttributes(0x2222FF, 0x40000000).asLiquid.asArenaBlock;
	public static readonly GLASS: BlockAttributes = new BlockAttributes(0x000000, 0x80000000).asTransParent.asArenaBlock;
	public static readonly BEDROCK: BlockAttributes = new BlockAttributes(0x888888).asSolid.asUnbreakable;
	public static readonly X_TRAP_HURT: BlockAttributes = new BlockAttributes(0xffff00, 0xc0000000).asGas.asHurtZone.asArenaBlock;
	public static readonly X_TRAP_KILL: BlockAttributes = new BlockAttributes(0xff0000, 0xc0000000).asGas.asKillZone.asArenaBlock;
	public static readonly X_TRAP_ROTATE: BlockAttributes = new BlockAttributes(0x0000ff, 0xc0000000).asGas.asRotateZone.asArenaBlock;
	public static readonly COLORED_BLOCK: BlockAttributes = new BlockAttributes(0x000000).asSolid;
	public static readonly COLOR_SPAWNER: BlockAttributes = new BlockAttributes(0x444444).asSolid.asArenaBlock;
	public static readonly LASER_TRAP: BlockAttributes = new BlockAttributes(0x444444).asSolid.asArenaBlock;
	public static readonly METAL: BlockAttributes = new BlockAttributes(0x666666).asSolid.asMetal.asArenaBlock;
	public static readonly SPAWN_POINT_MARK: BlockAttributes = new BlockAttributes(0x6666ff).asBase;

	public static readonly SUPPLY_POINT: BlockAttributes = new BlockAttributes(0x66ff66).asBase.asSupplyPoint;
	public static readonly GATE_OPEN: BlockAttributes = new BlockAttributes(0x888888, 0x50000000).asGate;

	public static readonly GATE_CLOSE: BlockAttributes = new BlockAttributes(0x888888).asGateClose;

	public static readonly MOVEABLE_WALL: BlockAttributes = new BlockAttributes(0xBBFFBB).asSolid.asArenaBlock;

}