import { int } from '../../../legacy/AS3Legacy'
import Block from '../../../server/api/block/Block'
import IMapStorage from '../../../server/api/map/IMapStorage'

/**
 * 用来定义有关地图的显示
 */
/**
 * 用来显示地图的显示对象模型
 * * 作为一个对象容器，装载方块实例
 * * 配合「地图存储结构」使用
 * * 将用于调用其中每一个方块的
 *
 * TODO: 各类具体显示上的实现
 */

export default interface IMapDisplayer {
	get storage(): IMapStorage
	hasBlock(x: int, y: int): boolean
	getBlock(x: int, y: int): Block
	removeBlock(x: int, y: int): void
	clearBlock(): void
	setBlock(
		x: int,
		y: int,
		block: Block,
		overwrite?: boolean /* = true*/
	): void
}
