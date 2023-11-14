import {
	int,
	uint,
	int$MIN_VALUE,
	int$MAX_VALUE,
	uint$MAX_VALUE,
} from 'matriangle-legacy/AS3Legacy'
import { DisplayLevel } from '../../display/DisplayInterfaces'

export default class BlockAttributes {
	//============Instance Variables============//
	//==Attributes==//
	/**
	 * 是否「可进入」
	 * * 影响玩家是否可经过
	 */
	public canEnter: boolean = false

	/**
	 * 是否「可射入」
	 * * 影响子弹是否可经过
	 */
	public canShotIn: boolean = false

	/**
	 * 是否「透明」
	 * * 影响激光是否可经过
	 */
	public transparent: boolean = false

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
	public drawLayer: int = 1

	/**
	 * -1 means instanceof will damage player as asphyxia
	 * -2 means it will supplying player HP and experience
	 * int.MIN_VALUE means no damage
	 * int.MAX_VALUE means they can kill player once a damage
	 *
	 * @default 最低伤害
	 */
	public playerDamage: int = int$MIN_VALUE

	/** True means player/projectile will rotate when move in the block. */
	public rotateWhenMoveIn: boolean = false

	/**
	 * this attribute determines electric flow in the block,
	 * 0 means lightning can flow in the block without energy
	 * energy-=electricResistance
	 */
	public electricResistance: uint = 100

	/**
	 * 「硬度等级」
	 * * 结合「地图硬度等级」来决定「是否可以破坏方块」
	 * * 核心机制：若「地图硬度等级<方块硬度等级」（对应原先的「竞技场环境」），则方块**可破坏**
	 * * 与原先「是否允许破坏」的等价性：`0`⇔允许破坏，`uint$MAX_VALUE`⇔不允许破坏（约等）
	 * * 应用：
	 *   * 「掷出的方块」在覆盖其它方块时，会根据「方块硬度等级」决定「覆盖/消失」
	 */
	public hardnessLevel: uint = 0

	/**
	 * 修改等级
	 * * 结合「地图修改等级」来决定「是否可以修改方块」
	 * * 核心机制：若「地图修改等级<方块修改等级」（对应原先的「竞技场环境」），则方块**可修改**
	 * * 与原先「是否允许修改」的等价性：`0`⇔允许修改，`uint$MAX_VALUE`⇔不允许修改（约等）
	 * * 应用：
	 *   * BaTr中玩家使用「方块投掷器」时，会根据「地图修改等级<方块修改等级」决定「是否可以拿起方块」
	 */
	public modificationLevel: uint = 0

	//==Information==//
	public defaultPixelColor: uint

	/**
	 * ! Using UINT PERCENT
	 */
	public defaultPixelAlpha: uint

	//============Constructor & Destructor============//
	public constructor(
		defaultPixelColor: uint = 0xffffff,
		defaultPixelAlpha: uint = uint$MAX_VALUE
	) {
		this.defaultPixelColor = defaultPixelColor
		this.defaultPixelAlpha = defaultPixelAlpha
	}

