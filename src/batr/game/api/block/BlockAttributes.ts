import { isExtend } from "../../../common/utils";
import { int, uint, int$MIN_VALUE, int$MAX_VALUE, uint$MAX_VALUE, Class } from "../../../legacy/AS3Legacy";
import Block from "./Block";

export default class BlockAttributes {

	//============Static Functions============//
	public static fromType(type: Class): BlockAttributes {
		if (isExtend(type, Block))
			return (type as any).DEFAULT_ATTRIBUTES; // * ensured `type extends Block`
		throw new Error("Unknown BlockType");
	}

	//============Instance Variables============//
	//==Attributes==//
	public playerCanPass: boolean = false;

	public bulletCanPass: boolean = false;

	public laserCanPass: boolean = false;

	/** Allows player */
	public isTransparent: boolean = false;

	/**
	 * GUI, HUD, EffectTop
	 * <Top>: POSITIVE
	 * Projectile
	 * <Middle>: ZERO
	 * Player,EffectMiddle,BonusBox
	 * <Bottom>: NEGATIVE
	 * EffectBottom,Background
	 */
	public drawLayer: int = 1;

	/** Tool:BlockThrower can carry */
	public isCarriable: boolean = true;

	/** Tool:BlockThrower can carry */
	public isBreakable: boolean = true;

	/**
	 * -1 means is will damage player as asphyxia
	 * -2 means it will supplying player health and experience
	 * int.MIN_VALUE means no damage
	 * int.MAX_VALUE means they can kill player once a damage
	 */
	public playerDamage: int = int$MIN_VALUE;

	/** True means player/projectile will rotate when move in the block. */
	public rotateWhenMoveIn: boolean = false;

	/**
	 * this attribute determines electric flow in the block,
	 * 0 means lightning can flow in the block without energy
	 * energy-=electricResistance
	 */
	public electricResistance: uint = 100;

	/** Can't be control in Arena Map. */
	public unbreakableInArenaMap: boolean = false;

	/** Spawn BonusBox ignore max count. */
	public supplyingBonus: boolean = false;

	//==Information==//
	public defaultPixelColor: uint;

	/** ! Using UINT PERCENT */
	public defaultPixelAlpha: uint;

	//============Constructor & Destructor============//
	public constructor(
		defaultPixelColor: uint = 0xffffff,
		defaultPixelAlpha: uint = uint$MAX_VALUE
	) {
		this.defaultPixelColor = defaultPixelColor;
		this.defaultPixelAlpha = defaultPixelAlpha;
	}

	public clone(): BlockAttributes {
		let tempAttributes: BlockAttributes = new BlockAttributes();
		// tempAttributes.playerCanPass = this.playerCanPass;
		// tempAttributes.bulletCanPass = this.bulletCanPass;
		// tempAttributes.laserCanPass = this.laserCanPass;
		// tempAttributes.isTransparent = this.isTransparent;
		// tempAttributes.drawLayer = this.drawLayer;
		// tempAttributes.isCarriable = this.isCarriable;
		// tempAttributes.isBreakable = this.isBreakable;
		// tempAttributes.playerDamage = this.playerDamage;
		// tempAttributes.rotateWhenMoveIn = this.rotateWhenMoveIn;
		// tempAttributes.electricResistance = this.electricResistance;
		// tempAttributes.unbreakableInArenaMap = this.unbreakableInArenaMap;
		// tempAttributes.supplyingBonus = this.supplyingBonus;
		// tempAttributes.defaultPixelAlpha = this.defaultPixelAlpha;
		// tempAttributes.defaultPixelColor = this.defaultPixelColor;
		/**
		 * ! Now use `for in` to iterate over the replication properties in batch
		 */
		for (let key in this) {
			if (this.hasOwnProperty(key)) {
				(tempAttributes as any)[key] = this[key];
			}
		}
		return tempAttributes;
	}

	//============Destructor Function============//
	public destructor(): void { }

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

	public get asTransparent(): BlockAttributes {
		return this.loadAsTransparent();
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
		this.isTransparent = false;
		this.isCarriable = true;
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
		this.isTransparent = true;
		this.isCarriable = false;
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
		this.isTransparent = true;
		this.isCarriable = false;
		this.isBreakable = true;
		this.drawLayer = -1;
		this.rotateWhenMoveIn = false;
		this.electricResistance = 10;

		return this;
	}

	public loadAsTransparent(): BlockAttributes {
		this.playerCanPass = false;
		this.bulletCanPass = false;
		this.laserCanPass = true;
		this.isTransparent = true;
		this.isCarriable = true;
		this.isBreakable = true;
		this.drawLayer = 1;
		this.playerDamage = -1;
		this.rotateWhenMoveIn = false;
		this.electricResistance = 120;

		return this;
	}

	public loadAsUnbreakable(): BlockAttributes {
		this.isCarriable = false;
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
		this.isTransparent = true;
		this.isCarriable = false;
		this.isBreakable = false;
		this.electricResistance = 100;
		this.playerDamage = int$MIN_VALUE;
		this.drawLayer = -1;
		return this;
	}

	/** Gate Open */
	public loadAsGate(): BlockAttributes {
		this.loadAsGas();
		this.isCarriable = true;
		this.unbreakableInArenaMap = true;
		this.drawLayer = -1;
		return this;
	}

	/** Gate Close */
	public loadAsGateClose(): BlockAttributes {
		this.loadAsSolid();
		this.unbreakableInArenaMap = true;
		// No Damage on preMoveOut,still developing
		this.playerDamage = -int$MIN_VALUE;
		return this;
	}

}