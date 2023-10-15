import { uint } from '../../../../legacy/AS3Legacy'
import { MatrixProgramLabel } from '../../../api/control/MatrixProgram'
import { createServer, Server, IncomingMessage, ServerResponse } from 'http'
import { ParsedUrlQuery, parse } from 'querystring'
import MultiKeyController from './MultiKeyController'

/**
 * 「HTTP控制器」
 * * 启动一个HTTP服务器，接收外界服务器请求
 * * 使用「控制密钥」机制，以实现「一个服务器运行，指挥多个玩家」（需要在query中提供）
 *   * 这点从`MultiKeyController`中继承
 * * 请求格式：`?key=控制密钥&action=分派动作`
 *   * 实际情况请参考类常量`KEY_CONTROL_KEY`与`KEY_ACTION`
 * * 连接玩家时，
 *   * 可以通过「生成订阅」直接创建链接（此时密钥=玩家名称）
 *   * 也可以通过「添加链接」自定义「控制密钥」
 *
 * ! 这个控制器需要`Node.js`支持
 */
export default class HTTPController extends MultiKeyController {
	/** 共同的标签：HTTP控制器 */
	public static readonly LABEL: MatrixProgramLabel = 'HTTP'

	// 构造函数&析构函数 //

	/**
	 * 构造函数
	 * * 不包括IP、端口的注册
	 */
	public constructor() {
		super(HTTPController.LABEL)
	}

	/**
	 * 析构函数
	 * * 关闭可能开启的服务器，避免IP/端口占用
	 */
	override destructor(): void {
		this.stopServer()
	}

	// 服务器部分 //

	/**
	 * 主机名称，如：
	 * * 本地主机`localhost`
	 * * 0.0.0.0
	 */
	protected _hostname: string = 'localhost'
	public get hostname(): string {
		return this._hostname
	}

	/**
	 * 端口
	 */
	protected _port: uint = 8080
	public get port(): uint {
		return this._port
	}

	/** （衍生）获取本机服务地址 */
	public get serverAddress(): string {
		return `http://${this._hostname}:${this._port}`
	}

	/**
	 * 存储当前HTTP服务器
	 */
	protected _server?: Server

	/**
	 * 启动HTTP服务器
	 */
	public launchServer(ip: string, port: uint) {
		this._hostname = ip
		this._port = port
		// 创建服务器，并开始侦听
		try {
			this._server = createServer(this.onRequest.bind(this))
			this._server.listen(this._port, this._hostname, (): void => {
				// 启动成功
				console.log(`${this.serverAddress}：服务器启动成功`)
			})
		} catch (e) {
			console.error(`${this.serverAddress}：服务器启动失败！`, e)
		}
	}

	/**
	 * 终止HTTP服务器
	 */
	public stopServer(): void {
		this._server?.close((): void => {
			console.log(`${this.serverAddress}：服务器已关闭！`)
			// 这里可以执行一些清理操作或其他必要的处理
		})
	}

	/** 「控制密钥」的查询键 */
	public static readonly KEY_CONTROL_KEY: string = 'key'
	/** 「分派动作」的查询键 */
	public static readonly KEY_ACTION: string = 'action'

	/**
	 * 请求侦听函数
	 *
	 * @param req 收到的请求
	 * @param res 预备的响应
	 */
	protected onRequest(req: IncomingMessage, res: ServerResponse): void {
		// 解析请求
		const queries: ParsedUrlQuery = parse(
			req.url?.slice(
				// 截取出「?`a = 1 & b=2`...」
				req.url.indexOf('?') + 1
			) ?? ''
		)
		const controlKey: string | string[] | undefined =
			queries?.[HTTPController.KEY_CONTROL_KEY]
		const action: string | string[] | undefined =
			queries?.[HTTPController.KEY_ACTION]
		let responseText: string = `No response of ${req.url}\n`
		// 根据请求分派操作 // ! 目前只有「控制密钥」与「分派动作」均为字符串时才分派
		if (typeof controlKey === 'string' && typeof action === 'string') {
			this.dispatchByControlKey(controlKey, action)
			responseText = `Action { ${controlKey}: ${action} } dispatched.\n`
		}
		// 响应请求
		res.writeHead(200, { 'Content-Type': 'text/plain' })
		res.end(responseText)
	}
}
