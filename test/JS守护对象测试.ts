import {
	JSObject,
	JSObjectValue,
	JSObjectValueWithUndefined,
	copyJSObjectValueWithUndefined_deep,
	copyJSObjectValue_deep,
	diffJSObjectValue,
	getSharedRef,
	isJSObject,
	isJSObjectKey,
	isJSObjectValue,
	isJSObjectValueEqual_deep,
	mergeJSObjectValue,
	removeUndefinedInJSObjectValueWithUndefined,
	verifyJSObject,
	verifyJSObjectValue,
} from 'matriangle-common/JSObjectify'
import {
	Ref,
	clearObjectKeys,
	mergeObject,
	uniqueIntersectArray,
} from 'matriangle-common/utils'

/**
 * 一个守护对象
 * * 维护一个JS对象值，并以此和外部的JS对象进行diff、merge等操作
 */
export class JSObjectValueDaemon {
	/**
	 * 构造函数
	 * @param base 要维护的JS对象值（作为引用进行存储，所以可能需要在传入前进行拷贝）
	 */
	constructor(
		/**
		 * 要维护的JS对象值（引用）
		 */
		public readonly base: Ref<JSObjectValue>
	) {}

	/**
	 * 对比自身对象值和外部对象值
	 */
	public diffWith(compare: JSObjectValue): JSObjectValueWithUndefined {
		return diffJSObjectValue(this.base, compare)
	}

	/**
	 * 将外部的「差异」对象进行合并
	 */
	public mergeWith(diff: JSObjectValueWithUndefined): JSObjectValue {
		return mergeJSObjectValue(this.base, diff)
	}

	public toString(): string {
		return `JSObjectValue(${String(this.base)})`
	}
}

// * 测试环节

