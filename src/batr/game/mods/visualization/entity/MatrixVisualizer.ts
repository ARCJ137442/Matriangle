import { uint } from "../../../../legacy/AS3Legacy";
import { MatrixProgram } from "../../../api/control/MatrixControl";
import { createServer, Server, IncomingMessage, ServerResponse } from 'node:http';
import IBatrMatrix from "../../../main/IBatrMatrix";
import { 母体可视化 } from "../visualizations";

/**
 * 「母体可视化者」是
 * * 使用HTTP包建立HTTP服务器的
 * * 用于传递「游戏母体」的可视化信号的
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

	/**
	 * 存储当前HTTP服务器
	 */
	protected _server?: Server;

	/**
	 * 启动HTTP服务器
	 */
	public launchServer(ip: string, port: uint): void {
		this._hostname = ip;
		this._port = port;
		// 创建服务器，并开始侦听
		try {
			this._server = createServer(this.onRequest.bind(this));
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
	public stopServer() {
		this._server?.close(() => {
			console.log(`HTTP服务器${this._hostname}: ${this._port}已关闭！`);
			// 这里可以执行一些清理操作或其他必要的处理
		});
	}
	/**
	 * 请求侦听函数
	 * 
	 * @param req 收到的请求
	 * @param res 预备的响应
	 */
	public onRequest(req: IncomingMessage, res: ServerResponse): void {
		// 直接以「母体信号」响应请求
		res.writeHead(200, { 'Content-Type': 'text/plain' });
		res.end(this.getVisionSignal());
	}

}