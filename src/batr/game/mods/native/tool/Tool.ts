import { IBatrJSobject, JSObject } from "../../../../common/abstractInterfaces";

/**
 * 原`Tool`，现为（暂时轻量级的）「工具」类
 *
 *  「工具」是
 * * 能被「使用者」（暂定为玩家）使用的
 * * 可以绑定各种属性的
 * * 可以很容易被复制、又可以作为一个「共同引用模板」的
 * 对象类型
 */
export default abstract class Tool implements IBatrJSobject<Tool> {

	//============Static Getter And Setter============//
	public static get label(): string {
		return 'tool';
	}

	/**
	 * ! 一些原本是用于「静态注册表」（压根不为可能的后续Mods开发着想）的方法已被移除
	 * ! 一些用于「类型」而非「类型の实例」的方法已被移除，以适应新的「类&继承」架构
	 * 
	 * * 新的架构（草案）：
	 *   * 一个实例相当于一个
	 *   * 把「武器」单独开一个类，利用面向对象特性复用其属性
	 *   * 其他情况可以用来开发一些像「方块迁移器」（临时名，其存储「所持有的方块」以兼容TriangleCraft这类沙盒向游戏）的「更自定义化工具」
	 *   
	 */

	//============Instance Variables============//
	protected _name: string;

	//============Constructor & Destructor============//
	public constructor(name: string) {
		this._name = name;
	}

	// JS对象 //
	public abstract toObject(): JSObject;
	public abstract copyFromObject(obj: JSObject): Tool;
}
