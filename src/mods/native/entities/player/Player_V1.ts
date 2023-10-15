import { intMin } from '../../../../common/exMath'
import {
	iPoint,
	iPointRef,
	intPoint,
} from '../../../../common/geometricTools'
import {
	DisplayLayers,
	IShape as IShape,
} from '../../../../api/display/DisplayInterfaces'
import { NativeDecorationLabel } from '../../../BaTS/display/entity/player/DecorationLabels'
import { int, uint } from '../../../../legacy/AS3Legacy'
import Entity from '../../../../api/server/entity/Entity'
import { IEntityInGrid } from '../../../../api/server/entity/EntityInterfaces'
import { toOpposite_M, mRot } from '../../../../api/server/general/GlobalRot'
import { FIXED_TPS, TPS } from '../../../../api/server/main/GlobalWorldVariables'
import IMatrix from '../../../../api/server/main/IMatrix'
import { respawnPlayer } from '../../mechanics/NativeMatrixMechanics'
import { playerMoveInTest } from '../../mechanics/NativeMatrixMechanics'
import { getPlayers } from '../../mechanics/NativeMatrixMechanics'
import IPlayer from './IPlayer'
import {
	PlayerAction,
	EnumNativePlayerAction,
	NativeMatrixPlayerEvent,
} from './controller/PlayerAction'
import PlayerController from './controller/PlayerController'
import {
	NativePlayerEventOptions,
	NativePlayerEvent,
} from './controller/PlayerEvent'

/**
 * 玩家第一版
 * * 作为{@link IPlayer}的最小实现
 */
export default class Player_V1 extends Entity implements IPlayer {
	// !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给母体提供的）

	// 判断「是玩家」标签
	public readonly i_isPlayer = true as const

	//============Constructor & Destructor============//
	/**
	 * 构造函数
	 *
	 * 📌根据传入的「填充」「线条」初始化自身颜色
	 * * 填充颜色：渐变（1x亮度→3/4*亮度）
	 * * 线条颜色：0.5/亮度
	 *
	 * @param position 整数位置
	 * @param direction 方向
	 * @param team 队伍
	 * @param isActive （创建时是否已激活）
	 * @param fillColor 填充颜色（默认为队伍颜色）
	 * @param lineColor 线条颜色（默认从队伍颜色中产生）
	 */
	public constructor(
		position: iPoint,
		direction: mRot,
		isActive: boolean,
		fillColor: number,
		lineColor: number
	) {
		super()
		this._isActive = isActive

		// 有方向实体 & 格点实体 //
		this._position.copyFrom(position)
		this._direction = direction

		// 可显示实体 //
		this._fillColor = fillColor
		this._lineColor = lineColor

		// ! 控制器不在这里留有引用
	}

	/**
	 * 析构函数
	 * * 功能：解除侦听等引用
	 *
	 * !【2023-10-14 10:35:46】目前无需清空各个「临时点」的元素，因为其本身只含基础类型
	 */
	public destructor(): void {
		// 🕹️控制 //

		// 清空行为缓冲区
		this._actionBuffer.length = 0

		// 解除控制器连接
		this.disconnectController()
	}

	// 🏷️名称 //

	/** 玩家的自定义名称（不受国际化影响） */
	protected _customName: string = 'noname'
	/** 玩家的自定义名称（不受国际化影响） */
	get customName(): string {
		return this._customName
	}
	set customName(value: string) {
		if (value !== this._customName) {
			this._customName = value
			// this._GUI.updateName(); // TODO: 显示更新
		}
	}

	// 🕹️控制 //

	/** @implements 活跃实体 */
	readonly i_active = true as const
	onTick(host: IMatrix): void {
		// 在重生过程中⇒先处理重生
		if (this.isRespawning) this.dealRespawn(host)
		// 然后再处理其它
		else {
			this.dealCachedActions(host)
			this.dealController(host)
			this.dealMoveInTest(host, false, false)
			this.dealHeal()
		}
	}

	// !【2023-09-23 16:53:17】把涉及「玩家基本操作」的部分留下（作为接口），把涉及「具体按键」的部分外迁
	// !【2023-09-27 20:16:04】现在移除这部分的所有代码到`KeyboardController`中
	// ! 现在这里的代码尽可能地使用`setter`

	/**
	 * @implements 现在等价于「朝着自身方向平行前进」
	 *
	 * !【2023-10-04 22:52:46】原`Game.movePlayer`已被内置至此
	 */
	moveForward(host: IMatrix): void {
		this.moveParallel(host, this._direction)
	}

