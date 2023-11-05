import Block from 'matriangle-api/server/block/Block'
import BlockAttributes from 'matriangle-api/server/block/BlockAttributes'
import { typeID } from 'matriangle-api/server/registry/IWorldRegistry'
import { MapFromGeneratorKV } from 'matriangle-common/utils'
import { BlockConstructorMap } from 'matriangle-api/server/map/IMapStorage'
import BSColored from '../block/BSColored'

/**
 * 原生「方块属性」注册表
 *
 * ! 【20230910 9:33:30】独立成单个注册表，避免循环导入问题
 * * 避免在未生成NativeBlockAttributes时注册「方块类型」时引用各自方块类，而类中又引入NativeBlockAttributes的问题
 */
export module BlockAttributes_Native {
	/** 空：就像「空气」一样 */
	export const VOID: BlockAttributes = new BlockAttributes(16777215, 0).asGas
	/** 颜色方块：一般的「固体」 */
	export const COLORED_BLOCK: BlockAttributes = new BlockAttributes(0).asSolid
}

/**
 * 方块原型列表
 * * 存储所有原生方块的「原型对象」
 *
 * !【2023-10-07 17:09:30】⚠️这里的所有对象，在被外部用于赋值时，都应该先进行深拷贝
 * * 不深拷贝则会影响到后续创建的稳定性
 */
export namespace NativeBlockPrototypes {
	export const VOID: Block<null> = new Block(
		'Void',
		BlockAttributes_Native.VOID,
		null
	)

	/**
	 * 带颜色方块
	 * !【2023-10-09 20:16:59】保留这个「带颜色方块」，用作更通用的用途
	 */
	export const COLORED: Block<BSColored> = new Block(
		'Colored',
		BlockAttributes_Native.COLORED_BLOCK,
		new BSColored(0x000000)
	) // 默认的黑色方块
}

/**
 * 原生方块ID
 * ? 💭这里的「ID管理」似乎有些混乱
 * * 暂且就使用类名
 */
export namespace NativeBlockIDs {
	export const VOID: typeID = NativeBlockPrototypes.VOID.id

	export const COLORED: typeID = NativeBlockPrototypes.COLORED.id
}

/**
 * 所有「原生方块」
 */
export const ALL_NATIVE_BLOCKS: Block[] = [
	NativeBlockPrototypes.VOID,
	NativeBlockPrototypes.COLORED,
]

/**
 * 用于「ID⇒零参构造函数」的映射表
 * * 应用：「ID⇒白板对象⇒JS反对象化」
 * * 📌在真正加载出「母体」的时候，「所有导入的注册表」中的映射表将合并成一个「总映射表」
 */
export const NATIVE_BLOCK_CONSTRUCTOR_MAP: BlockConstructorMap =
	MapFromGeneratorKV(
		ALL_NATIVE_BLOCKS,
		(block: Block): typeID => block.id,
		(block: Block): (() => Block) =>
			(): Block =>
				block.copy()
	)
