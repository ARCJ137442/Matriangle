import { uint } from "../../../../legacy/AS3Legacy";
import { MatrixProgram } from "../../../api/control/MatrixControl";
import { createServer, Server as HTTPServer, IncomingMessage, ServerResponse } from 'node:http';
import { Server as WSServer, WebSocket } from "ws" // 需要使用`npm i --save-dev ws @types/ws`安装
import IBatrMatrix from "../../../main/IBatrMatrix";
import { 母体可视化 } from "../../visualization/visualizations";

/**
 * 「母体可视化者」是
 * * 支持HTTP与WebSocket双协议的
 * * 用于传递母体的可视化信号的
 * * 响应式的
 * 母体程序
 */
export default class MatrixVisualizer extends MatrixProgram {

	/** 标签 */
	public static readonly LABEL = "MatrixVisualizer";

	// 构造函数&析构函数 //
	public constructor(
		/**
		 * 保存自身与母体的链接
		 */
		public linkedMatrix: IBatrMatrix | null = null
	) {
		super(MatrixVisualizer.LABEL);
	}

	// 母体可视化部分 //

	/**
	 * （静态）获取某个母体的可视化信号（文本）
	 * @param mapBlockStringLen 显示母体地图每一格的字符串长度
	 */
	public static getVisionSignal(matrix: IBatrMatrix, mapBlockStringLen: uint = 7): string {
		return 母体可视化(matrix.map.storage, matrix.entities)
	}

	/**
	 * 获取母体可视化的信号
	 * * 未连接母体⇒空字串
	 */
	public getVisionSignal(): string {
		if (this.linkedMatrix === null) return '';
		return MatrixVisualizer.getVisionSignal(this.linkedMatrix);
	}

	// 服务器部分 //

	/**
	 * 主机名称，如：
	 * * 本地主机`localhost`
	 * * 0.0.0.0
	 */
	protected _hostname: string = 'localhost';
	public get hostname(): string { return this._hostname }

	/**
	 * 端口
	 * * 默认为8080
	 */
	protected _port: uint = 8080;
	public get port(): uint { return this._port }

	/** （衍生）获取本机服务地址 */ // ! 注意：不是wss，那个要证书
	public get serverAddress(): string { return `${this.serverType}://${this._hostname}:${this._port}` }

	public get serverType(): string {
		return (
			this._server === undefined ?
				'undefined' :
				this._server instanceof HTTPServer ?
					'http' : 'ws'
		)
	}

	/**
	 * 存储当前HTTP服务器
	 */
	protected _server?: HTTPServer | WSServer;

	/**
	 * 启动HTTP服务器
	 * * 似乎缺少一个「是否启动成功」的标签信息
	 */
	public launchHTTPServer(ip: string, port: uint): void {
		this._hostname = ip;
		this._port = port;
		// 创建服务器，并开始侦听
		try {
			this._server = createServer((req: IncomingMessage, res: ServerResponse): void => {
				// 直接以「母体信号」响应请求
				res.writeHead(200, { 'Content-Type': 'text/plain' });
				res.end(this.getVisionSignal());
			});
			this._server.listen(
				this._port, this._hostname,
				(): void => {
					// 启动成功
					console.log(
						`HTTP服务器启动成功，地址：http://${this._hostname}:${this._port}/`,
					);
				}
			);
		}
		catch (e) {
			console.error(`HTTP服务器${this._hostname}:${this._port}启动失败！`, e);
		}
	}

	/**
	 * 终止HTTP服务器
	 */
	public stopHTTPServer(): void {
		this._server?.close((): void => {
			console.log(`HTTP服务器${this._hostname}: ${this._port}已关闭！`);
			// 这里可以执行一些清理操作或其他必要的处理
		});
	}

	/**
	 * 启动WebSocket服务器
	 * * 似乎缺少一个「是否启动成功」的标签信息
	 */
	public launchWebSocketServer(ip: string, port: uint): void {
		this._hostname = ip;
		this._port = port;
		// 创建服务器，并开始侦听
		try {
			this._server = new WSServer(
				{ host: this._hostname, port: this._port },
				(): void => {
					console.log(`${this.serverAddress}：服务器已成功启动`)
				}
			);
			this._server.on(
				'connection',
				(socket: WebSocket): void => {
					// 启动成功
					console.log(
						`${this.serverAddress}：WebSocket连接已建立`,
						socket
					);
					// 继续往Socket添加钩子
					socket.on('message', (): void => {
						// 不管啥消息，直接发回去
						socket.send(this.getVisionSignal());
					});
					socket.on('close', (code: number, reason: string): void => {
						console.log(
							`${this.serverAddress}：WebSocket连接已断开`,
							code, reason
						);
					});
				},
			);
		}
		catch (e) {
			console.error(`${this.serverAddress}：服务器启动失败！`, e);
		}
	}

	/**
	 * 终止WebSocket服务器
	 */
	public stopWebSocketServer(): void {
		this._server?.close((): void => {
			console.log(`${this.serverAddress}：服务器已关闭！`);
			// 这里可以执行一些清理操作或其他必要的处理
		});
	}

}