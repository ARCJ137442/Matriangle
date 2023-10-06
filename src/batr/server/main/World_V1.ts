import IBatrMatrix from "./IBatrMatrix";
import IBatrWorld from "./IBatrWorld";
import IBatrRegistry from "../mods/native/registry/IBatrRegistry";

/**
 * 第一代「世界主体」
 * 包含：两个系统
 * * 母体：承载并控制所有「世界运行」有关的事物
 *   * 负责如「实体管理」「地图变换」「世界规则」等机制运作
 *   * 不负责有关「世界注册信息」的处理，例如「实体类型列表」
 * * 「总注册表」：负责与「对象化/反对象化」「类型映射表」等数据交互
 *   * 只负责「查找&返回」与「保存&加载」，不负责「具体运行」
 */
export default class World_V1 implements IBatrWorld {

	public constructor(
		protected _matrix: IBatrMatrix,
		protected _registry: IBatrRegistry,
	) { }

	get matrix(): IBatrMatrix { return this._matrix; }
	get registry(): IBatrRegistry { return this._registry; }

}
