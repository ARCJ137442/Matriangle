import { iPointRef } from 'matriangle-common/geometricTools'
import { uint } from 'matriangle-legacy/AS3Legacy'
import { EChartsOption } from 'echarts'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import { PlayerEvent } from 'matriangle-mod-native/entities/player/controller/PlayerEvent'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import { NARSEnv, NARSPlayerAgent } from '../NARSEnv'
import IMap from 'matriangle-api/server/map/IMap'
import {
	NARSOperation,
	NARSOperationRecord,
	NARSOperationRecordFull,
	NARSOperationResult,
} from 'matriangle-mod-nar-framework/NARSTypes.type'
import {
	IMessageService,
	MessageCallback,
} from 'matriangle-mod-message-io-api/MessageInterfaces'

/** 一个「消息服务」基于传入主机地址、服务端口、消息回调的构造函数 */
export type MessageServiceConstructor = (
	host: string,
	port: uint,
	messageCallback: MessageCallback
) => IMessageService

/** 一个「消息服务」的配置 */
export type ServiceConfig = {
	/** 服务连接的主机地址 */
	host: string
	/** 服务连接的端口 */
	port: uint
	/** 服务连接的构造函数（与地址无关） */
	constructor: MessageServiceConstructor
}

/**
 * NARS玩家配置
 */
