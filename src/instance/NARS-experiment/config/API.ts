import { iPoint, iPointRef } from 'matriangle-common'
import { uint } from 'matriangle-legacy'
import { EChartsOption } from 'echarts'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import { PlayerEvent } from 'matriangle-mod-native'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import { NARSEnv } from '../server'

/**
 * 一个记录「NARS操作及其参数」的元组（至少有一个字符串元素）
 *
 * @example
 * ['^left', '{SELF}', 'x']
 */
export type NARSOperation = [string, ...string[]]

/** 一个「消息服务」的连接 */
export type ServiceConnection = {
	host: string
	port: uint
}

/**
 * NARS环境配置
 * * 在「环境构造时」加载
 * * 加载后便不再发生变更
 */
export type NARSEnvConfig = {
	/**
	 * 根据自身输出 实验/配置 信息
	 * @param config 环境配置（自身）
	 *
	 * ! 返回值首尾的空白符，会在输出时被过滤
	 * * 过滤方法：使用{@linkcode String.trim}
	 */
	info: (config: NARSEnvConfig) => string

	/** 网络连接 */
	connections: {
		controlService: ServiceConnection
		displayService: ServiceConnection
		dataShowService: ServiceConnection
		NARS: ServiceConnection
	}

	/** 词项常量池 & 词法模板 */
	NAL: {
		SELF: string
		SAFE: string
		positiveTruth: string
		negativeTruth: string
		/** 操作符带尖号，模板：OpenNARS输出`^left([{SELF}, x])` */
		op_output: (op: NARSOperation) => string
		/** 操作符带尖号，模板：语句`<(*, {SELF}, x) --> ^left>` */
		op_input: (op: NARSOperation) => string
	}

	/** 计时参数 */
	timing: {
		/** 单位执行速度 */
		unitAITickSpeed: uint
		/** 目标提醒相对倍率 */
		goalRemindRate: uint
		/** Babble相对倍率 */
		babbleRate: uint
		/** 「长时间无操作⇒babble」的阈值 */
		babbleThreshold: uint
	}

	/** 绘图参数 */
	plot: EChartsOption

	/** 地图参数 */
	map: {
		/** 地图尺寸 */
		SIZES: iPoint
	}

	/** 行为参数 */
	behavior: {
		/**
		 * AI初始化时
		 * @param env 所调用的环境
		 * @param event 玩家事件
		 * @param self 发送事件的玩家
		 * @param host 世界母体
		 * @param registerOperation 环境传递过来的「注册操作」回调函数，用于回调环境以注册操作
		 */
		init: (
			env: NARSEnv,
			event: PlayerEvent,
			self: IPlayer,
			host: IMatrix,
			registerOperation: (op: [string, ...string[]]) => void
		) => void
		/**
		 * 一个AI刻（单位AI运行周期）中
		 * @param env 所调用的环境
		 * @param event 玩家事件
		 * @param self 发送事件的玩家
		 * @param host 世界母体
		 * @param posPointer 传递过来以提升性能的位置指针
		 * @param send2NARS 「向NARS发送消息」的回调函数
		 */
		AITick: (
			env: NARSEnv,
			event: PlayerEvent,
			self: IPlayer,
			host: IMatrix,
			posPointer: iPointRef,
			send2NARS: (message: string) => void
		) => void
		/**
		 * 在「教学环境」中产生「非自主操作」
		 * @param env 所调用的环境
		 * @param self 调用的玩家
		 * @param host 世界母体
		 * @returns babble出来的参数
		 */
		babble: (env: NARSEnv, self: IPlayer, host: IMatrix) => NARSOperation
	}
}