	public copy(): BlockAttributes {
		const tempAttributes: BlockAttributes = new BlockAttributes()
		/**
		 * !【2023-09-29 11:18:16】现在使用for-in遍历所有键值对进行复制
		 */
		for (const key in this) {
			// ! 注意：必须是「独有属性」，否则会复制getter
			// eslint-disable-next-line no-prototype-builtins
			if (this.hasOwnProperty(key)) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
				;(tempAttributes as any)[key] = this[key]
			}
		}
		return tempAttributes
	}

	public destructor(): void {}

	//============Instance Functions============//
	/**
	 * 以固体形式加载
	 * * 不可进入
	 * * 不可射入
	 * * 不透明
	 * * 绘制层级：中
	 * * 可破坏 & 可修改
	 * * 对玩家造成窒息伤害
	 * * 玩家不会在其中旋转
	 * * 电阻 = 80
	 */
	public loadAsSolid(): this {
		this.canEnter = false
		this.canShotIn = false
		this.transparent = false
		this.drawLayer = DisplayLevel.MAP_MIDDLE
		this.hardnessLevel = this.modificationLevel = 0
		this.playerDamage = -1
		this.rotateWhenMoveIn = false
		this.electricResistance = 80

		return this
	}

	/**
	 * 以流体形式加载
	 * * 不可进入
	 * * 可射入
	 * * 透明
	 * * 绘制层级：下
	 * * 可破坏 & 不可修改
	 * * 玩家不会在其中旋转
	 * * 电阻 = 160
	 */
	public loadAsLiquid(): this {
		this.canEnter = false
		this.canShotIn = true
		this.transparent = true
		this.modificationLevel = uint$MAX_VALUE
		this.hardnessLevel = 0
		this.drawLayer = DisplayLevel.MAP_BOTTOM
		this.rotateWhenMoveIn = false
		this.electricResistance = 160

		return this
	}

	/**
	 * 以气体形式加载
	 * * 可进入
	 * * 可射入
	 * * 透明
	 * * 绘制层级：上
	 * * 可破坏 & 不可修改
	 * * 玩家不会在其中旋转
	 * * 电阻 = 10
	 */
	public loadAsGas(): this {
		this.canEnter = true
		this.canShotIn = true
		this.transparent = true
		this.modificationLevel = uint$MAX_VALUE // ! 不可修改
		this.hardnessLevel = 0 // * 可破坏
		this.drawLayer = DisplayLevel.MAP_TOP // ! 与先前AS3版本不同：下⇒上「气体环绕在玩家周围」
		this.rotateWhenMoveIn = false
		this.electricResistance = 10

		return this
	}

	/**
	 * 以「透明固体」形式加载
	 * * 不可进入
	 * * 不可射入
	 * * 透明
	 * * 绘制层级：上
	 * * 可破坏 & 可修改
	 * * 对玩家造成窒息伤害
	 * * 玩家不会在其中旋转
	 * * 电阻 = 120
	 */
	public loadAsTransparent(): this {
		this.canEnter = false
		this.canShotIn = false
		this.transparent = true
		this.modificationLevel = this.hardnessLevel = 0
		this.drawLayer = DisplayLevel.MAP_TOP
		this.playerDamage = -1
		this.rotateWhenMoveIn = false
		this.electricResistance = 120

		return this
	}

	/**
	 * 以「无法破坏」形式加载
	 * * 不可破坏 & 不可修改
	 */
	public loadAsUnbreakable(): this {
		this.modificationLevel = this.hardnessLevel = uint$MAX_VALUE
		return this
	}

	/**
	 * 以「伤害区」形式加载
	 * * 可进入
	 * * 可射入
	 * * 透明
	 * * 绘制层级：上
	 * * 可破坏 & 不可修改
	 * * 对玩家造成指定伤害
	 * * 玩家不会在其中旋转
	 * * 电阻 = 20
	 */
	public loadAsHurtZone(damage: int = 10): BlockAttributes {
		this.playerDamage = damage
		this.electricResistance = 20
		return this
	}

	/**
	 * 以「死亡区」形式加载
	 * * 对玩家造成致死伤害
	 * * 电阻 = 40
	 */
	public loadAsKillZone(): this {
		this.playerDamage = int$MAX_VALUE
		this.electricResistance = 40
		return this
	}

	/**
	 * 以「旋转区」形式加载
	 * * 玩家会在其中旋转
	 * * 电阻 = 20
	 */
	public loadAsRotateZone(): this {
		this.rotateWhenMoveIn = true
		this.electricResistance = 20
		return this
	}

	/**
	 * 以「导电体」形式加载
	 * * 电阻 = 2
	 */
	public loadAsConductor(): this {
		this.electricResistance = 2
		return this
	}

	/**
	 * 以「基地」形式加载
	 * * 可进入
	 * * 不可射入
	 * * 透明
	 * * 绘制层级：上
	 * * 不可破坏 & 不可修改
	 * * 不对玩家造成伤害
	 * * 玩家不会在其中旋转
	 * * 电阻 = 100
	 */
	public loadAsBase(): this {
		this.canEnter = true
		this.canShotIn = false
		this.transparent = true
		this.drawLayer = DisplayLevel.MAP_BOTTOM
		this.modificationLevel = this.hardnessLevel = uint$MAX_VALUE
		this.playerDamage = int$MIN_VALUE // ? 似乎它的意思是「补充玩家生命值」，但游戏中又没体现出来
		this.rotateWhenMoveIn = false
		this.electricResistance = 100
		return this
	}

	/**
	 * 以「供应点」形式加载
	 * * 对玩家进行治疗
	 */
	public loadAsSupplyPoint(): this {
		this.playerDamage = -2
		return this
	}

	/** 以「打开的门」形式加载 */
	public loadAsGate(): this {
		this.loadAsGas()
		this.modificationLevel = 0
		this.hardnessLevel = 0
		this.drawLayer = DisplayLevel.MAP_BOTTOM
		return this
	}

	/** 以「关闭的门」形式加载 */
	public loadAsGateClose(): this {
		this.loadAsSolid()
		this.hardnessLevel = 0
		// No Damage on preMoveOut,still developing
		// this.playerDamage = -int$MIN_VALUE; // !【2023-10-08 20:16:54】弃用这段无用代码，它直接导致玩家被秒杀
		return this
	}

	/**
	 * （链式）设置「方块XX等级」
	 * * 这个一般只在「构建方块原型」时使用（因为会耗费object）
	 */
	public setLevels(levels: { hardness: uint; modification: uint }): this {
		// * 根据`levels键: 自身属性名`解构赋值
		;({
			hardness: this.hardnessLevel,
			modification: this.modificationLevel,
		} = levels)
		return this
	}
}