export type NARSPlayerConfig = {
	/** 属性参数（承继自IPlayer，与Matriangle环境相关） */
	attributes: {
		/** （自定义）名称 */
		name: string
		/** 生命（值）相关 */
		health: {
			/** 初始生命值 */
			initialHP: uint
			/** 初始最大生命值 */
			initialMaxHP: uint
			/** 初始储备生命值 */
			initialHeal: uint
			/** 初始生命数 */
			initialLives: uint
			/** 生命数不减少（承继自IPlayer） */
			lifeNotDecay: boolean
		}
		/** 外表相关 */
		appearance: {
			/** 线条颜色（承继自IPlayer） */
			lineColor: uint
			/** 填充颜色（承继自IPlayer） */
			fillColor: uint
		}
	}

	/** 连接参数 */
	connections: {
		/** 对应的「NARS的消息服务」 */
		NARS: ServiceConfig
		/** 对应的「数据显示服务」 */
		dataShow: ServiceConfig
		/** 用于「多按键控制器」的连接，来自{@link WebController} */
		controlKey: string
	}

	/** 数据显示参数 */
	dataShow: {
		/**
		 * 用于「更新绘图」的数据包的「数据映射」
		 * * 其中的键可有可无（无⇒保持原样）
		 */
		dataNameMap: {
			/* 成功率?: string
			教学成功率?: string
			自主成功率?: string
			激活率?: string */ // !【2023-10-31 00:16:20】现在使用任意映射
			/** 其它映射 */
			[oldName: string]: string
		}
		/**
		 * 有关「操作历史显示」
		 */
		operationHistory: {
			/**
			 * 可视化操作历史——单记录、无「自主性区分」版
			 *
			 * @param record 操作记录：[操作, 是否自主, 是否成功]
			 * * 可参考样例：`left_{SELF}_x-S` `S|F`
			 *
			 * @returns 一条操作记录 如：
			 */
			visualizeOperationRecord: (record: NARSOperationRecord) => string
			/**
			 * 可视化操作历史——单记录、有「自主性区分」版
			 *
			 * @param record 操作记录：[操作, 是否自主, 是否成功]
			 * * 可参考样例：`left_{SELF}_x-@S` `@|#` `S|F`
			 *
			 * @returns 一条操作记录 如：
			 */
			visualizeOperationRecordFull: (
				record: NARSOperationRecordFull
			) => string
			/**
			 * 决定「自发性操作/自主操作」的前缀（需要带换行）
			 * @example '自主操作：\n'
			 */
			spontaneousPrefix: string
			/**
			 * 决定「无意识操作/教学操作」的前缀（需要带换行）
			 * @example '教学操作：\n'
			 */
			unconsciousPrefix: string
		}
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

	/** NAL常量池 & 词法模板 */
	NAL: {
		/** 表示「自我」的词项 */
		SELF: string
		/** 表示「正向目标」的词项组 */
		POSITIVE_GOALS: string[]
		/** 表示「负向目标」的词项组 */
		NEGATIVE_GOALS: string[]
		/** 表示「正向真值」的词项 */
		positiveTruth: string
		/** 表示「负向真值」的词项 */
		negativeTruth: string

		/** 操作符带尖号，模板：OpenNARS输出`^left([{SELF}, x])` */
		op_output: (op: NARSOperation) => string
		/** 操作符带尖号，模板：语句`<(*, {SELF}, x) --> ^left>` */
		op_input: (op: NARSOperation) => string

		// !【2023-11-04 23:22:10】事实上「接口里定义readonly」毛用没有

		/**
		 * 要发给CIN的Narsese：基于NAVM发送NAIR指令
		 *
		 * @param narsese 要发给CIN的Narsese
		 * @returns CIN一侧的NAVM所接收的NAIR指令
		 */
		generateNarseseToCIN: (narsese: string) => string

		/**
		 * 要发给CIN的「操作符注册」：基于NAVM发送NAIR指令
		 *
		 * @param operator_name 操作符名 // ! 不带尖号
		 * @returns CIN一侧的NAVM所接收的NAIR指令
		 */
		generateOperatorRegToCIN: (operator_name: string) => string

		/** CommonNarsese生成模板：基础二元结构
		 * * 核心结构：`<S --> P>` + 标点
		 *
		 * @param subject 主词
		 * @param copula 系词
		 * @param prejudice 谓词 '-->'继承，'<->'相似，'==>'蕴含，'<=>'等价
		 * @param punctuation 标点（默认为'.'判断 '!'目标，'?'问题，'@'请求）
		 * @param tense 语句时态（默认为''永恒 ':/:'将来，':|:'现在，':\:'过去）
		 * @param truth 真值（默认为''，格式为'%频率;信度%'）
		 * @returns Narsese语句
		 *
		 * @example generateCommonNarseseInheritance('{SELF}', '[safe]', '.', ':|:', '%1.0;0.9%')
		 * => `<{SELF} --> [safe]>. :|: %1.0;0.9%`
		 */
		generateCommonNarseseBinary: (
			subject: string,
			copula: string,
			prejudice: string,
			punctuation?: string,
			tense?: string,
			truth?: string
		) => string
	}

	/** 行为参数 */
	behavior: {
		/**
		 * AI初始化时
		 * @param env 所调用的环境
		 * @param event 玩家事件
		 * @param self 发送事件的玩家
		 * @param selfConfig 发送事件的玩家的配置（用于快速索引）
		 * @param host 世界母体
		 * @param registerOperation 环境传递过来的「注册操作」回调函数，用于回调环境以注册操作
		 */
		init: (
			env: NARSEnv,
			event: PlayerEvent,
			self: IPlayer,
			selfConfig: NARSPlayerConfig,
			host: IMatrix,
			registerOperation: (op: [string, ...string[]]) => void
		) => void
		/**
		 * 一个AI刻（单位AI运行周期）中
		 * @param env 所调用的环境
		 * @param event 玩家事件
		 * @param self 发送事件的玩家
		 * @param selfConfig 发送事件的玩家的配置（用于快速索引）
		 * @param host 世界母体
		 * @param posPointer 传递过来以提升性能的位置指针
		 * @param send2NARS 「向NARS发送消息」的回调函数
		 */
		AITick: (
			env: NARSEnv,
			event: PlayerEvent,
			self: IPlayer,
			selfConfig: NARSPlayerConfig,
			host: IMatrix,
			posPointer: iPointRef,
			send2NARS: (message: string) => void
		) => void
		/**
		 * 在「教学环境」中产生「非自主操作」
		 * @param env 所调用的环境
		 * @param env 所调用的环境的「玩家智能体」
		 * @param self 调用的玩家
		 * @param selfConfig 调用的玩家的配置（用于快速索引）
		 * @param host 世界母体
		 * @returns babble出来的参数
		 */
		babble: (
			env: NARSEnv,
			agent: NARSPlayerAgent,
			self: IPlayer,
			selfConfig: NARSPlayerConfig,
			host: IMatrix
		) => NARSOperation
		/**
		 * 执行操作
		 * @param env 所调用的环境
		 * @param self 调用的玩家
		 * @param selfConfig 调用的玩家的配置（用于快速索引）
		 * @param host 世界母体
		 * @param op 操作
		 */
		operate: (
			env: NARSEnv,
			self: IPlayer,
			selfConfig: NARSPlayerConfig,
			host: IMatrix,
			op: NARSOperation,
			operateI: uint | -1,
			send2NARS: (message: string) => void
		) => NARSOperationResult
		/**
		 *
		 * @param env 所调用的环境
		 * @param event 接收到的「玩家事件」
		 * @param self 调用的玩家
		 * @param selfConfig 调用的玩家的配置（用于快速索引）
		 * @param host 世界母体
		 * @param send2NARS 「向NARS发送消息」的回调函数
		 */
		feedback: (
			env: NARSEnv,
			event: PlayerEvent,
			self: IPlayer,
			selfConfig: NARSPlayerConfig,
			host: IMatrix,
			send2NARS: (message: string) => void
		) => void
	}
}

/**
 * NARS环境配置
 * * 在「环境构造时」加载
 * * 加载后便不再发生变更
 *   * 即：不支持「加载后动态变更」
 *   * 一些引用类值可能除外
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
		/** 统一的「Web控制服务」 */
		controlService: ServiceConfig
		/** 统一的「屏显服务」 */
		displayService: ServiceConfig
	}

	/** 绘图参数 */
	plot: {
		/** 用于初始化绘图 */
		initialOption: EChartsOption
	}

	/** 地图参数 */
	map: {
		/** 地图初始化 */
		initMaps: () => IMap[]
	}

	/** 玩家 */
	players: NARSPlayerConfig[]
}
