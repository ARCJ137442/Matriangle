/**
 * 该文件存储一系列通用的NAL函数
 * * 例如：共用NAL语句模板
 */

import { NAIRCmdTypes } from 'matriangle-mod-nar-framework/NAIRCmdTypes.type'

/** 简易NAVM指令构建 */
export const simpleNAVMCmd = (cmd_type: string, content: string): string =>
	`${cmd_type} ${content}`

/**
 * 复用CommonNarsese模板：基础二元结构
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
export const generateCommonNarseseBinary = (
	subject: string,
	copula: string,
	prejudice: string,
	punctuation: string = '.',
	tense: string = '',
	truth: string = ''
): string =>
	`<${subject} ${copula} ${prejudice}>${punctuation} ${tense} ${truth}`.trimEnd()

/** {@link generateCommonNarseseBinary}和{@link generateNarseseToCIN}的复合函数 */
export const generateCommonNarseseBinaryToCIN = (
	subject: string,
	copula: string,
	prejudice: string,
	punctuation: string = '.',
	tense: string = '',
	truth: string = ''
): string =>
	simpleNAVMCmd(
		NAIRCmdTypes.NSE,
		generateCommonNarseseBinary(
			subject,
			copula,
			prejudice,
			punctuation,
			tense,
			truth
		)
	)

/**
 * CommonNarsese 真值模板
 * *【2023-11-28 09:07:47】现在有了BabelNAR，可以不再需要注意各种CIN中NAL的细节
 *
 * @param f 频率
 * @param c 信度
 */
export const generateCommonNarseseTruthValue = (f: number, c: number): string =>
	`%${f};${c}%`
