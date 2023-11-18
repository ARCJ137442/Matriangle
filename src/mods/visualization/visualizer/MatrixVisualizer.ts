import {
	MatrixProgram,
	MatrixProgramLabel,
} from 'matriangle-api/server/control/MatrixProgram'
import {
	IMessageRouter,
	MessageServiceConfig,
	linkToRouterLazy,
} from 'matriangle-mod-message-io-api/MessageInterfaces'
import { typeID } from 'matriangle-api'

/**
 * 「母体可视化者」是
 * * 用于传递可视化信号的
 * * 响应式的
 * 母体程序
 */
export default abstract class MatrixVisualizer extends MatrixProgram {
	// 构造函数&析构函数 //
	public constructor(id: typeID, label: MatrixProgramLabel) {
		super(id, label)
	}

	// 可视化部分 //

	/**
	 * 获取可视化信号
	 * @abstract 抽象方法，需要等子类自行实现
	 */
	public abstract getSignal(message: string): string

	// 服务器部分 //

	/**
	 * 以指定IP、端口连接到「消息路由器」
	 * * 与「开设服务器」不同的是：所有逻辑由自身决定
	 *
	 * !【2023-11-18 18:03:19】现在扩展自通用接口的处理方法
	 * * 以便于使用者在不知道
	 *
	 * @param {MessageRouter} router 所连接的「消息路由器」
	 * @param {MessageServiceConfig} config 消息服务配置
	 */
	public linkToRouter(
		router: IMessageRouter,
		config: MessageServiceConfig
	): boolean {
		return linkToRouterLazy(router, config, this.getSignal.bind(this))
	}
}

/**
 * 内置的「可视化类型标识」枚举
 *
 * ! 必须是字符串：需要从「显示端发来的消息」中解码
 */
export enum NativeVisualizationTypeFlag {
	/** 用于显示初始化 */
	INIT = 'init',
	/** 用于显示更新 */
	REFRESH = 'refresh',
	/** 用于获取「附加信息」 */
	OTHER_INFORMATION = 'otherInf',
}

/**
 * 用于区分「消息用途」的前缀类型
 * * 主要面向显示端
 *
 * ! 必须是字符串：需要从「显示端发来的消息」中解码
 */
export enum VisualizationOutputMessagePrefixes {
	/** 「附加信息」的前缀 */
	OTHER_INFORMATION = 'i',
	/** 「文本信息」的前缀 */
	TEXT = 't',
	/** 「canvas显示数据」的前缀 */
	CANVAS_DATA = '@',
}

/**
 * 内置的「打包附加信息」
 * * 对接显示端，封装逻辑以便于「逻辑端打包」「显示端拆包」
 * * 当前格式：`【可视化类型标签（其内不含「|」符号）】|【可视化数据（字符串）】`
 */
export function packDisplayData(
	typeFlag: NativeVisualizationTypeFlag,
	data: string
): string {
	return `${typeFlag}|${data}`
}

/**
 * 拆包使用的正则表达式
 * * 含义：`【可视化类型标签（其内不含「|」符号）】|【可视化数据（字符串）】`
 */
export const VISUALIZATION_DATA_REGEX = /^([^|]*)|(.*)/
/**
 * 内置的「拆包附加信息」
 * * 对接显示端，封装逻辑以便于「逻辑端打包」「显示端拆包」
 * * 对应{@link packDisplayData}的拆包流程：以首个'|'字符分隔，使用正则拆解
 */
export function unpackDisplayData(message: string): RegExpMatchArray | null {
	return message.match(VISUALIZATION_DATA_REGEX)
}
