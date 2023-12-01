/**
 * 该文件存储一系列通用的NAL函数
 * * 例如：共用NAL语句模板
 */

import { NAIRCmdTypes } from 'matriangle-mod-nar-framework/NAIRCmdTypes.type'
import { NARSPlayerConfig } from '../config/API'
import {
	NarseseCopulas,
	NarsesePunctuation,
	NarseseTenses,
} from 'matriangle-mod-nar-framework/NARSTypes.type'

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
export const generateCommonNarsese_Binary = (
	subject: string,
	copula: string,
	prejudice: string,
	punctuation: string = '.',
	tense: string = '',
	truth: string = ''
): string =>
	`<${subject} ${copula} ${prejudice}>${punctuation} ${tense} ${truth}`.trimEnd()

/** {@link generateCommonNarsese_Binary}和{@link generateNarseseToCIN}的复合函数 */
export const generateCommonNarseseToCIN_Binary = (
	subject: string,
	copula: string,
	prejudice: string,
	punctuation: string,
	tense: string = '',
	truth: string = ''
): string =>
	simpleNAVMCmd(
		NAIRCmdTypes.NSE,
		generateCommonNarsese_Binary(
			subject,
			copula,
			prejudice,
			punctuation,
			tense,
			truth
		)
	)

// !【2023-11-30 23:07:12】现在这些直接在参数中引入配置，于是便可不失通用性地使用在各个实现中
/**
 * 短缩写别名
 * @alias generateCommonNarseseBinaryToCIN
 */
export const gCNToCIN_Binary = generateCommonNarseseToCIN_Binary

/**
 * 生成「现在继承判断」
 * * 因为的确过于常用
 */
export const generateCommonNarsese_PresentInheritanceJudgement = (
	config: NARSPlayerConfig,
	subject: string,
	prejudice: string,
	truth: string = ''
): string =>
	config.NAL.generateCommonNarseseBinary(
		subject,
		NarseseCopulas.Inheritance,
		prejudice,
		NarsesePunctuation.Judgement,
		NarseseTenses.Present,
		truth
	)

/**
 * 短缩写别名
 * @alias generateCommonNarsese_PresentInheritanceJudgement
 */
export const GCN_PresentInheritanceJudgement =
	generateCommonNarsese_PresentInheritanceJudgement
/**
 * 短缩写别名
 * @alias generateCommonNarsese_PresentInheritanceJudgement
 */
export const GCN_PIJ = generateCommonNarsese_PresentInheritanceJudgement

/**
 * 生成「现在继承判断」到CIN
 * * 因为的确过于常用
 */
export const generateCommonNarseseToCIN_PresentInheritanceJudgement = (
	config: NARSPlayerConfig,
	subject: string,
	prejudice: string,
	truth: string = ''
): string =>
	config.NAL.generateNarseseToCIN(
		generateCommonNarsese_PresentInheritanceJudgement(
			config,
			subject,
			prejudice,
			truth
		)
	)

/**
 * 短缩写别名
 * @alias generateCommonNarseseToCIN_PresentInheritanceJudgement
 */
export const GCNToCIN_PresentInheritanceJudgement =
	generateCommonNarseseToCIN_PresentInheritanceJudgement
/**
 * 短缩写别名
 * @alias generateCommonNarseseToCIN_PresentInheritanceJudgement
 */
export const GCNToCIN_PIJ =
	generateCommonNarseseToCIN_PresentInheritanceJudgement

/**
 * 生成「自身现在继承判断」
 * * 属于「现在继承判断」在「主词=SELF」的特化
 * * 因为的确过于常用
 */
export const generateCommonNarsese_SelfPresentInheritanceJudgement = (
	config: NARSPlayerConfig,
	prejudice: string,
	truth: string = ''
): string =>
	generateCommonNarsese_PresentInheritanceJudgement(
		config,
		config.NAL.SELF,
		prejudice,
		truth
	)

/**
 * 短缩写别名
 * @alias generateCommonNarsese_SelfPresentInheritanceJudgement
 */
export const GCN_SelfPresentInheritanceJudgement =
	generateCommonNarsese_SelfPresentInheritanceJudgement
/**
 * 短缩写别名
 * @alias generateCommonNarsese_SelfPresentInheritanceJudgement
 */
export const GCN_SPIJ = generateCommonNarsese_SelfPresentInheritanceJudgement

/**
 * 生成「自身现在继承判断」到CIN
 * * 因为的确过于常用
 */
export const generateCommonNarseseToCIN_SelfPresentInheritanceJudgement = (
	config: NARSPlayerConfig,
	prejudice: string,
	truth: string = ''
): string =>
	generateCommonNarseseToCIN_PresentInheritanceJudgement(
		config,
		config.NAL.SELF,
		prejudice,
		truth
	)

/**
 * 短缩写别名
 * @alias generateCommonNarseseToCIN_SelfPresentInheritanceJudgement
 */
export const GCNToCIN_SelfPresentInheritanceJudgement =
	generateCommonNarseseToCIN_SelfPresentInheritanceJudgement
/**
 * 短缩写别名
 * @alias generateCommonNarseseToCIN_SelfPresentInheritanceJudgement
 */
export const GCNToCIN_SPIJ =
	generateCommonNarseseToCIN_SelfPresentInheritanceJudgement

/**
 * CommonNarsese 真值模板
 * *【2023-11-28 09:07:47】现在有了BabelNAR，可以不再需要注意各种CIN中NAL的细节
 *
 * @param f 频率
 * @param c 信度
 */
export const generateCommonNarsese_TruthValue = (
	f: number,
	c: number
): string => `%${f};${c}%`

/**
 * 短缩写别名
 * @alias generateCommonNarsese_TruthValue
 */
export const GCN_TruthValue = generateCommonNarsese_TruthValue
