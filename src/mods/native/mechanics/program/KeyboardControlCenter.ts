import { KeyCode } from 'matriangle-common/keyCodes'
import { omega, voidF } from 'matriangle-common/utils'
import { uint } from 'matriangle-legacy'
import {
	MatrixProgram,
	MatrixProgramLabel,
} from 'matriangle-api/server/control/MatrixProgram'
import Entity from 'matriangle-api/server/entity/Entity'
import { IEntityActiveLite } from 'matriangle-api/server/entity/EntityInterfaces'
import { FIXED_TPS } from 'matriangle-api/server/main/GlobalWorldVariables'
import {
	EnumNativePlayerAction,
	NativeMatrixPlayerEvent,
	PlayerAction,
} from '../../entities/player/controller/PlayerAction'
import IPlayer from '../../entities/player/IPlayer'

/**
 * 有关「按下一个按键对应的行为」
 * * 定义这个按键在「按下」「释放」时产生的行为
 */
export interface IKeyBehavior {
	/**
	 * 每次「激活」时的回调函数
	 * * 应用：高度自定义的按键行为
	 *   * 一般用于控制玩家，发送「玩家行为」就已足够
	 * * 均通过「闭包」使用「纯空函数」类型，不依赖其它参数
	 *
	 * !【2023-10-14 10:42:42】不设置「具体对应玩家行为」旨在保护通用性
	 * * 日后便可用在玩家之外的地方，比如「调试键」的回归
	 */
	callback: voidF

	/**
	 * 每次「按下」时的回调函数
	 * * 一般与「激活」一致
	 */
	callbackPress: voidF

	/**
	 * 每次「释放」时的回调函数
	 */
	callbackRelease: voidF

	/**
	 * 「持续激活」间隔
	 * * 会模拟「初次按下后激活一次，等待一段时间开始短间隔不断激活」的效果
	 *   * 时序：`|     | | | | | | ...`
	 * * 特殊配置：
	 *   * 0：持续短间隔不断激活
	 *   * -1：禁用「短间隔不断激活」
	 */
	continuousDelay: uint | -1

	/**
	 * 「持续激活」循环
	 * * 决定「短间隔不断激活」的周期
	 * * 在{@link continuousDelay} < 0时不起效
	 */
	continuousLoop: uint

	/**
	 * 可自定义的「复制」函数
	 * * 只需浅拷贝
	 * * 用于克隆自定义状态
	 */
	copy?(): IKeyBehavior
}

/**
 * （使用浅拷贝）复制按键行为
 *
 * ! 会将原先
 *
 * @param b 待复制的按键行为
 */
export function copyKeyBehavior(b: IKeyBehavior): IKeyBehavior {
	return (
		b?.copy?.() ?? {
			callback: b.callback,
			callbackPress: b.callbackPress,
			callbackRelease: b.callbackRelease,
			continuousDelay: b.continuousDelay,
			continuousLoop: b.continuousLoop,
		}
	)
}

/**
 * 按键行为的析构
 * * 仅清除`callback`的引用
 */
export function destructKeyBehavior(b: IKeyBehavior): void {
	;(b.callback as unknown) = undefined
}

/**
 * 记录所有的「键盘按下行为」
 * * 每个按键对应一个行为
 */
export interface IKeyBehaviorRecords {
	[code: KeyCode]: IKeyBehavior
}

/**
 * 记录一个「按键行为」的状态
 * * 应用：存储「持续激活」
 */
export class KeyControlState {
	/**
	 * 基于「按键行为」生成新的「按键状态」
	 *
	 * @param behavior 所基于的「按键行为」
	 * @returns 一个由「按键行为」决定的「按键状态」
	 */
	public static fromBehavior(behavior: IKeyBehavior): KeyControlState {
		return new KeyControlState(
			behavior.callback,
			behavior.callbackPress,
			behavior.callbackRelease,
			behavior.continuousDelay,
			behavior.continuousLoop
		)
	}

	/**
	 * 按键「持续短间隔激活」的循环周期
	 * * 基本机制：
	 *   * 在{@link resetTime}中会被重置为{@link keyMaxDelay}，代表按键初次按下到「持续短间隔激活」的延时
	 *   * 随后会在触发一次{@link callback}后被重置为{@link keyMaxLoop}，代表「持续短间隔激活」的周期
	 *
	 * @default 最大值
	 */
	public keyDelay: uint = this.keyMaxDelay

	/**
	 * 这个键是否按下
	 * @default 未按下
	 */
	public isPressed: boolean = false

	// 构造&析构 //

