import IBatrMatrix from "./IBatrMatrix";
import IBatrRegistry from "../mods/native/registry/IBatrRegistry";

/**
 * TODO: 有待施工
 * 1. 抽象出一个带说明、包含「事件处理」的「游戏接口」
 * 2. 让游戏实现这个接口
 * 
 * ```
 * 游戏只需要提供一个通用的API
 * 负责最基本的加载（方块内容、实体内容、地图内容）
 * 以及运行（游戏时钟、事件分派）
 * 基本就够了
 * 
 * 剩下的一些与本身运作模式毫不相干的东西
 * 完全可以外包到某个 / 某些「注册机制」（或者更简单的说，「游戏模组」）里
 * 机制（内容）与运作（形式）分离
 * 这样就可以最大化其中的通用性……
 * ```
 * 
 * 正式文档：参见实现的接口
 */

export default interface IBatrGame {

	//========世界运作：游戏母体========//
	get matrix(): IBatrMatrix;

	//========注册机制：总注册表========//
	get registry(): IBatrRegistry;

}
