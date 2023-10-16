/**
 * WebIO，即「网络输入输出」
 * * 提供Matriangle服务端与其它程序的通信工具
 * * 支持HTTP、WebSocket双协议
 */
export module WebIO {
	/** 模组名称 */
	export const NAME: string = 'Matriangle WebIO'
	/** 短名称 */
	export const NAME_SHORT: string = 'WebIO'
	/** 开发阶段 */
	export const DEV_STAGE: string = ''
	/** 主版本 */
	export const VERSION_MAJOR: number = 0
	/** 次要版本 */
	export const VERSION_MEDIUM: number = 1
	/** 修正版本 */
	export const VERSION_MINOR: number = 0
	/** 更新日志 */
	export const UPDATE_LOG: string = ''

	/** 完整版本 */
	export const FULL_VERSION = `v${VERSION_MAJOR}.${VERSION_MEDIUM}.${VERSION_MINOR}`
	/** 完整名称 */
	export const FULL_NAME = `${NAME} ${DEV_STAGE} ${FULL_VERSION}`
}