	/**
	 * 构造函数
	 */
	public constructor(
		/**
		 * 按键「激活」时触发的回调函数
		 * @default 纯空函数（执行后无任何作用）
		 */
		public callback: voidF = omega,
		/**
		 * 按键「按下」时触发的回调函数
		 * @default 与callback一致
		 */
		public callbackPress: voidF = omega,
		/**
		 * 按键「释放」时触发的回调函数
		 * @default 纯空函数（执行后无任何作用）
		 */
		public callbackRelease: voidF = omega,
		/**
		 * 这个键在「初次按下」后、进入「持续短间隔激活」前的「等待时长」
		 * @default 禁用
		 */
		public keyMaxDelay: uint | -1 = -1,
		/**
		 * 这个键在进入「持续短间隔激活」后的「循环周期」
		 * @default 半秒
		 */
		public keyMaxLoop: uint = FIXED_TPS << 1
	) {}

	/**
	 * 析构
	 * * 主要是释放各类回调函数（在闭包里）的引用
	 *
	 * ! 注意：在调用析构函数后，理应不再使用
	 */
	public destructor(): void {
		// 清空callback的引用
		;(this.callback as unknown) = undefined
		;(this.callbackPress as unknown) = undefined
		;(this.callbackRelease as unknown) = undefined
	}

	// 主逻辑

	/**
	 * 重置时间状态
	 * * 不包括「是否按下」
	 */
	public resetTime(): void {
		this.keyDelay = 0
		this.keyDelay = this.keyMaxDelay
	}

	/**
	 * 开始按下
	 * * 「按下状态」开启
	 * * 「主循环函数」选择性起效
	 * * 回调「按下」
	 *
	 * !【2023-10-14 11:30:27】主要设计目的：分离功能，可避免在循环时不断判断状态
	 */
	public press(): void {
		// 只有第一次按下时起效（防止「连续按下又不释放」的情况）
		if (!this.isPressed) {
			this.tick = this.notContinuous ? omega : this._tick
			this.resetTime()
			this.callbackPress()
			this.isPressed = true
		}
	}

	/**
	 * 按键释放
	 * * 「按下状态」关闭
	 * * 「主循环函数」失效
	 * * 重置「时间状态」
	 * * 回调「释放」
	 */
	public release(): void {
		if (this.isPressed) {
			this.tick = omega
			this.resetTime()
			this.callbackRelease()
			this.isPressed = false
		}
	}

	/**
	 * 是否不是「初次按下→持续短间隔激活」模式
	 *
	 * !【2023-10-14 12:31:26】使用「not」主要是用小于号提升性能
	 */
	public get notContinuous(): boolean {
		return this.keyMaxDelay < 0
	}

	/**
	 * （外部）主循环
	 * * 使用「函数指针」提升性能，以减少不必要的判断
	 *   * 核心作用：不使用「每刻判断」实现「{@link keyMaxDelay} < 0⇒禁用」
	 * * 会在「按下/释放」时改为合适的功能
	 */
	public tick: voidF = omega
	/**
	 * （内部）主循环
	 * * 初次按下⇒持续短间隔⇒激活
	 * *
	 */
	protected __tick(): void {
		// 初次按下⇒持续短间隔激活⇒持续短间隔
		if (this.keyDelay > 0) this.keyDelay--
		// 激活 `this.keyDelay === 0`
		else {
			this.keyDelay = this.keyMaxLoop
			this.callback()
		}
	}
	/** 目的：用空间换时间——省去一次`bind` */
	protected readonly _tick: voidF = this.__tick.bind(this)
}

/**
 * 记录所有的「键控状态」
 * * 每个按键对应一个状态
 */
export interface KeyControlStateRecords {
	[code: KeyCode]: KeyControlState
}

/**
 * 从「按键行为」生成默认（空的）按键状态
 */
function generateStatesFromBehavior(behavior: IKeyBehavior): KeyControlState {
	return KeyControlState.fromBehavior(behavior)
}

/**
 *「键盘控制中心」是
 * * 一个接受键盘信号，解析并以此运行代码（控制玩家）的
 * * 充当「按键信号分发中心」的角色的
 * * 可以统一设置「玩家控制」与「调试键」等操作的
 * * 只需要接收「世界刻信号」而无需获得其「母体引用」的
 * 母体程序
 *
 * !【2023-10-06 21:56:17】现在因为能直接使用HTTP/WebSocket发送操作，这个程序接近废弃
 */