function test_isJSObj(info: boolean = true): void {
	// * 工具定义
	const as = console.assert
	const ass = (
		value: unknown,
		expected: {
			i_JSObject: boolean
			i_JSObjectKey: boolean
			i_JSObjectValue: boolean
		}
	) => {
		if (isJSObjectValue(value))
			// * 断言：复制后的JS对象值仍相等
			as(isJSObjectValueEqual_deep(value, copyJSObjectValue_deep(value)))
		// 三个「对象-键-值」断言
		as(
			isJSObject(value) === expected.i_JSObject,
			'isJSObject(',
			value,
			`) !== ${expected.i_JSObject}`
		)
		as(
			isJSObjectKey(value) === expected.i_JSObjectKey,
			'isJSObjectKey(',
			value,
			`) !== ${expected.i_JSObjectKey}`
		)
		as(
			isJSObjectValue(value, info) === expected.i_JSObjectValue,
			'isJSObjectValue(',
			value,
			`) !== ${expected.i_JSObjectValue}`
		)
	}
	const asss = (
		value_expected: {
			value: unknown
			expected: {
				i_JSObject: boolean
				i_JSObjectKey: boolean
				i_JSObjectValue: boolean
			}
		}[]
	) => {
		value_expected.forEach(({ value, expected }) => ass(value, expected))
	}
	/** 「三不是」元素 */
	const expected_FFF = {
		i_JSObject: false,
		i_JSObjectKey: false,
		i_JSObjectValue: false,
	}
	/** 仅JS对象 */
	const expected_JSObjectOnly = {
		i_JSObject: true,
		i_JSObjectKey: false,
		i_JSObjectValue: true,
	}
	/** 仅JS对象值 */
	const expected_JSObjectValueOnly = {
		i_JSObject: false,
		i_JSObjectKey: false,
		i_JSObjectValue: true,
	}
	// * 正式测试
	asss([
		// * 基本类型 * //
		// 数值
		{
			value: 1,
			expected: {
				i_JSObject: false,
				i_JSObjectKey: true, // ! 严格意义上说，都会转换成字符串
				i_JSObjectValue: true,
			},
		},
		// 字符串
		{
			value: 'string',
			expected: {
				i_JSObject: false,
				i_JSObjectKey: true,
				i_JSObjectValue: true,
			},
		},
		// null
		{
			value: null,
			expected: expected_JSObjectValueOnly,
		},
		// undefined
		{
			value: undefined,
			expected: expected_FFF,
		},
		// 布尔
		{
			value: true,
			expected: expected_JSObjectValueOnly,
		},
		// * 复合类型 * //
		// 空数组
		{
			value: [],
			expected: expected_JSObjectValueOnly,
		},
		// 空对象
		{
			value: {},
			expected: expected_JSObjectOnly,
		},
		// 数组对象
		{
			value: {
				a: [1, 2, 3],
				b: [-1, 2, null],
				c: [null, null, null],
			},
			expected: expected_JSObjectOnly,
		},
		// 对象数组
		{
			value: [
				{},
				{ a: 1 },
				{
					a: [1, 2, 3],
					b: [-1, 2, null],
					c: [null, null, null],
				},
			],
			expected: expected_JSObjectValueOnly,
		},
		// * 数组对象 改变一个都不行
		{
			value: {
				a: [1, 2, undefined],
				b: [-1, 2, null],
				c: [null, null, null],
			},
			expected: expected_FFF,
		},
		// * 对象数组 改变一个都不行
		{
			value: [
				{},
				{ a: 1 },
				{
					a: [1, 2, 3],
					b: [-1, 2, null],
					c: [null, null, undefined],
				},
			],
			expected: expected_FFF,
		},
		// 究级嵌套对象
		{
			value: {
				a: {
					b: {
						c: {
							d: {
								e: {
									f: {
										g: {
											h: {
												i: {
													j: {
														k: {
															l: {
																m: {
																	n: {
																		o: {
																			p: {
																				q: {
																					r: {
																						s: {
																							t: {
																								u: {
																									v: {
																										w: {
																											x: {
																												y: {
																													z: {},
																												},
																											},
																										},
																									},
																								},
																							},
																						},
																					},
																				},
																			},
																		},
																	},
																},
															},
														},
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
			expected: expected_JSObjectOnly,
		},
		// 究级嵌套数组
		{
			value: [
				[
					[
						[
							[
								[
									[
										[
											[
												[
													[
														[
															[
																[
																	[
																		[
																			[
																				[
																					[
																						[
																							[
																								[
																									[
																										[
																											[
																												[
																													[
																														[
																															[
																																[
																																	[
																																		[
																																			[
																																				[
																																					[
																																						[
																																							[
																																								[
																																									[
																																										[
																																											[
																																												[
																																													[
																																														[
																																															[
																																																[
																																																	[
																																																		[
																																																			[
																																																				[
																																																					[
																																																						[
																																																							[
																																																								[
																																																									[
																																																										[
																																																											[
																																																												[
																																																													[
																																																														[
																																																															[
																																																																[
																																																																	[
																																																																		[],
																																																																	],
																																																																],
																																																															],
																																																														],
																																																													],
																																																												],
																																																											],
																																																										],
																																																									],
																																																								],
																																																							],
																																																						],
																																																					],
																																																				],
																																																			],
																																																		],
																																																	],
																																																],
																																															],
																																														],
																																													],
																																												],
																																											],
																																										],
																																									],
																																								],
																																							],
																																						],
																																					],
																																				],
																																			],
																																		],
																																	],
																																],
																															],
																														],
																													],
																												],
																											],
																										],
																									],
																								],
																							],
																						],
																					],
																				],
																			],
																		],
																	],
																],
															],
														],
													],
												],
											],
										],
									],
								],
							],
						],
					],
				],
			],
			expected: expected_JSObjectValueOnly,
		},
		// * 究级嵌套对象 改变一个都不行
		{
			value: {
				a: {
					b: {
						c: {
							d: {
								e: {
									f: {
										g: {
											h: {
												i: {
													j: {
														k: {
															l: {
																m: {
																	n: {
																		o: {
																			p: {
																				q: {
																					r: {
																						s: {
																							t: {
																								u: {
																									v: {
																										w: {
																											x: {
																												y: {
																													z: undefined,
																												},
																											},
																										},
																									},
																								},
																							},
																						},
																					},
																				},
																			},
																		},
																	},
																},
															},
														},
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
			expected: expected_FFF,
		},
		// * 究级嵌套数组 改变一个都不行
		{
			value: [
				[
					[
						[
							[
								[
									[
										[
											[
												[
													[
														[
															[
																[
																	[
																		[
																			[
																				[
																					[
																						[
																							[
																								[
																									[
																										[
																											[
																												[
																													[
																														[
																															[
																																[
																																	[
																																		[
																																			[
																																				[
																																					[
																																						[
																																							[
																																								[
																																									[
																																										[
																																											[
																																												[
																																													[
																																														[
																																															[
																																																[
																																																	[
																																																		[
																																																			[
																																																				[
																																																					[
																																																						[
																																																							[
																																																								[
																																																									[
																																																										[
																																																											[
																																																												[
																																																													[
																																																														[
																																																															[
																																																																[
																																																																	[
																																																																		[
																																																																			undefined,
																																																																		],
																																																																	],
																																																																],
																																																															],
																																																														],
																																																													],
																																																												],
																																																											],
																																																										],
																																																									],
																																																								],
																																																							],
																																																						],
																																																					],
																																																				],
																																																			],
																																																		],
																																																	],
																																																],
																																															],
																																														],
																																													],
																																												],
																																											],
																																										],
																																									],
																																								],
																																							],
																																						],
																																					],
																																				],
																																			],
																																		],
																																	],
																																],
																															],
																														],
																													],
																												],
																											],
																										],
																									],
																								],
																							],
																						],
																					],
																				],
																			],
																		],
																	],
																],
															],
														],
													],
												],
											],
										],
									],
								],
							],
						],
					],
				],
			],
			expected: expected_FFF,
		},
		// * 其它类型 * //
		// Date
		{
			value: new Date(),
			expected: expected_FFF,
		},
		// 函数
		{
			value: () => {},
			expected: expected_FFF,
		},
		// 正则表达式
		{
			value: /a/,
			expected: expected_FFF,
		},
		// 错误
		{
			value: new Error(),
			expected: expected_FFF,
		},
		// 代理：空对象 // ! 代理的空对象还是JS对象
		{
			value: new Proxy({}, {}),
			expected: {
				i_JSObject: true,
				i_JSObjectKey: false,
				i_JSObjectValue: true,
			},
		},
		// 代理：JS对象 // ! 代理的JS对象还是JS对象
		{
			value: new Proxy({ a: 1, b: [], c: {} }, {}),
			expected: {
				i_JSObject: true,
				i_JSObjectKey: false,
				i_JSObjectValue: true,
			},
		},
		// Promise
		{
			value: new Promise(() => {}),
			expected: expected_FFF,
		},
		// 空class：类 // ! 空类并非空对象，不是合法JS对象
		{
			value: class {},
			expected: expected_FFF,
		},
		// 空class：实例 // ! 空类的实例因原型对象改变，所以不是合法的JS对象
		{
			value: new (class {})(),
			expected: expected_FFF,
		},
		// 有属性的类：类 //! 类有属性，亦非JS对象
		{
			value: class {
				a = 1
			},
			expected: expected_FFF,
		},
		// 有属性的类：实例 //! 实例有属性，所以不是空对象
		{
			value: new (class {
				a = 1
			})(),
			expected: expected_FFF,
		},
		// 有方法的类：类 //! 类有方法，亦非JS对象
		{
			value: class {
				a() {}
			},
			expected: expected_FFF,
		},
		// 有方法的类：实例 //! 实例有方法，所以不是空对象
		{
			value: new (class {
				a() {}
			})(),
			expected: expected_FFF,
		},
	])
}

function test_JSObjectValueDaemon(): void {
	/** 原始值 */
	const origin = {
		a: [],
		b: 2,
		c: {
			d: 3,
			null: null,
			arr: [
				'string',
				{ a: 1 },
				{
					I_am_a_inner_value: true,
					another_inner_value: '这不会被修改的',
				},
			] as JSObjectValue[], // ! 不用`as`会形成并集
		},
		d: {
			float: 12.4,
			entity: {
				position: [137, -16, 388],
				direction: 3,
				customName: 'Victim',
				name: 'The Chosen One',
				deprecated: '我就是要被删除！',
			},
		},
		to_delete: 'to_delete!',
	}
	/** 用来比对的值 */
	const compare = copyJSObjectValue_deep(origin)
	const compareO: JSObjectValue = compare // ! 作为「JS对象值」进行设置
	/** 守护对象 */
	const daemon = new JSObjectValueDaemon(copyJSObjectValue_deep(compare))
	console.assert(
		verifyJSObject(daemon.base) && verifyJSObjectValue(daemon.base),
		daemon,
		verifyJSObject(daemon.base),
		verifyJSObjectValue(daemon.base)
	)
	// * 工具定义
	let numTest = 0
	let diff: JSObjectValueWithUndefined
	/** 测试diff， */
	function ass(expected: JSObjectValueWithUndefined) {
		numTest++
		// * 计算`diff`
		diff = daemon.diffWith(compare)
		// * 验证「diff后的数据符合预期」
		console.assert(
			// 比对相等
			isJSObjectValueEqual_deep(diff, expected),
			`diff${numTest} error!`,
			diff
		)
		/** 先复制好结果 */
		const result = copyJSObjectValueWithUndefined_deep(diff)
		// * 验证`diff`和`daemon.base`无共用引用
		let sharedRef: JSObjectValue | undefined
		console.assert(
			// 无「共用引用」⇒无共用「引用」
			(sharedRef = getSharedRef(
				daemon.base,
				removeUndefinedInJSObjectValueWithUndefined(diff)
			)) === undefined,
			'diff存在共用引用！sharedRef =',
			sharedRef
		)
		// ! 这时候diff已经被修改了
		return result
	}
	// * 开始测试 # diff
	// * diff 1 数组扩增
	compareO.a = [1, 2, 3]
	ass({
		a: [1, 2, 3],
	})
	// * diff 2 数组修改
	compareO.a[1] = 0
	ass({
		a: [1, 0, 3],
	})
	// * diff 3 数组变对象，对象变数组
	mergeObject(copyJSObjectValue_deep(origin), clearObjectKeys(compare)) // ! 恢复
	compareO.a = { name: '对象' }
	compareO.c = ['对象', '变', '数组']
	ass({
		a: { name: '对象' },
		c: ['对象', '变', '数组'],
	})
	// * diff 4 数组变数值，数值变数组
	mergeObject(copyJSObjectValue_deep(origin), clearObjectKeys(compare)) // ! 恢复
	compareO.a = null
	compareO.b = [2, '变', '数组', { undefined: null }]
	ass({
		a: null,
		b: [2, '变', '数组', { undefined: null }],
	})
	// * diff 5 对象变数值，数值变对象
	mergeObject(copyJSObjectValue_deep(origin), clearObjectKeys(compare)) // ! 恢复
	compareO.c = '为何这里没有对象了呢？'
	compareO.b = { message: '为何这里又有对象了呢？' }
	ass({
		b: { message: '为何这里又有对象了呢？' },
		c: '为何这里没有对象了呢？',
	})
	// * diff 6 内层数值修改
	mergeObject(copyJSObjectValue_deep(origin), clearObjectKeys(compare)) // ! 恢复
	compare.c.d = 2
	ass({
		c: {
			d: 2,
		},
	})
	// * diff 7 删除属性
	mergeObject(copyJSObjectValue_deep(origin), clearObjectKeys(compare)) // ! 恢复
	delete compareO.to_delete
	ass({
		to_delete: undefined,
	})
	// * diff 8 增加属性
	mergeObject(copyJSObjectValue_deep(origin), clearObjectKeys(compare)) // ! 恢复
	compareO.new_prop = "I'm a new property!"
	ass({
		new_prop: "I'm a new property!",
	})
	// * diff 9 增加、修改、删除 综合
	mergeObject(copyJSObjectValue_deep(origin), clearObjectKeys(compare)) // ! 恢复
	delete compareO.to_delete
	compareO.new_prop = "I'm a new property!"
	;(compare.c.arr[2]! as JSObject).I_am_a_inner_value = false
	compare.d.float++
	const o: JSObjectValue = compare.d.entity
	delete o.deprecated
	compare.d.entity.customName = 'dingdingdang'
	compare.d.entity.name = 'The Second Coming'
	diff = ass({
		to_delete: undefined, // ! 删除之后值变成`undefined`
		new_prop: "I'm a new property!",
		c: {
			arr: [
				'string',
				{ a: 1 },
				// ! ↑上面两个被一并修改了
				{
					// ! ↓修改了这里
					I_am_a_inner_value: false,
					// * 这里不会再有别的了
				},
			],
		},
		d: {
			float: 13.4,
			// * ↑自增の结果
			entity: {
				customName: 'dingdingdang',
				name: 'The Second Coming',
				deprecated: undefined, // ! 删除之后值变成`undefined`
			},
		},
	})
	// * 开始测试 # merge
	console.info('开始测试merge')
	daemon.mergeWith(diff)
	console.assert(
		isJSObjectValueEqual_deep(daemon.base, compare),
		'测试merge失败:',
		daemon.base,
		compare
	)
}

function test_hasSharedRef() {
	// * 工具定义
	const as = console.assert
	const ass = (
		base: JSObjectValue,
		compare: JSObjectValue,
		expected: boolean
	) => {
		let sharedRef: JSObjectValue | undefined
		as(
			((sharedRef = getSharedRef(base, compare)) !== undefined) ===
				expected,
			'比对失败：hasSharedRef(',
			base,
			',',
			compare,
			`) !== ${expected}`,
			'sharedRef =',
			sharedRef
		)
	}
	const asss = (
		args: {
			base: JSObjectValue
			compare: JSObjectValue
			expected: boolean
		}[]
	) => args.forEach(arg => ass(arg.base, arg.compare, arg.expected))
	// * 正式测试
	const sharedArr: JSObjectValue = [],
		sharedObj: JSObjectValue = {}
	asss([
		// * 基础类型
		{
			base: 1,
			compare: 1,
			expected: false,
		},
		{
			base: 1,
			compare: 2,
			expected: false,
		},
		{
			base: 'string',
			compare: 'string',
			expected: false,
		},
		{
			base: null,
			compare: null,
			expected: false,
		},
		// * 简单引用测试
		{
			base: sharedArr,
			compare: sharedArr,
			expected: true,
		},
		{
			base: sharedArr,
			compare: [],
			expected: false,
		},
		{
			base: sharedObj,
			compare: sharedObj,
			expected: true,
		},
		{
			base: sharedObj,
			compare: {},
			expected: false,
		},
		// * 复合对象
		{
			base: [1, 2, 3, sharedArr],
			compare: [1, 2, 3, sharedObj],
			expected: false,
		},
		{
			base: { a: 1, b: 2, c: 3, sharedArr },
			compare: { a: 1, b: 2, c: 3, sharedObj },
			expected: false,
		},
		{
			base: [1, 2, 3, { sharedArr, sharedObj }],
			compare: [1, 2, 3, { sharedArr, sharedObj }],
			expected: true,
		},
		{
			base: { a: 1, b: 2, c: 3, d: [sharedArr, sharedObj] },
			compare: { a: 1, b: 2, c: 3, d: [sharedArr, sharedObj] },
			expected: true,
		},
		// * 嵌套对象
		{
			base: {
				a: sharedArr,
				b: sharedObj,
			},
			compare: {
				a: [],
				b: {},
			},
			expected: false,
		},
		{
			base: {
				a: [],
				b: sharedObj,
			},
			compare: {
				a: sharedArr,
				b: {},
			},
			expected: false,
		},
		{
			base: {
				a: [],
				b: sharedObj,
			},
			compare: {
				a: sharedArr,
				b: sharedObj,
			},
			expected: true,
		},
		{
			base: {
				a: sharedArr,
				b: sharedObj,
			},
			compare: {
				a: sharedArr,
				b: {},
			},
			expected: true,
		},
	])
}

function test_uniqueMergeArray() {
	let temp: unknown
	// 1
	console.assert(
		isJSObjectValueEqual_deep(
			(temp = uniqueIntersectArray(['1', '2', '3'], ['1', '2', '4'])),
			[['1', '2'], ['3'], ['4']]
		),
		'uniqueMergeArray error!',
		temp
	)
	// 2
	console.assert(
		isJSObjectValueEqual_deep(
			(temp = uniqueIntersectArray(['0', '2', '3'], ['1', '2', '4'])),
			[['2'], ['0', '3'], ['1', '4']]
		),
		'uniqueMergeArray error!',
		temp
	)
}

test_isJSObj(false)
test_hasSharedRef()
test_uniqueMergeArray()
console.log('====开始测试JS对象守护====')
test_JSObjectValueDaemon()
console.log('====JS对象守护 测试完成====')
