import IMap from '../map/IMap'
import Entity from '../entity/Entity'
import IMatrixRule from '../rule/IMatrixRule'
import IWorldRegistry from '../registry/IWorldRegistry'
import { voidF } from 'matriangle-common/utils'
import { IDisplayable } from '../../display/DisplayInterfaces'
import { IDisplayDataMatrix } from '../../display/RemoteDisplayAPI'

/**
 * 母体：承载并控制所有「世界运行」有关的事物
 * * 负责如「实体管理」「地图变换」「世界规则」等机制运作
 * * 不负责「世界运行」以外的事务
 *   * 有关「世界注册信息」的处理：如「实体类型列表」
 *   * 有关「世界呈现/显示」的功能，如「国际化文本」「显示端」
 *
 * TODO: 是否要把「实体系统」「地图」这两遍历内置（封装），仅对外部保留必要接口（以便后续显示更新）？
 *
 * 可以基于此假设多种「端侧」
 * * 服务端：世界在实际上运作于此上，用于实际运行代码
 * * 客户端：类似Minecraft，世界只有一部分机制运行于此上（仅为流畅考虑）
 *   * 用于「呈现远程服务端运行结果」「与服务端进行交互同步」
 */
export default interface IMatrix extends IDisplayable<IDisplayDataMatrix> {
	/**
	 * 持有一个「注册表引用」，用于在分派事件时查表
	 */
	get registry(): IWorldRegistry

	//========🌟实体部分：实体管理、实体事件等========//
	/**
	 * ? 是否要把这个「实体管理系统」暴露出去？
	 * * 📌或许这个应该把「内部的实体管理者」封装好，不要让外界过多访问
	 */
	// get entitySystem(): EntitySystem;
	// get numPlayers(): uint; // !【2023-10-03 23:42:20】目前废弃：这里不应该留有任何「专用代码」……通用与效率的冲突，且「没有任何后门……」
	// get nextPlayerID(): uint // !【2023-10-02 22:04:47】废弃：应该在外部缓存，而非在母体之中
	// get nextAIID(): uint // !【2023-10-02 22:04:47】废弃：应该在外部缓存，而非在母体之中
	// set entityAndEffectVisible(value: boolean); // !【2023-10-02 22:36:32】弃用：不再涉及「显示呈现」

	/**
	 * 获取所有实体
	 */
	get entities(): Entity[]

	/**
	 * （新）管理实体
	 * * 但一般上是「转交给相应的『实体系统』处理」
	 *
	 * !【2023-10-09 01:34:14】建议在添加实体时，先把实体的坐标进行投影
	 *
	 * @returns 是否添加成功
	 */
	addEntity(entity: Entity): boolean

	/**
	 * 批量添加一系列实体
	 */
	addEntities(...entities: Entity[]): void

	/**
	 * @returns 是否删除成功
	 */
	removeEntity(entity: Entity): boolean

	/**
	 * 🆕在「实体循环」后插入一段「最终代码」
	 * * 原理：插入之后的闭包函数，母体在「遍历全部实体的『游戏刻』」后自动执行并丢弃
	 * * 应用：「地图切换机制」中用于防止「切换之后还需要遍历实体」的情况
	 */
	insertFinalExecution(exe: voidF): void

	//========🗺️地图部分：地图加载、地图变换等========//
	/**
	 * 世界中所有加载的地图
	 * * 用于地图切换时在此中选择
	 *
	 * ! 世界地图不再以「ID」作为索引：当一个世界/世界规则被导出成JS对象时，会直接原样输出所有地图文件
	 *
	 * ? 具体实现有待商议：或许需要某种「内联机制」比如「NativeMapPointer」（ID→指向内联地图的「内联指针」）
	 *
	 * !【2023-10-04 23:25:48】现在母体不再管理地图，转而由其「规则」管理。。。
	 */
	// get loadedMaps(): IMap[];
	// get numLoadedMaps(): uint;

	/**
	 * ? 是否要把这个「当前地图」暴露出去？
	 * * 📌或许这个也应该被封装好，不要让外界过多访问？
	 * * 💭另一个取舍之处：地图接口中太多的函数需要「传递性实现」了，这样还不如复合一个地图/直接继承「地图」。。。
	 *
	 * !【2023-10-08 21:49:30】现在开放了setter，因为需要在外部设置地图
	 */
	get map(): IMap
	set map(value: IMap)
	// get mapIndex(): uint; // !【2023-10-02 23:26:35】现在讨论「索引」无意义
	// get mapWidth(): uint; // !【2023-10-02 22:46:28】高维化现在不再需要
	// get mapHeight(): uint; // !【2023-10-02 22:46:28】高维化现在不再需要
	// get mapTransformPeriod(): uint // !【2023-10-16 23:50:36】地图的「变换周期」现在也外置了
	// set mapVisible(value: boolean); // !【2023-10-02 22:36:32】弃用：不再涉及「显示呈现」

	//========🎯规则部分：规则加载、规则读写========//
	/**
	 * 世界所对应的「世界规则」
	 * * 用于在不修改源码的情况下，更简单地定制世界玩法
	 *
	 */
	get rule(): IMatrixRule

	/**
	 * 根据自身所加载的规则初始化
	 * * 源自`Game.load`方法
	 *
	 * ?【2023-10-11 23:39:05】这个函数似乎是旧有游戏机制的残留，似乎应该外置到「世界机制」中去
	 *
	 * @returns 是否初始化成功
	 */
	initByRule(): boolean
	// becomeActive?: boolean/* = false*/ // !【2023-10-04 23:44:00】现已废弃

	/**
	 * 重置母体状态
	 * * 重置规则
	 * * 删除侦听器
	 * * 清空实体
	 * * 清空地图
	 * * 取消活跃状态
	 */
	reset(): boolean

	/**
	 * 使用当前规则重新开始
	 * * 具体以原有实现为准
	 */
	restart(rule: IMatrixRule): void
	// becomeActive?: boolean/* = false*/ // !【2023-10-04 23:44:00】现已废弃

	/**
	 * 使用某个规则强制重置&重启
	 * * 具体以原有实现为准
	 */
	forceStart(rule: IMatrixRule): boolean
	// becomeActive?: boolean/* = false*/ // !【2023-10-04 23:44:00】现已废弃

	/**
	 * 世界主时钟
	 * * 决定世界各个实体的运行
	 */
	tick(): void

	//========🤖控制部分：主循环、控制器等========//
	/**
	 * 控制世界自身「是否活跃」
	 * * 在设置「是否活跃」的时候，可能需要「更改侦听器」等附加动作辅助
	 *
	 * !【2023-10-04 23:39:22】现在因「作用不明」取消该特性
	 */
	// get isActive(): boolean;
	// set isActive(value: boolean);
	/**
	 * 母体本身「是否已加载」
	 *
	 * !【2023-10-04 23:39:22】现在因「作用不明」取消该特性
	 */
	// get isLoaded(): boolean;

	//========💭其它函数：考虑外迁========//
	//====About World End====// ? 是否也可以实现为一个「世界控制器」
	// TODO: 待外置
	/** Condition: Only one team's player alive. */
	// isPlayersEnd(players: IPlayer[]): boolean;
	// getAlivePlayers(): IPlayer[]
	// getInMapPlayers(): IPlayer[]
	// testWorldEnd(force?: boolean/* = false*/): void;
	// onWorldEnd(winners: IPlayer[]): void;
	// getMatrixResult(winners: IPlayer[]): MatrixResult;
}