export default class KeyboardControlCenter
	extends MatrixProgram
	implements IEntityActiveLite
{
	/** 标签 */
	public static readonly LABEL: MatrixProgramLabel = 'KeyboardController'

	// 配置 //
	/**
	 * 记录所有登记在册的「按键行为」
	 */
	protected readonly _keyBehaviors: IKeyBehaviorRecords = {}
	/**
	 * 根据按键释放「按键行为」
	 *
	 * ! 会触发相应「按键行为」的析构函数
	 */
	public releaseKeyBehavior(code: KeyCode): void {
		if (code in this._keyBehaviors)
			destructKeyBehavior(this._keyBehaviors[code])
		delete this._keyBehaviors[code]
	}
	/**
	 * 释放所有按键行为
	 *
	 * ! 会触发「按键行为」的析构函数
	 * * 通过「在注册时复制」
	 */
	public releaseAllKeyBehavior(): void {
		for (const code in this._keyBehaviors) {
			// * 虽然在JS中键控代码在「按键行为」中以字符串形式存储，但它还是能索引到值
			this.releaseKeyBehavior(code as unknown as KeyCode)
		}
	}

	/**
	 * 记录所有登记在册的「按键状态」
	 */
	protected readonly _keyControlStates: KeyControlStateRecords = {}
	/**
	 * 根据按键释放「按键状态」
	 *
	 * ! 会触发相应「按键状态」的析构函数
	 */
	public releaseKeyControlState(code: KeyCode): void {
		this._keyControlStates?.[code].destructor()
		delete this._keyControlStates[code]
	}
	/**
	 * 释放所有按键状态
	 *
	 * ! 会触发「按键状态」的析构函数
	 * * 其本身就与「按键行为」绑定
	 */
	public releaseAllControlState(): void {
		for (const code in this._keyControlStates) {
			// * 虽然在JS中键控代码在「按键行为」中以字符串形式存储，但它还是能索引到值
			this.releaseKeyControlState(code as unknown as KeyCode)
		}
	}

	// 构造 & 析构 //

	/**
	 * 构造函数
	 */
	public constructor(behaviors?: IKeyBehaviorRecords) {
		super(KeyboardControlCenter.LABEL)
		if (behaviors !== undefined) this.addKeyBehaviors(behaviors)
	}

	/**
	 * 析构函数
	 * * 释放所有登记在册的「按键行为」「按键状态」
	 */
	override destructor(): void {
		this.releaseAllKeyBehavior()
		this.releaseAllControlState()

		super.destructor()
	}

	/**
	 * 复制&初始化「按键行为」
	 * * 会（浅）拷贝原先的「按键行为」
	 * * 会根据「按键行为」构建并添加「按键状态」
	 *
	 * @param behaviors （新增的）按键行为记录表
	 */
	public addKeyBehavior(code: KeyCode, behavior: IKeyBehavior): void {
		if (code in this._keyBehaviors)
			console.warn(
				`copyAndInitKeyBehavior: 正在覆盖${code}所对应的按键行为！`
			)
		// 开始设置
		this._keyBehaviors[code] = copyKeyBehavior(behavior)
		this._keyControlStates[code] = generateStatesFromBehavior(behavior)
	}

	/**
	 * 复制&初始化「按键行为」
	 * * 会（浅）拷贝原先的「按键行为」
	 * * 会根据「按键行为」构建并添加「按键状态」
	 *
	 * @param behaviors （新增的）按键行为记录表
	 */
	public addKeyBehaviors(behaviors: IKeyBehaviorRecords): void {
		for (const code in behaviors) {
			this.addKeyBehavior(code as unknown as KeyCode, behaviors[code])
		}
	}

	// 🕹️控制 //
	/** 轻量级活跃实体 */
	i_activeLite = true as const

	/**
	 * @implements 实现：遍历所有状态，直接触发「循环」
	 * * 至于「状态是否能循环」要看「状态」自身（可能`tick`指向`omega`，这时候就不会在实际上触发循环）
	 */
	onTick(remove: (entity: Entity) => void): void {
		for (const code in this._keyControlStates)
			this._keyControlStates[code].tick()
	}

	/**
	 * 按键按下事件
	 * * 逻辑：状态中有对应代码⇒通知
	 */
	public onPress(code: KeyCode): void {
		// ↓本身在索引时，数字和字符串就不区分
		if (code in this._keyControlStates) this._keyControlStates[code].press()
	}

	/**
	 * 按键释放事件
	 * * 逻辑：状态中有对应代码⇒通知
	 */
	public onRelease(code: KeyCode): void {
		// ↓本身在索引时，数字和字符串就不区分
		if (code in this._keyControlStates)
			this._keyControlStates[code].release()
	}
}

// 对接玩家 //

/**
 * 「玩家控制配置」
 * * 用于配置单个玩家的「按键操作方式」
 * * 核心：按键代码⇒事件
 *
 * 四种配置：
 * * 单个行为：「激活=按下」动作
 * * [行为]：单「激活」动作
 * * [行为, 行为]：按下/释放时动作
 * * [行为, 行为, 行为]：激活/按下/释放时动作
 */
export interface PlayerControlConfig {
	[code: KeyCode]:
		| PlayerAction // 「激活=按下」动作
		| [PlayerAction] // 单「激活」动作
		| [PlayerAction, PlayerAction] // 按下/释放时动作
		| [PlayerAction, PlayerAction, PlayerAction] // 激活/按下/释放时动作
}

