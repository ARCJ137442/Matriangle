import { addNReturnKey, getClass, identity, key } from "../../../common/utils";
import { Class, uint } from "../../../legacy/AS3Legacy";
import { IBatrDisplayable, IBatrShape } from "../../../display/api/BatrDisplayInterfaces";
import BlockAttributes from "./BlockAttributes";
import { IJSObjectifiable, JSObject, JSObjectifyMap, fastGenerateJSObjectifyMapProperty, loadRecursiveCriterion_false, uniLoadJSObject } from "../../../common/JSObjectify";

/** 【2023-10-02 23:13:00】所谓「方块类型」就是类本身 */
export type BlockType = Class;

/**
 * One of the fundamental element in BaTr
 * 
 * !【2023-10-02 23:12:26】方块不存储位置信息
 * 
 * TODO: 【2023-09-24 18:42:16】这玩意儿也要参与序列化吗？
 */
export default abstract class Block implements IBatrDisplayable, IJSObjectifiable<Block> {

	// JS对象 //

	/** JS对象化映射表 */
	// TODO: 【2023-09-24 18:43:55】有待建设。一个方法是借助BlockType等对象存储「id」借以映射到类，再往各个类塞入「模板函数」（累）
	public static readonly OBJECTIFY_MAP: JSObjectifyMap = {}
	public get objectifyMap(): JSObjectifyMap { return Block.OBJECTIFY_MAP }

	/**
	 * 🔬ID：用于在「对象化」前后识别出「是哪一个类」
	 * * 默认返回的是「其类型之名」，技术上是「构造函数的名字」
	 */
	// public abstract readonly id: string;
	public readonly id: string;
	// public get id(): string { return this.type.name }
	// public set id(never: string) { } // 空setter，代表「不从外界获得id」 // ! 但实际上会被「非法id」筛掉
	public static readonly key_id: key = addNReturnKey(
		this.OBJECTIFY_MAP, 'id', fastGenerateJSObjectifyMapProperty(
			'id', 'string',
			identity, identity,
			loadRecursiveCriterion_false,
		)
	)

	/**
	 * 获取「方块类型」
	 * !【2023-09-24 20:24:09】这个「类型」目前直接返回其类（构造器）
	 */
	public get type(): BlockType {
		return getClass(this) as BlockType;
	}

	/** 实现「复制白板」：获取其类，然后零参数构造类 */
	public cloneBlank(): Block {
		return (getClass(this) as any)()
	}
	/** 静态的「创建白板」：直接从「随机实例」中拿 */ // ! 不稳定——可能「没有自己构造函数的类」只会构造出「父类的实例」
	public static getBlank(): Block { return this.randomInstance(this as BlockType) }

	public static fromJSObject(jso: JSObject, typeMap: Map<key, BlockType>): Block {
		if (jso?.id === undefined) throw new Error('方块类型不存在！');
		const bType: BlockType | undefined = typeMap.get((jso as any).id);
		if (bType === undefined) throw new Error(`方块类型${jso.id}不存在！`);
		return uniLoadJSObject(
			this.randomInstance(bType), // 用「随机实例」来获取「白板对象」
			jso
		)
	}

	/**
	 * 从「方块类型」获取一个随机参数的实例
	 * ! 在「方块类型=类(构造函数)」的情况下，type参数就是类自身
	 * * 用于：地图生成「随机获取方块」
	 * @param type 方块类型
	 */
	public static randomInstance(type: BlockType): Block {
		return new (type as any)(); // ! 此处必将是构造函数，因此必能构造
	}

	//============Constructor & Destructor============//
	/**
	 * 构造方法
	 * 
	 * !【2023-09-24 20:26:14】注意：
	 * 
	 * @param attributes 传入的「方块属性」
	 */
	public constructor(attributes: BlockAttributes) {
		this.id = this.type.name; // !【2023-09-24 21:04:51】可能是不稳定的
		this._attributes = attributes;
	}

	public destructor(): void { }

	public abstract clone(): Block;

	//============World Mechanics============//
	/**
	 * Every Block has a `BlockAttributes` to define its nature, 
	 * it determinate the block's behavior in world.
	 * 
	 * * It only contains the **reference** of the attributes, so it don't uses much of memory when it instanceof linked to a static constant.
	 */
	protected _attributes: BlockAttributes;
	public get attributes(): BlockAttributes {
		return this._attributes;
	}

	// ! 此处的「响应随机刻」因「循环导入问题」被移除

	//============Display Implements============//
	protected _zIndex: uint = 0;
	get zIndex(): uint { return this._zIndex }
	set zIndex(value: uint) {
		this._zIndex = value
		// TODO: 增加回调事件，更新显示对象（💭需要一种「响应式更新，不能全靠显示端自己主动」）
	}

	/** Determinate the single-pixel color */
	public get pixelColor(): uint {
		return this.attributes.defaultPixelColor // default
	}

	public get pixelAlpha(): number {
		return this.attributes.defaultPixelAlpha // default
	}

	/** 可显示 */
	public readonly i_displayable: true = true;

	/** 初始化：无 */
	public shapeInit(shape: IBatrShape): void { }

	/** 默认实现：重绘图形 */
	public shapeRefresh(shape: IBatrShape): void {
		this.shapeDestruct(shape);
		this.shapeInit(shape);
	}

	/** 默认实现：删除绘图数据 */
	public shapeDestruct(shape: IBatrShape): void {
		shape.graphics.clear();
	}
}
