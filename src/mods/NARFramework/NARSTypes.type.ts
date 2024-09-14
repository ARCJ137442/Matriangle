/**
 * 一个记录「NARS操作及其参数」的元组（至少有一个字符串元素）
 * * 🚩【2024-04-08 19:41:27】现在去除「操作符」前方的尖号
 *
 * @example
 * ['left', '{SELF}', 'x']
 */
export type NARSOperation = [string, ...string[]]
/**
 * 一个检测「是否为NARS操作序列」的函数
 */
export function isNARSOperation(x: unknown): x is NARSOperation {
	return (
		// 是数组
		Array.isArray(x) &&
		// 长度大于一
		x.length > 0 &&
		// 每个元素都是字符串
		x.every(isString)
	)
}
const isString = (x: unknown): boolean => typeof x === 'string'

/**
 * 操作返回值的类型
 * * 除了「是否成功」外，还有undefined代指「无结果」
 */
export type NARSOperationResult = boolean | undefined

/**
 * 用于记录「操作历史」（其中一个记录，不包括「是否自主」）
 *
 * @type 类型：`[所做操作, 操作结果]`
 * * 所做操作：同{@link NARSOperation}
 * * 操作结果：`true`代表成功，`false`代表失败
 */
export type NARSOperationRecord = [NARSOperation, NARSOperationResult]

/**
 * 用于记录「操作历史」（其中一个记录）
 *
 * @type 类型：`[所做操作, 是否自主, 操作结果]`
 * * 所做操作：同{@link NARSOperation}
 * * 操作结果：`true`代表成功，`false`代表失败
 * * 是否自主：`true`代表自主操作，`false`代表被动操作
 */
export type NARSOperationRecordFull = [...NARSOperationRecord, boolean]
export const isOperationFullSpontaneous = (
	record: NARSOperationRecordFull
): boolean => record[2]

/**
 * NARS的输出类型
 * * 最初由PyNARS而来
 *   * 承继自`pynars\utils\Print.py`
 */
export enum NARSOutputType {
	IN = 'IN',
	OUT = 'OUT',
	ERROR = 'ERROR',
	ANSWER = 'ANSWER',
	ACHIEVED = 'ACHIEVED',
	EXE = 'EXE',
	INFO = 'INFO',
	COMMENT = 'COMMENT',
	// OpenNARS的「ANTICIPATE」 / ONA的"decision expectation"
	ANTICIPATE = 'ANTICIPATE',
}

// 网络通信
/**
 * 解包格式
 * * 🚩现在遵从**BabelNAR.rs**的规范
 */
export type WebNARSOutput = {
	// interface_name?: string
	type?: string
	content?: string
	narsese?: string
	operation?: NARSOperation
}
/** NARS通过Web(Socket)传回的消息中会有的格式 */
export type WebNARSOutputJSON = WebNARSOutput[]

/**
 * CommonNarsese系词类型
 * * 摘自JuNarsese`Conversion\core\string\definitions.jl`
 * 后续的「CommonNarsese类型」都摘自于此：
 * ```julia
 * const StringParser_ascii::StringParser = StringParser{String}(
 *     "StringParser_ascii",
 *     ...
 * )
 * ```
 */
export enum NarseseCopulas {
	Inheritance = '-->',
	Similarity = '<->',
	Implication = '==>',
	Equivalence = '<=>',
	// 副系词: 实例&属性
	Instance = '{--',
	Property = '--]',
	InstanceProperty = '{-]',
	// 副系词: 时序蕴含
	ImplicationRetrospective = '=\\>',
	ImplicationConcurrent = '=|>',
	ImplicationPredictive = '=/>',
	// 副系词: 时序等价
	EquivalenceRetrospective = '<\\>',
	EquivalenceConcurrent = '<|>',
	EquivalencePredictive = '</>',
}

/**
 * CommonNarsese时态类型
 * * 摘自JuNarsese`Conversion\core\string\definitions.jl`
 */
export enum NarseseTenses {
	Eternal = '',
	Past = ':\\:',
	Present = ':|:',
	Future = ':/:',
}

/**
 * CommonNarsese标点类型
 * * 摘自JuNarsese`Conversion\core\string\definitions.jl`
 */
export enum NarsesePunctuation {
	Judgement = '.',
	Question = '?',
	Goal = '!',
	Quest = '@',
}

/**
 * CommonNarsese复合词项连接词
 * * 摘自JuNarsese`Conversion\core\string\definitions.jl`
 */
export enum NarseseCompoundConnector {
	ExtIntersection = '&',
	IntIntersection = '|',
	ExtDifference = '-',
	IntDifference = '~',
	// 像
	ExtImage = '/',
	IntImage = '\\',
	// 乘积
	TermProduct = '*',
	// 陈述逻辑集
	Conjunction = '&&',
	Disjunction = '||',
	Negation = '--',
	// 陈述时序集
	ParConjunction = '&|',
	SeqConjunction = '&/',
}

/**
 * CommonNarsese集合括弧
 * * 摘自JuNarsese`Conversion\core\string\definitions.jl`
 */
export enum NarseseBrackets {
	ExtSet = '{}', // 外延集
	IntSet = '[]', // 内涵集
	Statement = '<>', // 陈述
	Compound = '()', // 复合词项
}

/**
 * CommonNarsese原子词项前缀
 */
export enum NarseseAtomPrefixes {
	Word = '', // 置空
	IVar = '$',
	DVar = '#',
	QVar = '?',
	Interval = '+', // 间隔
	Operator = '^', // 操作
	PlaceHolder = '_', // 像占位符
}