	/**
	 * @implements 测试「是否通过」⇒设置坐标
	 */
	moveParallel(host: IMatrix, direction: mRot): void {
		// 能前进⇒前进 // !原`host.movePlayer`
		if (
			this.testCanGoForward(
				host,
				direction,
				false,
				true,
				getPlayers(host)
			)
		)
			// 向前移动
			this.setPosition(
				host,
				// 不能在
				host.map.towardWithRot_II(
					this._temp_moveForward.copyFrom(this.position),
					direction,
					1
				),
				true
			)
		// !【2023-10-04 22:55:35】原`onPlayerMove`已被取消
		// TODO: 显示更新
	}
	protected _temp_moveForward: iPoint = new iPoint()

	turnTo(host: IMatrix, direction: number): void {
		this._direction = direction
		// TODO: 显示更新
	}

	turnBack(host: IMatrix): void {
		this.direction = toOpposite_M(this._direction)
		// TODO: 显示更新
	}

	// 可选
	turnRelative(host: IMatrix): void {}

	moveToward(host: IMatrix, direction: mRot): void {
		// host.movePlayer(this, direction, this.moveDistance);
		this.turnTo(host, direction) // 使用setter以便显示更新
		this.moveForward(host)
	}

	/**
	 * 控制器の主要职责：管理玩家的「基本操作」「行为缓冲区」，与外界操作（控制器等）进行联络
	 * * 目前一个玩家对应一个「控制器」
	 */

	/**
	 * 控制这个玩家的世界控制器
	 */
	protected _controller: PlayerController | null = null
	get controller(): PlayerController | null {
		return this._controller
	}

	/**
	 * 处理与「控制器」的关系
	 */
	protected dealController(host: IMatrix): void {
		// *【2023-10-09 21:19:27】现在也使用「事件分派」而非「特定名称函数」通知控制器了
		this._controller?.reactPlayerEvent<
			NativePlayerEventOptions,
			NativePlayerEvent.TICK
		>(NativePlayerEvent.TICK, this, host, undefined)
	}

	/**
	 * 连接到一个控制器
	 */
	connectController(controller: PlayerController): void {
		// 设置对象
		this._controller = controller
		// 添加订阅
		this._controller.addSubscriber(this)
	}

	/**
	 * 与当前控制器断开
	 */
	disconnectController(): void {
		// 移除订阅
		this._controller?.removeSubscriber(this)
		// 设置对象
		this._controller = null
	}

	/**
	 * 玩家动作缓冲区
	 * * 用于对「控制器异步输入的行为」进行缓存
	 * * 正常情况下应该是空的——即没有「被阻塞」，所有事件在一送进来后便执行
	 */
	protected readonly _actionBuffer: PlayerAction[] = []
	/**
	 * 处理「缓存的玩家操作」
	 * * 逻辑：一次执行完所有缓冲的「玩家动作」，然后清空缓冲区
	 */
	protected dealCachedActions(host: IMatrix): void {
		if (this._actionBuffer.length === 0) return
		else {
			this.runAllActions(host)
			this.clearActionBuffer()
		}
	}

	/**
	 * 执行玩家动作
	 * * 参见`PlayerAction`
	 *
	 * @returns 是否有动作被执行（用于子类覆写添加新行为）
	 */
	protected runAction(host: IMatrix, action: PlayerAction): boolean {
		// 整数⇒处理转向相关
		if (typeof action === 'number') {
			// 非负⇒转向
			if (action >= 0) this.turnTo(host, action)
			// 负数⇒转向&移动
			else this.moveToward(host, -action - 1)
			return true
		}
		// 其它枚举类
		else
			switch (action) {
				case EnumNativePlayerAction.NULL:
					return true
				case EnumNativePlayerAction.MOVE_FORWARD:
					this.moveForward(host)
					return true
				case EnumNativePlayerAction.MOVE_BACK:
					this.turnBack(host)
					this.moveForward(host)
					return true
			}
		// 没有动作被执行
		return false
	}

	/**
	 * 执行所有已缓冲的玩家动作
	 * * 执行所有的玩家动作
	 *
	 * ! 不会清空「动作缓冲区」
	 */
	protected runAllActions(host: IMatrix): void {
		for (
			this._temp_runAllActions_i = 0;
			this._temp_runAllActions_i < this._actionBuffer.length;
			this._temp_runAllActions_i++
		) {
			this.runAction(host, this._actionBuffer[this._temp_runAllActions_i])
		}
	}
	protected _temp_runAllActions_i: uint = 0

