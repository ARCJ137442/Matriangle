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

export enum VisualizationOutputMessagePrefix {
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
	messageType: VisualizationOutputMessagePrefix,
	data: string
): string {
	return `${messageType}|${data}`
}
/**
 * 拆包使用的正则表达式
 * * 含义：`【可视化类型标签（其内不含「|」符号）】|【可视化数据（字符串）】`
 * * 例如：`t|hello world` ==> [`t`, `hello world`]
 * * 📝出现在中间的竖线需要反斜杠转义
 * * 📝正则符号「.」不匹配换行符
 */

export const VISUALIZATION_DATA_REGEX = /([^|]*)\|((?:.|\n)*)/
/**
 * 内置的「拆包附加信息」
 * * 对接显示端，封装逻辑以便于「逻辑端打包」「显示端拆包」
 *   * 用于「显示端」在「解析发来的『已打包消息』」时自动拆包
 *   * 对应{@link packDisplayData}的拆包流程：以首个'|'字符分隔，使用正则拆解
 *   * 只会拆出`null`或一个二元组`[可视化类型（文本/画板/附加信息，使用「附加前缀」表示）, 可视化数据（纯文本/JSON）]`
 */
export function unpackDisplayData(
	message: string
): [VisualizationOutputMessagePrefix, string] | null {
	const match = message.match(VISUALIZATION_DATA_REGEX)
	return match === null
		? null
		: // 索引值`match[0]`是「被匹配到的整个模式串」
		  [match[1] as VisualizationOutputMessagePrefix, match[2]]
}
