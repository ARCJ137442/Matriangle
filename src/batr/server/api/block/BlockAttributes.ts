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
	/**
	 * 是否「可进入」
	 * * 影响玩家是否可经过
	 */
	public canEnter: boolean = false;

	/**
	 * 是否「可射入」
	 * * 影响子弹是否可经过
	 */
	public canShotIn: boolean = false;

	/**
	 * 是否「透明」
	 * * 影响激光是否可经过
	 */
	public transparent: boolean = false;

	/**
	 * 是否「透明」
	 * * 影响激光是否可经过
	 */
	/** Allows player */
	// public isTransparent: boolean = false; // !【2023-09-29 11:12:58】弃用

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
	 * -1 means instanceof will damage player as asphyxia
	 * -2 means it will supplying player HP and experience
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

	public copy(): BlockAttributes {
		let tempAttributes: BlockAttributes = new BlockAttributes();
		/**
		 * !【2023-09-29 11:18:16】现在使用for-in遍历所有键值对进行复制
		 */
		for (let key in this) {
			// ! 注意：必须是「独有属性」，否则会复制getter
			if (this.hasOwnProperty(key)) {
				(tempAttributes as any)[key] = this[key];
			}
		}
		return tempAttributes;
	}

	public destructor(): void { }

	//============Instance Functions============//
	/** 以固体形式加载 */
	public get asSolid(): BlockAttributes { return this.loadAsSolid(); }
	public loadAsSolid(): BlockAttributes {
		this.canEnter = false;
		this.canShotIn = false;
		this.transparent = false;
		// this.isTransparent = false; // !【2023-09-29 11:13:50】弃用
		this.isCarriable = true;
		this.isBreakable = true;
		this.drawLayer = 0;
		this.playerDamage = -1;
		this.rotateWhenMoveIn = false;
		this.electricResistance = 80;

		return this;
	}

	/** 以流体形式加载 */
	public get asLiquid(): BlockAttributes { return this.loadAsLiquid(); }
	public loadAsLiquid(): BlockAttributes {
		this.canEnter = false;
		this.canShotIn = true;
		this.transparent = true;
		// this.isTransparent = true; // !【2023-09-29 11:13:50】弃用
		this.isCarriable = false;
		this.isBreakable = true;
		this.drawLayer = -1;
		this.rotateWhenMoveIn = false;
		this.electricResistance = 160;

		return this;
	}

	/** 以气体形式加载 */
	public get asGas(): BlockAttributes { return this.loadAsGas(); }
	public loadAsGas(): BlockAttributes {
		this.canEnter = true;
		this.canShotIn = true;
		this.transparent = true;
		// this.isTransparent = true; // !【2023-09-29 11:13:50】弃用
		this.isCarriable = false;
		this.isBreakable = true;
		this.drawLayer = -1;
		this.rotateWhenMoveIn = false;
		this.electricResistance = 10;

		return this;
	}

	/** 以「透明固体」形式加载 */
	public get asTransparentSolid(): BlockAttributes { return this.loadAsTransparent(); }
	public loadAsTransparent(): BlockAttributes {
		this.canEnter = false;
		this.canShotIn = false;
		this.transparent = true;
		// this.isTransparent = true; // !【2023-09-29 11:13:50】弃用
		this.isCarriable = true;
		this.isBreakable = true;
		this.drawLayer = 1;
		this.playerDamage = -1;
		this.rotateWhenMoveIn = false;
		this.electricResistance = 120;

		return this;
	}

	/** 以「无法破坏」形式加载 */
	public get asUnbreakable(): BlockAttributes { return this.loadAsUnbreakable(); }
	public loadAsUnbreakable(): BlockAttributes {
		this.isCarriable = false;
		this.isBreakable = false;
		return this;
	}

	/** 以「伤害区」形式加载 */
	public get asHurtZone(): BlockAttributes { return this.loadAsHurtZone(); }
	public loadAsHurtZone(damage: int = 10): BlockAttributes {
		this.playerDamage = damage;
		this.electricResistance = 20;
		return this;
	}

	/** 以「死亡区」形式加载 */
	public get asKillZone(): BlockAttributes { return this.loadAsKillZone(); }
	public loadAsKillZone(): BlockAttributes {
		this.playerDamage = int$MAX_VALUE;
		this.electricResistance = 40;
		return this;
	}

	/** 以「旋转区」形式加载 */
	public get asRotateZone(): BlockAttributes { return this.loadAsRotateZone(); }
	public loadAsRotateZone(): BlockAttributes {
		this.rotateWhenMoveIn = true;
		this.electricResistance = 20;
		return this;
	}

	/** 以「金属」形式加载 */
	public get asMetal(): BlockAttributes { return this.loadAsMetal(); }
	public loadAsMetal(): BlockAttributes {
		this.electricResistance = 2;
		return this;
	}

	/** 以「竞技场形式」加载 */
	public get asArenaBlock(): BlockAttributes { return this.loadAsArenaBlock(); }
	public loadAsArenaBlock(): BlockAttributes {
		this.unbreakableInArenaMap = true;
		return this;
	}

	/** 以「基座」形式加载 */
	public get asBase(): BlockAttributes { return this.loadAsBase(); }
	public loadAsBase(): BlockAttributes {
		this.canEnter = true;
		this.canShotIn = false;
		this.transparent = true;
		// this.isTransparent = true; // !【2023-09-29 11:13:50】弃用
		this.isCarriable = false;
		this.isBreakable = false;
		this.electricResistance = 100;
		this.playerDamage = int$MIN_VALUE;
		this.drawLayer = -1;
		return this;
	}

	/** 以「供应点」形式加载 */
	public get asSupplyPoint(): BlockAttributes { return this.loadAsSupplyPoint(); }
	public loadAsSupplyPoint(): BlockAttributes {
		this.playerDamage = -2;
		this.supplyingBonus = true;
		return this;
	}


	/** 以「打开的门」形式加载 */
	public get asGateOpen(): BlockAttributes { return this.loadAsGate(); }
	public loadAsGate(): BlockAttributes {
		this.loadAsGas();
		this.isCarriable = true;
		this.unbreakableInArenaMap = true;
		this.drawLayer = -1;
		return this;
	}

	/** 以「关闭的门」形式加载 */
	public get asGateClose(): BlockAttributes { return this.loadAsGateClose(); }
	public loadAsGateClose(): BlockAttributes {
		this.loadAsSolid();
		this.unbreakableInArenaMap = true;
		// No Damage on preMoveOut,still developing
		this.playerDamage = -int$MIN_VALUE;
		return this;
	}

}