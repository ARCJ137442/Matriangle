/**
 * 一个记录「NARS操作及其参数」的元组（至少有一个字符串元素）
 *
 * @example
 * ['^left', '{SELF}', 'x']
 */
export type NARSOperation = [string, ...string[]]

/** 操作返回值的类型，目前暂时是「是否成功」 */
export type NARSOperationResult = boolean

/**
 * NARS的输出类型
 * * 最初由PyNARS而来
 *   * 承继自`pynars\utils\Print.py`
 */
export enum PyNARSOutputType {
	IN = 'IN',
	OUT = 'OUT',
	ERROR = 'ERROR',
	ANSWER = 'ANSWER',
	ACHIEVED = 'ACHIEVED',
	EXE = 'EXE',
	INFO = 'INFO',
	COMMENT = 'COMMENT',
}
