/**
 * 来自{@link https://github.com/ARCJ137442/NAVM.jl NAVM}的「指令类型」
 * * 摘自NAVM`src/NAIR/structs.jl`
 * * 上一次更新时间为【2023-11-04 23:45:29】
 */
export enum NAIRCmdTypes {
	/** Save 保存NARS配置 */
	SAV = 'SAV',
	/** Load 加载NARS配置 */
	LOA = 'LOA',
	/** Reset 重置NARS配置 */
	RES = 'RES',
	/** Narsese 输入CommonNarsese */
	NSE = 'NSE',
	/** Register 注册NARS操作符 */
	REG = 'REG',
	/** New 新建NARS推理器 */
	NEW = 'NEW',
	/** Delete 删除NARS推理器 */
	DEL = 'DEL',
	/** Cycle NARS推理器步进 */
	CYC = 'CYC',
	/** Volume CIN输出音量 */
	VOL = 'VOL',
	/** Information 输出NARS推理器信息 */
	INF = 'INF',
	/** Help 输出帮助信息 */
	HLP = 'HLP',
	/** Remark 注释 */
	REM = 'REM',
}