	/**
	 * 清除所有的玩家动作
	 * * 技术原理：直接设置length属性
	 */
	protected clearActionBuffer(): void {
		this._actionBuffer.length = 0
	}

	/**
	 * @implements 实现：从「收到世界事件」到「缓冲操作」再到「执行操作」
	 */
	onReceive(
		type: string,
		action: PlayerAction | undefined = undefined
	): void {
		switch (type) {
			// 增加待执行的行为
			case NativeMatrixPlayerEvent.ADD_ACTION:
				if (action === undefined)
					throw new Error('未指定要缓存的行为！')
				this._actionBuffer.push(action)
				break
		}
	}

	// ❤️生命 //

	public static readonly DEFAULT_MAX_HP: int = 100
	public static readonly DEFAULT_HP: int = Player_V1.DEFAULT_MAX_HP

	readonly i_hasHP = true as const
	readonly i_hasHPAndHeal = true as const
	readonly i_hasHPAndLives = true as const

	/** 玩家内部生命值 */
	protected _HP: uint = Player_V1.DEFAULT_HP
	/**
	 * 玩家生命值
	 *
	 * !【2023-09-28 20:31:19】注意：生命值的更新（触发「伤害」「死亡」等事件）涉及母体，非必要不要走这个setter
	 * * 请转向「专用方法」如`addHP`
	 */
	get HP(): uint {
		return this._HP
	}
	set HP(value: uint) {
		if (value === this._HP) return
		this._HP = intMin(value, this._maxHP)
		// *【2023-09-28 20:32:49】更新还是要更新的
		// if (this._GUI !== null)
		// this._GUI.updateHP(); // TODO: 显示更新
	}

	/** 玩家内部最大生命值 */
	protected _maxHP: uint = Player_V1.DEFAULT_MAX_HP
	/** 玩家生命值 */ // * 设置时无需过母体，故无需只读
	get maxHP(): uint {
		return this._maxHP
	}
	set maxHP(value: uint) {
		if (value === this._maxHP) return
		this._maxHP = value
		if (value < this._HP) this._HP = value
		// this._GUI.updateHP(); // TODO: 显示更新
	}

	/** 玩家的「治疗值」（储备生命值） */
	protected _heal: uint = 0
	/** 玩家储备生命值 */ // * 设置时无需过母体，故无需只读
	get heal(): uint {
		return this._heal
	}
	set heal(value: uint) {
		if (value === this._heal) return
		this._heal = value
		// this._GUI.updateHP(); // TODO: 显示更新
	}
	/** （衍生）是否满生命值 */
	get isFullHP(): boolean {
		return this._HP >= this._maxHP
	}
	/** （衍生）是否空生命值 */
	get isEmptyHP(): boolean {
		return this._HP == 0
	}
	/** 玩家的「生命百分比」 */
	get HPPercent(): number {
		return this.HP / this.maxHP
	}

	/** 上一个伤害它的玩家（弃用） */
	// protected _lastHurtByPlayer: IPlayer | null = null;
	/** 伤害延时（用于陷阱等「持续伤害玩家」的伤害源） */
	protected _damageDelay: int = 0
	/** 治疗延时（用于在「储备生命值」治疗玩家时延时） */
	protected _healDelay: uint = 0

	/**
	 * 增加生命值
	 * * 需要母体以处理「伤害」「死亡」事件
	 */
	addHP(host: IMatrix, value: uint, healer: IPlayer | null = null): void {
		this.HP += value
		this.onHeal(host, value, healer)
	}

	removeHP(
		host: IMatrix,
		value: uint,
		attacker: IPlayer | null = null
	): void {
		// 非致死⇒受伤
		if (this.HP > value) {
			this.HP -= value
			// 触发钩子
			this.onHurt(host, value, attacker)
		}
		// 致死⇒死亡
		else {
			this.HP = 0
			// 触发钩子
			this.onDeath(host, value, attacker)
		}
	}

	// 生命值文本
	get HPText(): string {
		const HPText: string = `${this._HP}/${this._maxHP}`
		const healText: string = this._heal === 0 ? '' : `<${this._heal}>`
		const lifeText: string = this._lifeNotDecay ? '' : `[${this._lives}]`
		return HPText + healText + lifeText
	}