/**
 * 「初次按下⇒持续短间隔激活」的默认时长
 * @default 0.5秒
 */
export const DEFAULT_CONTINUOUS_DELAY: uint = uint(FIXED_TPS >> 1)
/**
 * 「持续短间隔激活」的默认周期
 * @default 30ms（来自浏览器实验）
 */
export const DEFAULT_CONTINUOUS_LOOP: uint = uint(FIXED_TPS * (30 / 1000))
/**
 * 根据玩家和键位设置，生成「按键行为」
 *
 * 根据「玩家控制配置」有四种配置：
 *  * 默认配置：「激活」「按下」一致
 *  * 1长数组：只有「激活」
 *  * 2长数组：无「激活」，仅「按下」「释放」
 *  * 3长数组：「激活」「按下」「释放」依次排列（排除「空行为」）
 *
 * @param player 需要对接的玩家
 * @param pcc 对应的「玩家键位设置」
 * @param continuousDelay 「初次按下→持续短间隔激活」间隔
 * @param continuousLoop 「持续短间隔激活」间隔
 * @returns 生成好的「按键行为」（一个普通的对象）
 */
export function generateBehaviorFromPlayerConfig(
	player: IPlayer,
	pcc: PlayerControlConfig,
	continuousDelay: uint = DEFAULT_CONTINUOUS_DELAY,
	continuousLoop: uint = DEFAULT_CONTINUOUS_LOOP
): IKeyBehaviorRecords {
	const result: IKeyBehaviorRecords = {}
	let runAction: voidF
	for (const code in pcc) {
		// 使用数组精确配置
		if (Array.isArray(pcc[code]))
			switch ((pcc[code] as Array<PlayerAction>).length) {
				// * 1长数组：只有「激活」
				case 1: {
					result[code] = {
						callback:
							(pcc[code] as Array<PlayerAction>)[0] ===
							EnumNativePlayerAction.NULL
								? omega
								: (): void =>
										void player.onReceive(
											NativeMatrixPlayerEvent.ADD_ACTION,
											(pcc[code] as PlayerAction[])[0]
										),
						callbackPress: omega,
						callbackRelease: omega,
						continuousDelay: continuousDelay,
						continuousLoop: continuousLoop,
					}
					break
				}
				// * 2长数组：无「激活」，仅「按下」「释放」
				case 2: {
					result[code] = {
						callback: omega,
						callbackPress:
							(pcc[code] as Array<PlayerAction>)[0] ===
							EnumNativePlayerAction.NULL
								? omega
								: (): void =>
										void player.onReceive(
											NativeMatrixPlayerEvent.ADD_ACTION,
											(pcc[code] as PlayerAction[])[0]
										),
						callbackRelease:
							(pcc[code] as Array<PlayerAction>)[1] ===
							EnumNativePlayerAction.NULL
								? omega
								: (): void =>
										void player.onReceive(
											NativeMatrixPlayerEvent.ADD_ACTION,
											(pcc[code] as PlayerAction[])[1]
										),
						continuousDelay: continuousDelay,
						continuousLoop: continuousLoop,
					}
					break
				}
				// * 3长数组：「激活」「按下」「释放」依次排列（排除「空行为」）
				case 3: {
					result[code] = {
						callback:
							(pcc[code] as Array<PlayerAction>)[0] ===
							EnumNativePlayerAction.NULL
								? omega
								: (): void =>
										void player.onReceive(
											NativeMatrixPlayerEvent.ADD_ACTION,
											(pcc[code] as PlayerAction[])[0]
										),
						callbackPress:
							(pcc[code] as Array<PlayerAction>)[1] ===
							EnumNativePlayerAction.NULL
								? omega
								: (): void =>
										void player.onReceive(
											NativeMatrixPlayerEvent.ADD_ACTION,
											(pcc[code] as PlayerAction[])[1]
										),
						callbackRelease:
							(pcc[code] as Array<PlayerAction>)[2] ===
							EnumNativePlayerAction.NULL
								? omega
								: (): void =>
										void player.onReceive(
											NativeMatrixPlayerEvent.ADD_ACTION,
											(pcc[code] as PlayerAction[])[2]
										),
						continuousDelay: continuousDelay,
						continuousLoop: continuousLoop,
					}
					break
				}
			}
		// * 默认配置：「激活」「按下」一致
		else {
			runAction = (): void =>
				void player.onReceive(
					NativeMatrixPlayerEvent.ADD_ACTION,
					pcc[code] as PlayerAction
				)
			result[code] = {
				callback: runAction,
				callbackPress: runAction,
				callbackRelease: omega,
				continuousDelay: continuousDelay,
				continuousLoop: continuousLoop,
			}
		}
	}
	return result
}
