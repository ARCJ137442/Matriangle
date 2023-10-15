/**
 * BaTS，即「Battle Triangle: TypeScript」，是
 * * Battle Triangle的TypeScript版本
 * * Matriangle的首个外部模组
 * * Matriangle的测试试验场
 */
export module BaTS {
	/** 模组名称 */
	export const NAME: string = 'Battle Triangle'
	/** 短名称 */
	export const NAME_SHORT: string = 'BaTS'
	/** 开发阶段 */
	export const DEV_STAGE: string = 'TS'
	/** 主版本 */
	export const VERSION_MAJOR: number = 0
	/** 次要版本 */
	export const VERSION_MEDIUM: number = 1
	/** 修正版本 */
	export const VERSION_MINOR: number = 0
	/** 更新日志 */
	export const UPDATE_LOG: string = 'The first immigration towards TypeScript'

	/** 完整版本 */
	export const FULL_VERSION = `v${VERSION_MAJOR}.${VERSION_MEDIUM}.${VERSION_MINOR}`
	/** 完整名称 */
	export const FULL_NAME = `${NAME} ${DEV_STAGE} ${FULL_VERSION}`
}