	/**
	 * 处理「储备生命值」
	 * * 功能：实现玩家「储备生命值」的「储备」效果
	 * * 📌机制：生命百分比越小，回复速度越快
	 *
	 * 逻辑：
	 * * 无「储备生命值」⇒不进行处理
	 * * 「治疗延时」达到一定值后：
	 *   * 生命值满⇒不处理
	 *   * 未满⇒将一点「储备生命值」移入「生命值」
	 *   * 重置「治疗延时」
	 * * 否则：
	 *   * 持续计时
	 */
	protected dealHeal(): void {
		if (this._heal < 1) return
		if (this._healDelay > TPS * (0.1 + this.HPPercent * 0.15)) {
			if (this.isFullHP) return
			this._healDelay = 0
			this._heal--
			this.HP++
		} else {
			this._healDelay++
		}
	}

	/** 玩家的剩余生命数 */
	protected _lives: uint = 0
	get lives(): uint {
		return this._lives
	}
	set lives(value: uint) {
		if (value !== this._lives) {
			this._lives = value
			// this._GUI.updateHP(); // TODO: 显示更新
		}
	}

	/** 玩家剩余生命数是否会随「死亡」而减少 */
	protected _lifeNotDecay: boolean = false
	get lifeNotDecay(): boolean {
		return this._lifeNotDecay
	}
	set lifeNotDecay(value: boolean) {
		if (value !== this._lifeNotDecay) {
			this._lifeNotDecay = value
			// this._GUI.updateHP(); // TODO: 显示更新
		}
	}

	/**
	 * 重生刻
	 * * `-1`意味着「不在重生时」
	 */
	protected _respawnTick: int = -1
	/** 玩家是否在重生 */
	get isRespawning(): boolean {
		return this._respawnTick >= 0
	}

	/**
	 * （原`isCertainlyOut`）玩家是否「耗尽生命」
	 * * 机制：剩余生命值=0 && 剩余生命数=0
	 */
	get isNoLives(): boolean {
		return this.HP == 0 && this.lives == 0
	}

	/**
	 * 以整数设置生命
	 * * 负数⇒无限
	 *
	 * @param lives 生命数
	 */
	setLifeByInt(lives: int): void {
		// 负数⇒无限
		if (lives < 0) {
			this._lifeNotDecay = true
		}
		// 非负⇒有限
		else {
			this._lifeNotDecay = false
			this._lives = lives
		}
	}
	/**
	 * 处理「重生」
	 * * 功能：实现玩家在「死后重生」的等待时间
	 * * 重生后「剩余生命值」递减
	 *
	 * 逻辑：
	 * * 「重生延时」递减
	 * * 到一定程度后⇒处理「重生」
	 *   * 重置到「未开始计时」状态
	 *   * 自身「剩余生命数」递减
	 *   * 调用世界机制代码，设置玩家在世界内的状态
	 *	 * 寻找并设置坐标在「合适的重生点」
	 *	 * 生成一个「重生」特效
	 *   * 发送事件「重生时」
	 */
	protected dealRespawn(host: IMatrix): void {
		if (this._respawnTick > 0) this._respawnTick--
		else {
			this._respawnTick = -1
			if (!this._lifeNotDecay && this._lives > 0) this._lives--
			// 自身回满血
			this._HP = this._maxHP // ! 无需显示更新
			// 触发母体响应：帮助安排位置、添加特效等
			respawnPlayer(host, this)
			this.onRespawn(host)
		}
	}

	// 📍位置 //

	// 有方向实体
	protected _direction: mRot
	get direction(): mRot {
		return this._direction
	}
	set direction(value: mRot) {
		this._direction = value
	}

	// 格点实体
	// readonly i_inGrid = true as const;

	protected _position: iPoint = new iPoint()
	get position(): iPoint {
		return this._position
	}
	setPosition(host: IMatrix, position: iPoint, needHook: boolean): void {
		// * 原Entity中`setXY`、`setPosition`的事 * //
		// !【2023-10-08 17:13:08】在涉及「设置内部状态」的地方，统一调用钩子函数，不处理涉及母体的逻辑
		// 位置更改前
		if (needHook) this.onLocationChange(host, this._position)
		// 更改位置
		if (position === this._position)
			console.trace(
				'不建议「先变更位置」，再`setPosition`的「先斩后奏」方法'
			)
		this._position.copyFrom(position)
		// 位置更改后
		if (needHook) this.onLocationChanged(host, this._position)
	}
	public static readonly MAX_DAMAGE_DELAY: uint = 0.5 * FIXED_TPS

