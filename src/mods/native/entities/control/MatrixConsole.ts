import { MatrixProgram, MatrixProgramLabel, typeID } from 'matriangle-api'
import IMatrix from 'matriangle-api/server/main/IMatrix'

type CmdExecuter = (...params: string[]) => unknown

/**
 * 母体控制台
 * * 整体操作基于「字符串指令」
 * * 用于调试、控制、测试母体
 * * 支持文本指令输入，如`/query`、`/help`、`/test`、`#def function f(s){console.log(`echo! ${s}`)}`
 * * 支持「自定义指令」注册（后续扩展需要如「切换地图」）
 *
 * !【2023-11-10 20:29:01】指令中可能包含`eval`，若不明其效果可能造成运行时错误
 */
export default class ProgramMatrixConsole extends MatrixProgram {
	/** ID */
	public static readonly ID: typeID = 'MatrixConsole'
	/** 标签 */
	public static readonly LABEL: MatrixProgramLabel = 'MatrixConsole'

	/**
	 * 构造函数
	 */
	constructor(
		/**
		 * 指令所默认（应用到）的母体
		 */
		public readonly host: IMatrix
	) {
		// 超类初始化 //
		super(ProgramMatrixConsole.ID, ProgramMatrixConsole.LABEL)
		// 内置指令集 //
		this.cmdOperationSet = new Map([
			// * 元指令：定义「指令处理函数」
			['def', this.addCmdOperationEval.bind(this)], // 定义新指令
			['eval', (code: string): unknown => this.eval(code)], // 执行代码
			[
				// 列举所有已注册指令
				'list',
				(...params): string => {
					let result: string = '<cmd list>\n'
					for (const [cmd, executer] of this.cmdOperationSet) {
						// 控制台打印
						console.log(
							`[${this.label}:cmd/list]${cmd}:`,
							executer,
							'\n'
						)
						// 结果拼接
						result += `${cmd}: ${String(executer)}\n`
					}
					// 返回结果作为消息
					return result
				},
			],
		])
	}

	/**
	 * 指令操作集
	 * * 用于「字符串⇒函数执行」的映射
	 */
	protected cmdOperationSet: Map<string, CmdExecuter>

	/**
	 * 向指令集添加函数
	 * * 若已有指令⇒不覆盖
	 */
	protected addCmdOperation(cmd: string, executer: CmdExecuter): undefined {
		// 检查
		if (this.cmdOperationSet.has(cmd))
			return void console.warn(`添加的指令「${cmd}」已注册！`)
		// 注册指令
		this.cmdOperationSet.set(cmd, executer)
		return undefined
	}

	/**
	 * 向指令集添加eval出来的可执行对象
	 * * 通过`executer_str`中的表达式，自动猜测指令名
	 *   * 核心原理：通过JS中`Function`类型的`name`属性
	 *   * 如`function run(params){ ... }`会自动提取`run`作为指令名
	 *   * 对匿名函数如`()=>{}`，会使用空字串`''`作为指令名（其`name`属性本就如此）
	 */
	protected addCmdOperationEval(executer_str: string): undefined {
		const executer: unknown = eval(executer_str)
		// 函数类型⇒提取`name`作为指令名
		if (typeof executer === 'function')
			return this.addCmdOperation(executer.name, executer as CmdExecuter)
		// 否则⇒返回空
		return undefined
	}

	/**
	 * 在操作集中寻找并执行字符串指令
	 * * 执行逻辑
	 *   * 有指令⇒执行
	 *   * 无指令⇒`undefined`
	 *
	 * @param cmd 指令名（索引）
	 * @param params 指令参数（可能为空）
	 */
	protected executeCmdOperation(cmd: string, params: string[]): unknown {
		return this.cmdOperationSet.get(cmd)?.(...params)
	}

	/**
	 * 入口/字符串指令执行
	 * * 执行单个指令（即便包括换行）
	 *
	 * @param cmd 指令
	 * @returns 返回值未知（可能是任意类型，并且执行时可能有副作用）
	 */
	public executeCmd(cmd: string): unknown {
		// * 空字串⇒无操作
		if (cmd.length === 0) return undefined
		switch (cmd[0]) {
			case '/':
				// * 前导`/`⇒执行「空格分隔的自定义指令」
				return this.evalSpacedCmd(cmd.slice(1).split(' '))
			// * 前导`#`⇒执行「单空格分隔的自定义指令」
			case '#': {
				/** 使用正则匹配 */
				const match = cmd.match(/([^ ]+) (.*)/)
				// 根据匹配返回
				return match === null
					? // 空匹配⇒空字串指令+自身作参数
					  this.eval1SpacedCmd('', cmd)
					: // 有匹配⇒指令头+指令参数
					  this.eval1SpacedCmd(
							match[1].slice(1), //截去开头的`#`
							match[2]
					  )
			}
			// * 否则（包括前导空格）⇒总是`eval`
			default:
				return this.eval(cmd)
		}
	}

	/**
	 * 执行多个指令
	 * @param cmds 指令列表
	 * @returns 所有指令返回结果的数组
	 */
	public executeCmds(cmds: string[]): unknown[] {
		return cmds.map(cmd => this.executeCmd(cmd))
	}

	/**
	 * 按指定分隔符分隔，分别执行指令，返回所有指令的结果
	 * @param cmdStr 指令字符串
	 * @param separator 指令分隔符 若为`\n`则为「多行指令」
	 * @returns 所有指令返回结果的数组
	 */
	public executeCmdSeparated(
		cmdStr: string,
		separator: string | RegExp
	): unknown[] {
		return this.executeCmds(cmdStr.split(separator))
	}

	// 指令运行：负责「执行指令」的函数 //

	/**
	 * （在这个上下文环境中）直接执行JS代码
	 *
	 * ! 不推荐过度使用——那些需要「底层支持」的代码需要直接写入控制台中
	 *
	 * @param code 要计算的JS代码
	 */
	protected eval(code: string): unknown {
		// 设置局部变量
		/** 母体变量`host` */
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const host = this.host
		// 开始执行
		try {
			// ! 这里无法用`bind`或`call`绑定`eval`的this上下文，并且这样做会丢失局部变量域
			return eval(code)
		} catch (error) {
			return error
		}
	}

	/**
	 * 执行「空格分隔的自定义指令」
	 *
	 * @param params 用空格分隔后的指令参数，如`['kill', '@e[type=item]']`
	 * * 包含一般意义上的「指令头」
	 */
	protected evalSpacedCmd(params: string[]): unknown {
		return params.length === 0
			? // 长度为零⇒以「空字串+空参数集」执行
			  this.executeCmdOperation('', [])
			: // 否则⇒以第一个参数为指令名执行
			  this.executeCmdOperation(params[0], params.slice(1))
	}

	/**
	 * 执行「单空格分隔的自定义指令」
	 *
	 * @param cmd 待执行的指令名，如`eval`
	 * @param param 单个字符串参数，如`2 * 3`
	 */
	protected eval1SpacedCmd(cmd: string, param: string): unknown {
		return this.executeCmdOperation(cmd, [param])
	}
}
