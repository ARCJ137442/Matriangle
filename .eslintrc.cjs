/* eslint-env node */

/**
 * ! 【2023-10-13 19:54:54】不建议使用ESM
 * * 原本可用类JSON表示的数据，需要转写成大量const
 * * `extends`是ES6的关键字
 */
module.exports = {
	// 前置插件
	extends: [
		// <https://github.com/bfanger/eslint-plugin-only-warn>似乎不起效
	],
	// 确保是根目录
	root: true,
	// 全局忽略特定文件
	ignorePatterns: [
		// 不再（拟）弃用的代码上浪费精力
		"*.deprecated*", // 文件
		"*.deprecated/", // 文件夹
		// 忽略测试代码
		"*.test.*",
		"*.test/",
		// 忽略待开发/WIP代码
		"*.WIP.*",
		"*.WIP/",
		// 忽略JS
		"*.js",
	],
	// 覆盖属性
	overrides: [
		// 用于src目录下的TS文件
		{
			extends: [
				// ESLint基础配置
				'eslint:recommended',
				// 仅才此类情况下进行「TypeScript的支持」「推荐类型检查」
				'plugin:@typescript-eslint/recommended',
				'plugin:@typescript-eslint/recommended-type-checked',
				// 'plugin:@typescript-eslint/disable-type-checked'
			],
			// 仅检查源码目录`src`下的TS文件
			files: [
				"src/**/*.ts",
			],
			// 只对`.ts`文件使用TS解析器
			parser: '@typescript-eslint/parser',
			// !【2023-10-13 21:00:14】↓禁用，似乎启用后没法避免在「src目录外的文件」中报错
			parserOptions: {
				project: true,
				tsconfigRootDir: __dirname,
				filepath: "src"
			},
			// 附加插件
			plugins: [
				// TS中的ESLint
				'@typescript-eslint',
				// 来自npm插件`eslint-plugin-only-warn` <https://github.com/bfanger/eslint-plugin-only-warn>
				// "only-warn", // !【2023-10-13 23:51:08】现已移除，因为所有ESLint的代码问题已解决
				// Prettier
				"prettier",
			],

			// 具体规则
			rules: {
				semi: "off", // 不强求分号
				"no-extra-semi": "warn", // 不需要额外的分号；ASI自动分号插入
				"prefer-const": "warn", // 建议只赋值一次的使用`const`

				// TypeScript //

				"@typescript-eslint/no-unused-vars": [
					"warn",
					{
						// !【2023-10-13 21:07:57】不检查函数参数：项目代码中还包含很多「空函数声明」，但参数名又没法像Julia那样省略成「(:int,:uint,...)」
						"args": "none"
					}
				],

				/*
				* 【2023-10-13 21:17:39】目前仅在一些特定场合中用到`any`：
				  * 强制访问私有属性`(x as any).xxx`
				  * 兼容任意长任意类参数`...args:any[]`
				*/
				"@typescript-eslint/no-explicit-any": [
					'error',
					{
						fixToUnknown: false,
						ignoreRestArgs: true,
					}
				],

				// !【2023-10-13 21:19:21】目前需要导出一个`module`来避免「命名空间冲突」，如「不同mod下的`MAP_1`」
				"@typescript-eslint/no-namespace": "off",

				// !【2023-10-13 21:54:19】忽略：目前需要特化原先AS3中的整数类型「int」「uint」
				"@typescript-eslint/no-redundant-type-constituents": "off",

				// !【2023-10-13 22:33:28】忽略：经常需要使用enum进行「扩展已有事件类型（通用性），但又限制枚举种类（严格性）」的操作
				"@typescript-eslint/no-unsafe-enum-comparison": "off",

				// !【2023-10-13 22:45:54】特别忽略`Function`：需要在表示一个「类」时使用，如AS3中的`Class`类型
				"@typescript-eslint/ban-types": [
					"warn",
					{
						extendDefaults: true,
						types: {
							Function: false,
						}
					}
				],

				// Prettier //
				"prettier/prettier": "off", // 暂不启用
			},
		},
	],
};