	/**
	 * 在玩家位置改变时「测试移动」
	 * * 【2023-09-23 16:56:03】目前的功能就是「测试移动」
	 * * 现在使用自身位置作「更新后位置」
	 *
	 * ! 这个因为涉及封装玩家的内部变量，所以不能迁移至「原生世界机制」中
	 *
	 * !【2023-10-13 01:37:44】现在完全作为「玩家内部函数」使用（不再依赖母体回调）
	 *
	 * 迁移前逻辑：
	 * * 调用世界处理「『在方块内时』动作」
	 *   * 如果调用者「忽略冷却」则不论如何立即开始
	 *   * 如果进行了动作，则重置冷却时间（固定值）
	 * * 若非「忽略冷却」，开始降低冷却（计数递减）
	 *   * 递减到0时停止递减，等待下一个处理
	 *   * 且一般只在位置更新/方块更新后才开始——一旦「当前位置无需额外处理动作」就停下来
	 *
	 * @param host 所处的母体
	 * @param ignoreDelay 是否忽略「方块伤害」等冷却直接开始
	 * @param isLocationChange 是否为「位置改变」引发的
	 */
	protected dealMoveInTest(
		host: IMatrix,
		ignoreDelay: boolean = false,
		isLocationChange: boolean = false
	): void {
		// 忽略（强制更新）伤害延迟⇒立即开始判定
		if (ignoreDelay) {
			playerMoveInTest(host, this, isLocationChange) // !原`Game.moveInTestPlayer`，现在已经提取到「原生世界机制」中
			this._damageDelay = Player_V1.MAX_DAMAGE_DELAY
		}
		// 否则，若「伤害延迟」未归零⇒伤害延迟递减
		else if (this._damageDelay > 0) {
			this._damageDelay--
		}
		// 否则，「伤害延迟」归零 && 方块对玩家执行了副作用⇒「伤害延迟」重置（&&继续）
		else if (
			this._damageDelay == 0 &&
			playerMoveInTest(host, this, isLocationChange)
		) {
			// !原`Game.moveInTestPlayer`，现在已经提取到「原生世界机制」中
			this._damageDelay = Player_V1.MAX_DAMAGE_DELAY
		}
		// 否则⇒停止状态检测
		else if (this._damageDelay > -1) {
			this._damageDelay = -1
		}
	}

	protected _temp_testCanGoForward_P: iPoint = new iPoint()
	testCanGoForward(
		host: IMatrix,
		rotatedAsRot: number = this._direction,
		avoidHurt: boolean = false,
		avoidOthers: boolean = false,
		others: IEntityInGrid[] = []
	): boolean {
		return this.testCanGoTo(
			host,
			host.map.towardWithRot_II(
				this._temp_testCanGoForward_P.copyFrom(this.position),
				rotatedAsRot,
				1
			),
			avoidHurt,
			avoidOthers,
			others
		)
	}

	testCanGoTo(
		host: IMatrix,
		p: iPointRef,
		avoidHurt: boolean = false,
		avoidOthers: boolean = true,
		others: IEntityInGrid[] = []
	): boolean {
		return host.map.testCanPass_I(
			p,
			true,
			false,
			false,
			avoidHurt,
			avoidOthers,
			others
		)
	}

	// 📌钩子 //
	public onHeal(
		host: IMatrix,
		amount: number,
		healer: IPlayer | null
	): void {}
	public onHurt(
		host: IMatrix,
		damage: number,
		attacker: IPlayer | null
	): void {}
	public onDeath(
		host: IMatrix,
		damage: number,
		attacker: IPlayer | null
	): void {}
	public onKillOther(host: IMatrix, victim: IPlayer, damage: number): void {}
	public onRespawn(host: IMatrix): void {}
	public onLocationChange(host: IMatrix, oldP: intPoint): void {}
	public onLocationChanged(host: IMatrix, newP: intPoint): void {}
	public onPositedBlockUpdate(
		host: IMatrix,
		ignoreDelay: boolean,
		isLocationChange: boolean
	): void {}

	// 🎨显示 //

	readonly i_displayable = true as const

	/** 线条颜色 */
	protected _lineColor: uint = 0x888888
	get lineColor(): uint {
		return this._lineColor
	}
	/** 填充颜色1 */
	protected _fillColor: uint = 0xffffff
	get fillColor(): uint {
		return this._fillColor
	}
	/** 用于判断「装饰类型」的标记 */
	decorationLabel: NativeDecorationLabel = NativeDecorationLabel.EMPTY

	shapeInit(shape: IShape, ...params: unknown[]): void {}
	shapeRefresh(shape: IShape): void {}
	shapeDestruct(shape: IShape): void {}

	/** 堆叠覆盖层级：默认是「玩家」层级 */
	protected _zIndex: uint = DisplayLayers.PLAYER
	get zIndex(): uint {
		return this._zIndex
	}
	set zIndex(value: uint) {
		this._zIndex = value
	}
}
