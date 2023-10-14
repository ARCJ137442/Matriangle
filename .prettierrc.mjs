// prettier.config.js, .prettierrc.js, prettier.config.mjs, or .prettierrc.mjs
// 官网参考：<https://prettier.io/docs/en/configuration>
// 配置参考教程：<https://blog.csdn.net/qq_43886365/article/details/130409080>

/** @type {import("prettier").Config} */
const config = {
	// ! 缩进、换行、行尾/文件尾、字符编码、引号风格请参见{@link .editorconfig}

	// 尾后逗号
	trailingComma: 'es5',

	// 自动插入分号 ASI
	semi: false,

	// 一行最大长度
	printWidth: 80,

	// { 对象字面量: 空格 }
	bracketSpacing: true,

	// 💭避免使用箭头函数的括号
	arrowParens: 'avoid',
}

export default config
