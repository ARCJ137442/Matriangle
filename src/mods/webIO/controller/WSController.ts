import { uint } from '../../../legacy/AS3Legacy'
import { Server, WebSocket } from 'ws' // 需要使用`npm i --save-dev ws @types/ws`安装
import MultiKeyController from './MultiKeyController'
import { MatrixProgramLabel } from '../../../api/server/control/MatrixProgram'

/**
 * 「WebSocket控制器」
 * * 启动一个WebSocket服务器，接收外界服务器消息
 * * 使用「控制密钥」机制，以实现「一个服务器运行，指挥多个玩家」
 *   * 「控制密钥」相同的玩家会被同时分派相同的动作
 *   * 这点从`MultiKeyController`中继承
 * * 消息格式：`控制密钥|分派动作`
 *   * 实际情况请参考类常量`KEY_CONTROL_KEY`与`KEY_ACTION`
 * * 连接玩家时，
 *   * 可以通过「生成订阅」直接创建链接（此时密钥=玩家名称）
 *   * 也可以通过「添加链接」自定义「控制密钥」
 *
 * ! 这个控制器需要`Node.js`支持
 */
export default class WSController extends MultiKeyController {
	/** 共同的标签：WebSocket控制器 */
	public static readonly LABEL: MatrixProgramLabel = 'WebSocket'

	// 构造函数&析构函数 //

	/**
	 * 构造函数
	 * * 不包括IP、端口的注册
	 */
	public constructor() {
		super(WSController.LABEL)
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

	/** （衍生）获取本机服务地址 */ // ! 注意：不是wss，那个要证书
	public get serverAddress(): string {
		return `ws://${this.hostname}:${this._port}`
	}

	/**
	 * 存储当前WebSocket服务器
	 */
	protected _server?: Server

	/**
	 * 启动WebSocket服务器
	 */
	public launchServer(ip: string, port: uint): void {
		this._hostname = ip
		this._port = port
		// 创建服务器，并开始侦听
		try {
			this._server = new Server(
				{ host: this._hostname, port: this._port },
				(): void => {
					console.log(`${this.serverAddress}：服务器已成功启动`)
				}
			)
			this._server.on('connection', this.onWSConnect.bind(this))
		} catch (e) {
			console.error(`${this.serverAddress}：服务器启动失败！`, e)
		}
	}

	/**
	 * 终止WebSocket服务器
	 */
	public stopServer(): void {
		this._server?.close((): void => {
			console.log(`${this.serverAddress}：服务器已关闭！`)
			// 这里可以执行一些清理操作或其他必要的处理
		})
	}

	/**
	 * 当建立WS连接时
	 */
	protected onWSConnect(socket: WebSocket): void {
		// 连接成功
		console.log(`${this.serverAddress}：WebSocket连接已建立`, socket)
		// 继续往Socket添加钩子
		socket.on('message', this.onWSMessage.bind(this))
		socket.on('close', this.onWSClose.bind(this))
	}

	/**
	 * 消息侦听
	 * * 格式：`控制密钥|分派动作`
	 *   * 💭这意味着「控制密钥」不能使用「|」字符
	 *
	 * @param message 收到的「8bit数据缓冲区」（需要使用`String.fromCodePoint`方法）
	 */
	protected onWSMessage(message: Buffer): void {
		// 解析消息
		let controlKey: string, action: string
		const messageStr: string = message.toString('utf-8')
		try {
			// !【2023-10-06 22:15:57】这要求消息格式必须是二元组
			;[controlKey, action] = messageStr.split('|')
		} catch (e) {
			console.error(
				`${this.serverAddress}：消息「${messageStr}」解析失败！`,
				e
			)
			return
		}
		// 根据消息分派操作
		this.dispatchByControlKey(controlKey, action)
	}

	/**
	 * 连接结束
	 * @param code 断开的消息码
	 * @param reason 断开原因
	 */
	protected onWSClose(code: number, reason: string): void {
		console.log(`${this.serverAddress}：WebSocket连接已断开`, code, reason)
	}
}
