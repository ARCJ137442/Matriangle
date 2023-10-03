import { uint } from "../../../legacy/AS3Legacy";

/**
 * Use for manage entries in game.
 * 用于管理任何「容器」
 * * 源自AS3版本的`EntitySystem`与`EffectSystem`
 */
export default class CommonSystem<T> {
	//============Static variables============//

	//============Instance variables============//

	// UUID

	/**
	 * The list of entry also uses to represent UUIDs for entries,
	 * the UUID for every entry instanceof just its unique immutable index 
	 * 所有元素的列表，每个元素都有一个固定的UUID
	 * 
	 * Remove an entry will ony `delete` the reference and change it to `undefined`
	 * ! 删除元素只会使用`delete`运算符，然后把所删除位置的值变成`undefined`
	 */
	protected _entries: T[];

	/**
	 * 控制是否复用UUID
	 * * 若启用，则添加元素时，会搜索整个数组并寻找UUID
	 * * 一般在「需要避免数组过长」的地方使用
	 *   * 比如「抛射体」「特效」这类「生命周期短」的元素
	 */
	public reuseUUID: boolean = false;

	//============Constructor & Destructor============//
	/**
	 * 构造函数
	 * * 会复制传入的元素列表作为自身列表
	 * 
	 * @param entries 最初的元素列表
	 */
	public constructor(...entries: T[]) {
		this._entries = [...entries];
	}

	//============Destructor Function============//
	public destructor(): void {
		this.clear();
		this._entries = [];
	}

	//============Instance Getters And Setters============//

	/**
	 * 获取所有元素（数组）
	 * 
	 * ! 返回其内部元素的引用
	 */
	public get entries(): T[] {
		return this._entries;
	}

	protected _temp_numEntries = 0;
	/**
	 * 返回当前的元素数量
	 * 
	 * ! 不一定就是「元素数组」的`length`
	 * 
	 * * 使用缓存的变量提高性能
	 */
	public get numEntries(): uint {
		return this._temp_numEntries;
	}

	//============Instance Functions============//
	// UUID About //

	/**
	 * 检查一个UUID是否为空
	 * @param uuid 具体的UUID
	 * @returns 这个UUID是否为空
	 */
	public isEmptyUUID(uuid: uint): boolean {
		return this._entries[uuid] === undefined;
	}

	/**
	 * 检查一个UUID（在此）是否合法
	 * @param uuid 具体的UUID
	 * @returns 这个UUID是否合法（对应了一个元素）
	 */
	public isValidUUID(uuid: uint): boolean {
		return this._entries[uuid] !== undefined;
	}

	/**
	 * 获取下一个空的UUID
	 */
	public nextEmptyUUID(): uint {
		if (this.reuseUUID) {
			let i: uint = 0;
			if (this.isEmptyUUID(i))
				return i;
			// if the first isn't
			while (!this.isEmptyUUID(++i));
			return i;
		}
		else
			return this._entries.length
	}

	/**
	 * 通过UUID检索对应元素
	 * 
	 * @param uuid 用于检索的UUID
	 * @returns UUID所对应的元素
	 */
	public getByUUID(uuid: uint): T | undefined {
		return this._entries[uuid];
	}

	/**
	 * 获取一个元素的UUID
	 * 
	 * @param entry 要检查的元素
	 * @returns 元素的UUID（无⇒-1）
	 */
	public indexOf(entry: T): uint {
		return this._entries.indexOf(entry);
	}

	/**
	 * 检查一个元素是否有合法的UUID
	 * @param entry 要检查的元素
	 * @returns 元素是否处在其中
	 */
	public hasValidUUID(entry: T): boolean {
		return this._entries.indexOf(entry) !== -1;
	}

	/**
	 * 获取所有元素
	 * @returns 所有元素组成的数组（新数组）
	 */
	public getAllEntry(): T[] {
		let result: T[] = new Array<T>();
		for (let obj of this._entries)
			if (obj !== undefined)
				result.push(obj as T);
		return result;
	}

	/**
	 * 获得所有已注册的UUID
	 * 
	 * @returns 一个数组
	 */
	public get allValidUUID(): uint[] {
		let result: uint[] = [];
		for (let i: uint = 0; i < this._entries.length; i++)
			if (this.isValidUUID(i))
				result.push(i);
		return result;
	}

	/**
	 * 注册元素
	 * 
	 * ! 不会查重
	 * 
	 * @param entry 要注册入的元素
	 * @returns 自身
	 */
	public register(entry: T): this {
		let newUUID: uint = this.nextEmptyUUID();
		this._entries[newUUID] = entry;
		this._temp_numEntries++;
		return this;
	}

	/**
	 * 在某个UUID处注册一个元素
	 * 
	 * ! 不会查重
	 * 
	 * @param entry 要注册入的元素
	 * @returns 自身
	 */
	public registerAt(entry: T, uuid: uint): this {
		this._entries[uuid] = entry;
		this._temp_numEntries++;
		return this;
	}

	/**
	 * 添加元素
	 * 
	 * ! 会查重
	 * 
	 * @param entry 要注册入的元素
	 * @returns 是否添加成功
	 */
	public add(entry: T): boolean {
		if (this.hasValidUUID(entry)) return false;
		this.register(entry)
		return true;
	}

	/**
	 * 在指定UUID处添加元素
	 * 
	 * ! 会查重
	 * 
	 * @param entry 要添加的元素
	 * @param uuid 添加到的UUID
	 * @returns 是否添加成功
	 */
	public addAt(entry: T, uuid: uint): boolean {
		if (this.isValidUUID(uuid)) return false;
		this._entries[uuid] = entry;
		return true;
	}

	/**
	 * 移除元素
	 * 
	 * @param entry 要移除的元素
	 * @returns 是否移除成功
	 */
	public remove(entry: T): boolean {
		let uuid: uint = this._entries.indexOf(entry);
		if (uuid > 0) return this.removeAt(uuid);
		return false;
	}

	/**
	 * 在指定UUID处移除元素
	 * 
	 * ! 会查重
	 * 
	 * @param entry 要移除的元素
	 * @param uuid 移除到的UUID
	 * @returns 是否移除成功
	 */
	public removeAt(uuid: number): boolean {
		delete this._entries[uuid];
		this._temp_numEntries--;
		return true;
	}

	/**
	 * 清除所有元素
	 */
	public clear(): void {
		for (let i: uint = 0; i < this._entries.length; i++)
			delete this._entries[i];
		this._temp_numEntries = 0;
	}

	/**
	 * 回收曾添加过（但现已删除的）元素
	 * * 原理：删去所有值为`undefined`的元素
	 * 
	 * ! 可能改变原有元素的UUID
	 */
	public GC(): void {
		for (let i = this._entries.length - 1; i >= 0; i--)
			if (this.isEmptyUUID(i))
				this._entries.splice(i, 1);
	}
}
