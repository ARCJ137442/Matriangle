import { int, uint } from '../../../../legacy/AS3Legacy'
import { iPoint, iPointRef } from '../../../../common/geometricTools'
import {
	IEntityActive,
	IEntityDisplayable,
	IEntityHasHPAndHeal,
	IEntityHasHPAndLives,
	IEntityInGrid,
	IEntityWithDirection,
} from '../../../../api/server/entity/EntityInterfaces'
import IMatrix from '../../../../api/server/main/IMatrix'
import { mRot } from '../../../../api/server/general/GlobalRot'
import PlayerController from './controller/PlayerController'
import { IMatrixEventReceiver } from '../../../../api/server/control/MatrixControl'
import Entity from '../../../../api/server/entity/Entity'
import { PlayerAction } from './controller/PlayerAction'
import { NativeDecorationLabel } from './DecorationLabels'

/**
 * 「玩家」是
 * * 作为「格点实体」的
 * * 有朝向的
 * * 可被显示的
 * * 可以被「玩家控制器」控制的
 * 实体
 *
 * 目前作为「核心功能」存在的，主要有如下模块：
 * * 🏷️名称
 * * 🕹️控制
 * * 📍位置
 * * ❤️生命
 * * 📌钩子
 * * 🎨显示
 *
 * 以上六大功能作为一种「最小实现」用于通用目的，其中五种功能均可定制化乃至弃用：
 * * 🏷️名称：使用常量而非名称做标识
 * * 🕹️控制：不连接到任何控制器
 * * ❤️生命：覆盖禁止生命减少
 * * 📌钩子：不进行调用
 * * 🎨显示：不连接到「可显示实体」
 */
