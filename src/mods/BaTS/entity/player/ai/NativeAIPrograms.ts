/* eslint-disable @typescript-eslint/no-unused-vars */
import { randInt } from 'matriangle-common/exMath'
import { uint } from 'matriangle-legacy/AS3Legacy'
import {
	EnumNativePlayerAction,
	PlayerAction,
} from 'matriangle-mod-native/entities/player/controller/PlayerAction'
import { PlayerEvent } from 'matriangle-mod-native/entities/player/controller/PlayerEvent'
import AIControllerGenerator, {
	AIActionGenerator,
} from './AIControllerGenerator'
import { getPlayerActionFromTurn } from 'matriangle-mod-native/entities/player/controller/PlayerAction'
import { i_hasTool } from '../IPlayerHasTool'
import { AIPlayerEvent } from 'matriangle-mod-native/entities/player/controller/AIController'
import { EnumBatrPlayerAction } from '../control/BatrPlayerAction'
import { getPlayers } from 'matriangle-mod-native/mechanics/NativeMatrixMechanics'

/**
 * AI的「微行为」
 * * 集中存储一些AI之间共用的行为
 *   * 例如：随机走动、A*寻路、受攻击本能回避……
 */
export module MicroAIBehaviors {
	/**
	 * 像机器人那样随机走动
	 * * 有一定的「最大行动步数」
	 * * 会在遇到障碍后「随机转向」尝试避障
	 *
	 * @param moveMaxSum 最大移动总数：大致表征「移动了多少次就转向」
	 */
	export function* roboticWalk(
		controller: AIControllerGenerator,
		moveMaxSum: uint
	): AIActionGenerator {
		// 自身程序状态⇒函数局部变量 //
		/** 移动总数：记录当前「移动次数」状态 */
		let moveSum: uint = 0

		// 检查未定义值，不应该的情况就报错 // !【2023-10-02 20:47:35】但实际上只有一次——因为后面如果是`undefined`也会报错（无法访问属性/方法），无需手动检测
		if (controller._temp_currentPlayer === undefined)
			throw new Error(
				'AIProgram_Dummy: controller._temp_currentPlayer is undefined'
			)
		if (controller._temp_currentHost === undefined)
			throw new Error(
				'AIProgram_Dummy: controller._temp_currentHost is undefined'
			)

		// 第一个「没有外界输入」的事件 //
		let event: PlayerEvent = yield EnumNativePlayerAction.MOVE_FORWARD
		// 主循环 //
		while (true) {
			// 移动 //
			// 超过「最大移动总数」 || 前方不可移动⇒随机转向
			if (
				moveSum >= moveMaxSum ||
				!controller._temp_currentPlayer.testCanGoForward(
					controller._temp_currentHost,
					controller._temp_currentPlayer.direction,
					true,
					true,
					getPlayers(controller._temp_currentHost)
				)
			) {
				// 重置「移动总数」
				moveSum = 0
				// 【2023-10-02 20:32:54】随机转向即可，至于「重复寻找碰壁」的问题，不必过于操心
				event = yield getPlayerActionFromTurn(
					controller._temp_currentHost.map.storage.randomForwardDirectionAt(
						controller._temp_currentPlayer.position
					)
				)
			}
			// 否则⇒移动总和递增，持续前进
			else {
				moveSum++
				event = yield EnumNativePlayerAction.MOVE_FORWARD
			}
		}
	}

	/**
	 * 保证所控制的玩家一直在（以最大充能程度）使用武器
	 */
	export function* keepAlwaysUsingTool(
		controller: AIControllerGenerator
	): AIActionGenerator {
		// 检查未定义值，不应该的情况就报错 // !【2023-10-02 20:47:35】但实际上只有一次——因为后面如果是`undefined`也会报错（无法访问属性/方法），无需手动检测
		if (controller._temp_currentPlayer === undefined)
			throw new Error(
				'AIProgram_Dummy: controller._temp_currentPlayer is undefined'
			)
		if (controller._temp_currentHost === undefined)
			throw new Error(
				'AIProgram_Dummy: controller._temp_currentHost is undefined'
			)

		// 第一个「没有外界输入」的事件 //
		let event: PlayerEvent = yield EnumBatrPlayerAction.START_USING
		// 主循环 //
		while (true) {
			// 「有工具机制」⇒正常进行 // * 为何放里面呢？因为这控制器可能控制不止一个玩家
			if (i_hasTool(controller._temp_currentPlayer))
				if (controller._temp_currentPlayer.tool.reverseCharge) {
					// 不停使用工具：持续按下「使用」键 //
					event = yield controller._temp_currentPlayer.tool
						.chargingPercent >= 1
						? EnumBatrPlayerAction.START_USING // 已充能完毕⇒使用
						: controller._temp_currentPlayer.isUsing // 否则⇒不要使用
						? EnumBatrPlayerAction.STOP_USING
						: EnumNativePlayerAction.NULL // 兜底：返回空行为
					continue // !【2023-10-02 20:37:49】这个`continue`是必须的：若yield后还有代码会被执行，则下一次分派事件时就会无视一开始的过滤逻辑
				}
				// 否则，未使用⇒使用
				else if (!controller._temp_currentPlayer.isUsing) {
					event = yield EnumBatrPlayerAction.START_USING
					continue // !【2023-10-02 20:37:49】这个`continue`是必须的：若yield后还有代码会被执行，则下一次分派事件时就会无视一开始的过滤逻辑
				}
				// 空闲⇒返回空行为
				else {
					yield EnumNativePlayerAction.NULL
					continue
				}
			// 否则⇒返回空
			else yield EnumNativePlayerAction.NULL
		}
	}
}

