/**
 * PyNARS的输出类型
 * * 承继自`pynars\utils\Print.py`
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