export default interface IPlayer
	extends IEntityInGrid,
		IEntityActive,
		IEntityDisplayable,
		IEntityWithDirection,
		IEntityHasHPAndHeal,
		IEntityHasHPAndLives,
		IMatrixEventReceiver {
	/**
	 * 用于替代`instanceof`
	 */
	readonly i_isPlayer: true

	// 🏷️名称 //

	/** 玩家的「自定义名称」（不受「国际化文本」影响） */
	get customName(): string
	set customName(value: string)

	// 🕹️控制 //

	/**
	 * 获取玩家的「控制器」
	 *
	 * ? 目前还是有些存疑：是否只需要控制器一方控制？但实际上必须由玩家向控制器分派事件
	 */
	get controller(): PlayerController | null // !【2023-10-05 01:19:13】重新启用，以作为玩家一侧的请求

	/**
	 * 连接到一个控制器
	 */
	connectController(controller: PlayerController): void

	/**
	 * 与当前控制器断开
	 */
	disconnectController(): void

	/**
	 * 接收操作
	 * * 功能：
	 *   * 「添加行为」⇒直接添加到「缓存的行为」中
	 *
	 * @param type
	 * @param args
	 */
	onReceive(type: string, action?: PlayerAction): void

	/**
	 * * 下面是一些用于「从IO中读取并执行」的「基本操作集合」
	 */

	/**
	 * （控制）玩家向某个方向移动一格，并且不改变自身朝向
	 */
	moveParallel(host: IMatrix, direction: mRot): void

	/**
	 * （控制）玩家向前移动（一格）
	 * * 📌【2023-10-15 11:22:17】现在相当于「朝自身朝向平行前进」
	 *
	 * !【2023-09-27 20:19:33】现在废除了「非整数前进」，因为已经锁定玩家为「格点实体」
	 * * 同时也废除了「不定长度前进」，限定为「只前进一格」
	 */
	moveForward(host: IMatrix): void

	/**
	 * （控制）玩家向某个方向移动（一格）
	 * * 📌实际上相当于「转向+前进」
	 */
	moveToward(host: IMatrix, direction: mRot): void

	// ! 原先一些「向固定朝向旋转」的功能已停用

	/**
	 * （控制）玩家转向指定方向
	 * * 为何要附上母体参数？其本身可能要触发一些钩子函数什么的
	 * @param host 所依附的母体
	 * @param direction 要转向的方向
	 */
	turnTo(host: IMatrix, direction: mRot): void

	/**
	 * （控制）玩家转向后方
	 * * 为何要附上母体参数？其本身可能要触发一些钩子函数什么的
	 */
	turnBack(host: IMatrix): void

	/**
	 * （可选）（控制玩家）向指定方向旋转
	 * * 与`turnTo`的区别：这是「相对方向」旋转
	 * * 详情参见`rotate_M`
	 *
	 * ! 注意：不能连续使用两次「协轴相同的旋转」
	 * * 原因：第一次旋转时，玩家方向已经与协轴方向一致，导致第二次无法构造「旋转平面」
	 *
	 * @param coaxis 旋转的「协轴」，与玩家的「当前朝向」构成整个「旋转平面」
	 * @param 经过旋转的「任意维整数角」
	 */
	turnRelative?(host: IMatrix, coaxis: uint, step?: int): void

	// ❤️生命 //

	/**
	 * 增加生命值
	 * * +限定条件：只能与玩家/空对象互动
	 * * 需要母体以处理「伤害」「死亡」事件
	 */
	addHP(host: IMatrix, value: uint, healer: IPlayer | null): void

	/**
	 * 减少生命值
	 * * +限定条件：只能与玩家/空对象互动
	 * * 需要母体以处理「伤害」「死亡」事件
	 */
	removeHP(host: IMatrix, value: uint, attacker: IPlayer | null): void

	// 📍位置 //

	/**
	 * 特别的「设置坐标」函数
	 * * 作为`position`一个特殊的setter
	 * * 用于「坐标变更」逻辑
	 *
	 * @param needHook 是否需要触发「移出」「移入」的钩子
	 *
	 * !【2023-10-08 19:59:25】不建议「先变更位置，然后移动到相同位置」的做法
	 * * 这样会导致玩家「在移动前后的位置」相同，进而影响「方块事件」的判定
	 * * 已知会导致的bug：「玩家移开后『门』关闭，受到窒息伤害」
	 */
	setPosition(host: IMatrix, position: iPointRef, needHook: boolean): void

	/** 实现：所处位置方块更新⇒传递更新（忽略延时、是位置改变） */
	onPositedBlockUpdate(
		host: IMatrix,
		ignoreDelay: boolean,
		isLocationChange: boolean
	): void

	/**
	 * 用于判断「玩家是否可当前位置移动到另一位置」
	 * * 原`Game.testPlayerCanPass`
	 * * 【2023-10-04 18:07:01】不会考虑「移动前坐标」
	 *
	 * TODO: 日后细化「实体类型」的时候，还会分「有碰撞箱」与「无碰撞箱」来具体决定
	 *
	 * @param host 判断所发生在的母体
	 * //@param player 要判断的玩家// !【2023-09-30 12:23:44】现在就直接用this
	 * @param p 位置
	 * @param avoidHurt 避免伤害（主要用于AI）
	 * @param avoidOthers 是否避开其它（格点）实体
	 * @param others 避开的实体列表
	 */
	testCanGoTo(
		host: IMatrix,
		p: iPointRef,
		avoidHurt?: boolean /* = false*/,
		avoidOthers?: boolean /* = true*/,
		others?: IEntityInGrid[] /* =[] */
	): boolean

	/**
	 * （快捷封装）用于判断「玩家是否可向前移动（一格）」
	 *
	 * @param host 判断所发生在的母体
	 * //@param player 要判断的玩家（整数坐标）// !【2023-09-30 12:23:44】现在就直接用this
	 * @param rotatedAsRot 是否采用「特定方向」覆盖「使用玩家方向」
	 * @param avoidOthers 是否包括其他玩家
	 * @param avoidHurt 避免伤害（主要用于AI）
	 * @param others 避开的实体列表
	 */
	testCanGoForward(
		host: IMatrix,
		rotatedAsRot?: uint /* = 5*/,
		avoidHurt?: boolean /* = false*/,
		avoidOthers?: boolean /* = true*/,
		others?: IEntityInGrid[] /* =[] */
	): boolean

	// 📌钩子函数 //
	/**
	 * 事件：（被玩家）治疗，即「生命值增加」
	 * * 在「生命值已发生变化，但尚未发送给母体处理」时调用
	 * * 调用来源：玩家
	 *
	 * @param host 发生在的「世界母体」
	 * @param amount 生命值提升的数量
	 * @param healer 治疗者（可空）
	 */
	onHeal(
		host: IMatrix,
		amount: uint,
		healer: IPlayer | null /*  = null */
	): void

	/**
	 * 事件：（被玩家）伤害，即「生命值减少（但未减为零）」
	 * * 在「生命值已发生变化，但尚未发送给母体处理」时调用
	 * * 调用来源：玩家
	 *
	 * @param host 发生在的「世界母体」
	 * @param damage 伤害值
	 * @param attacker 攻击者（可空）
	 */
	onHurt(
		host: IMatrix,
		damage: uint,
		attacker: IPlayer | null /*  = null */
	): void

	/**
	 * 事件：（被玩家）击杀，即「生命值减少为零」
	 * * 在「生命值已发生变化，但尚未发送给母体处理」时调用
	 * * 调用来源：玩家
	 *
	 * @param host 发生在的「世界母体」
	 * @param damage 伤害值
	 * @param attacker 击杀者（可空）
	 */
	onDeath(
		host: IMatrix,
		damage: uint,
		attacker: IPlayer | null /*  = null */
	): void

	/**
	 * 事件：击杀其它（玩家）
	 * * 在「生命值已发生变化，，但尚未发送给母体处理」时调用
	 * * 调用来源：玩家
	 *
	 * @param host 发生在的「世界母体」
	 * @param victim 受害者
	 * @param damage 伤害值
	 */
	onKillOther(host: IMatrix, victim: IPlayer, damage: uint): void

	/**
	 * 事件：重生
	 * * 在「母体处理完『重生』逻辑，自身血量等状态恢复」后调用
	 * * 调用来源：母体
	 *
	 * @param host 发生在的「世界母体」
	 */
	onRespawn(host: IMatrix): void

	/**
	 * 事件：移动前
	 * * 调用来源：玩家
	 *
	 * @param host 发生在的「世界母体」
	 * @param oldP 旧坐标（一般为自身坐标）
	 */
	onLocationChange(host: IMatrix, oldP: iPoint): void

	/**
	 * 事件：移动后
	 * * 调用来源：玩家
	 *
	 * @param host 发生在的「世界母体」
	 * @param oldP 旧坐标（一般为自身坐标）
	 */
	onLocationChanged(host: IMatrix, newP: iPoint): void

	// 🎨显示 //
	/** 获取（缓存的）十六进制线条颜色 */
	get lineColor(): uint

	/** 获取（缓存的）十六进制填充颜色 */
	get fillColor(): uint

	/** 用于在GUI上显示的文本：生命值+最大生命值+储备生命值+剩余生命数（若生命数有限） */
	get HPText(): string

	/**
	 * 用于判断「装饰类型」的标记
	 * * 用途：玩家自身或在「玩家类特效」从玩家处构造时，用于获取到所有绘制信息
	 */
	decorationLabel: NativeDecorationLabel
}

/**
 * （🚩专用代码迁移）用于在「只有接口」的情况下判断「是否为玩家」
 * * 性质：使得`isPlayer === true`的，必然`instanceof IPlayer`
 * * 推导依据：使用「类型谓词」（返回值中的「is」关键字），告知推导器「返回的是一个『类型判别』」
 * * 参考资料：https://www.jianshu.com/p/57df3cb66d3d
 */
export function isPlayer(e: Entity): e is IPlayer {
	return (e as IPlayer)?.i_isPlayer === true // !【2023-10-04 11:42:51】不能用`hasOwnProperty`，这会在子类中失效
}