/**
 * 使用「行为生成器」的形式，用生成函数还原所有先前的「AI程序」
 */
export module NativeAIPrograms {
	/**
	 * （迁移自BaTr）最简单的AI程序之一
	 * * 随机的四处走动
	 * * 不断使用其工具
	 *
	 * @param controller 传入的「控制器」状态
	 */
	export function* AIProgram_Dummy(
		controller: AIControllerGenerator
	): AIActionGenerator {
		// 初始化所有子行为
		const rWalk: AIActionGenerator = MicroAIBehaviors.roboticWalk(
			controller,
			4 + randInt(16) // 这是个硬编码
		)
		const aUsing: AIActionGenerator =
			MicroAIBehaviors.keepAlwaysUsingTool(controller)

		// 第一个「没有外界输入」的事件 //
		let event: PlayerEvent = yield EnumNativePlayerAction.NULL
		let reaction: PlayerAction
		// 「行为生成器」总循环 //
		while (true) {
			// 屏蔽其它事件 //
			if (event !== AIPlayerEvent.AI_TICK) {
				event = yield EnumNativePlayerAction.NULL // !【2023-10-02 20:38:23】必须重新赋值，以刷新event变量
				continue
			}
			// console.log("[LOG] AIProgram_Dummy: event = ", event);
			// !【2023-10-09 22:53:28】现在「非空检查」留到子程序中，母程序不再需要
			// 第一层反应：优先保持使用工具
			reaction = aUsing.next(event).value
			// 非空⇒产出，空⇒下一个行为
			if (reaction === EnumNativePlayerAction.NULL)
				// 移动
				reaction = rWalk.next(event).value
			// 最后肯定输出行为
			event = yield reaction // !【2023-10-05 14:41:05】yield必须与`event = `搭配，不然无法刷新外界感知
		}
	}

	/**
	 * （迁移自BaTr）另一个简单的AI程序
	 * * 仍然随机走动
	 * * 有一个「等待时间」，以便在「持续利益受损」「系统无聊」等情况下「撤手」
	 *
	 * TODO: 【2023-10-02 21:30:27】WIP——目前先实现主干（有一个AI能用即可），然后再迁移这些复杂的逻辑
	 */
	export function* AIProgram_Novice(
		controller: AIControllerGenerator
	): AIActionGenerator {
		while (true) {
			yield EnumNativePlayerAction.NULL
		}
	}

	/**
	 * （迁移自BaTr）一个使用A*寻路算法进行「玩家追踪」「奖励箱搜寻」的AI
	 * * 核心算法来自A*搜索，但以「基于『记忆』的状态机」的形式异步搜索
	 *
	 * TODO: 【2023-10-02 21:30:27】WIP——目前先实现主干（有一个AI能用即可），然后再迁移这些复杂的逻辑
	 */
	export function* AIProgram_Adventurer(
		controller: AIControllerGenerator
	): AIActionGenerator {
		while (true) {
			yield EnumNativePlayerAction.NULL
		}
	}

	/**
	 * （迁移自BaTr）结合Adventurer与Novice的产物
	 * * 「无聊算法」来自Novice
	 * * 「寻路算法」来自Adventurer
	 *
	 * TODO: 【2023-10-02 21:30:27】WIP——目前先实现主干（有一个AI能用即可），然后再迁移这些复杂的逻辑
	 */
	export function* AIProgram_Master(
		controller: AIControllerGenerator
	): AIActionGenerator {
		while (true) {
			yield EnumNativePlayerAction.NULL
		}
	}
}
