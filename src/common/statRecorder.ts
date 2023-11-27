import { uint } from 'matriangle-legacy'
import { DictionaryLikeObject } from './utils'

/**
 * 一个简单的「统计记录器」
 * * 🎯设置在浏览器端，用于复制实验数据
 * * 🚩用于记录以对象形式存储的实验数据，并可输出为TSV
 *
 * @example 测试代码：
 * const recorder = new StatRecorder({ a: 1, b: 2, c: 3 })
 * recorder.add({ a: 4, b: 2, c: 3 })
 * recorder.add({ a: 4, b: 5, c: 6 })
 * console.log(recorder.toTSV(['a', 'b', 'c']))
 *
 * log输出：
 *  	a	b	c
 * 0	1	2	3
 * 1	4	2	3
 * 2	4	5	6
 */
export class StatRecorder<
	/**
	 * 需要跟踪的「统计数据」类型
	 */
	S extends DictionaryLikeObject,
> {
	/**
	 * 内部存储「系列统计值」的对象
	 * * 对于缺失值，存储undefined
	 */
	protected _datas: {
		[key in keyof S]: (S[key] | undefined)[]
	}

	/**
	 * 内部存储「数据长度」的值
	 * * 反映了内部存储的「数据包」的个数
	 */
	protected _length: uint = 0
	/**
	 * （只读）「数据长度」
	 * * 反映其内部数组的长度
	 * * 同样是其目前所拥有的数据包个数
	 */
	public get length(): uint {
		return this._length
	}

	/**
	 * 「数据宽度/数据大小」的值
	 * * 反映的是「有多少种不同的数据」
	 */
	public get size(): uint {
		return Object.keys(this._datas).length
	}

	/**
	 * 构造函数1
	 * * 使用「初始数据」初始化各个键的历史数据
	 * @param keys 需要跟踪的「初始数据」对象
	 */
	public constructor(initialData: S)
	/**
	 * 构造函数2
	 * * 使用「初始键集合」初始化各个键的历史数据
	 * @param keys 需要跟踪的「统计数据」键集合
	 */
	public constructor(keys: (keyof S)[])
	public constructor(keys_or_initialData: S | (keyof S)[]) {
		// 初始化对象
		this._datas = {} as S
		// 填充初始数组
		if (Array.isArray(keys_or_initialData)) {
			for (const key of keys_or_initialData) {
				// 因为只是键，所以没有值
				this._datas[key] = []
			}
		} else {
			for (const key in keys_or_initialData) {
				// 这时候里面已经有值
				this._datas[key] = [keys_or_initialData[key]]
			}
			// 更新长度
			this._length = 1
		}
	}

	/**
	 * 追加值
	 * * 🚩核心逻辑：有键追加，无键undefined
	 */
	public add(data: S): void {
		// 现在使用「可选访问」直接追加元素
		for (const key in this._datas)
			this._length = this._datas[key].push(data?.[key])
	}

	/**
	 * 转换成XSV
	 *
	 * ! 注意：暂时不会将「内部出现的分隔符」进行转义处理
	 *
	 * @param order 列出现的顺序
	 * @param columnSeparator 列分隔符
	 * @param rowSeparator 行分隔符
	 */
	public toXSV(
		order: (keyof S)[],
		columnSeparator: string,
		rowSeparator: string,
		columnName: boolean = true,
		rowIndex: boolean = true
	): string {
		/* // 实际上一个map两个join就搞定了 // ! 不要有这种想法：这样获得的是要转置的数据！
		return (
			(rowIndex ? columnSeparator : '') +
			(columnName ? order.join(columnSeparator) + rowSeparator : '') +
			order
				.map(
					(value: keyof S, index: uint): string =>
						(rowIndex ? index + columnSeparator : '') +
						this._datas[value].join(columnSeparator)
				)
				.join(rowSeparator)
		) */
		let result =
			// 列名/行索引
			(rowIndex ? columnSeparator : '') +
			(columnName ? order.join(columnSeparator) + rowSeparator : '')
		// 长度上逐行遍历
		for (let row = 0; row < this.length; row++) {
			// 行索引
			if (rowIndex) result += String(row) + columnSeparator
			// 宽度上逐列遍历
			for (let col = 0; col < order.length; col++) {
				// 分隔符
				if (col > 0) result += columnSeparator
				result += this._datas[order[col]][row]
			}
			result += rowSeparator
		}
		// 返回
		return result
	}

	/**
	 * 特殊：将「数据」转换成「TSV」
	 * * 「TSV」是「Tab Separated Values」的缩写
	 * * 核心：「XSV」在`rowSeparator='\n'`、`columnSeparator='\t'`的情况
	 *
	 * ! 注意：暂时不会将「内部出现的分隔符」进行转义处理
	 */
	public toTSV(
		order: (keyof S)[],
		columnSeparator: boolean = true,
		rowIndex: boolean = true
	): string {
		return this.toXSV(order, '\t', '\n', columnSeparator, rowIndex)
	}
}
