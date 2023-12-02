/**
 * 主文件（浏览器版本）
 * * 🔬可能经常被修改，以用于实验
 * * 不会自主启动，需要从Vue组件中调用启动
 */
import { NARSEnvConfig } from './config/API'
import { envConstructor as envConstructorBase } from './launch$base'
import { NARSEnv } from './NARSEnv'

/** 创建环境的函数 */
export function envConstructor(
	...modifiers: ((env: NARSEnvConfig) => NARSEnvConfig)[]
): NARSEnv {
	// TODO: 【2023-12-02 22:57:04】目前还存在「NARS环境初始化失败」的问题，如下↓
	/**
	 *Uncaught runtime errors:
ERROR
Cannot read properties of undefined (reading 'timing')
TypeError: Cannot read properties of undefined (reading 'timing')
	at <instance_members_initializer> (webpack-internal:///../NARS-experiment/NARSPlayerAgent.ts:447:35)
	at new NARSPlayerAgent (webpack-internal:///../NARS-experiment/NARSPlayerAgent.ts:237:14)
	at NARSEnv.setupNARSPlayer (webpack-internal:///../NARS-experiment/NARSEnv.ts:140:22)
	at NARSEnv.setupPlayers (webpack-internal:///../NARS-experiment/NARSEnv.ts:111:40)
	at NARSEnv.setupEntities (webpack-internal:///../NARS-experiment/NARSEnv.ts:206:10)
	at NARSEnv.launch (webpack-internal:///../NARS-experiment/NARSEnv.ts:310:10)
	at Proxy.launchEnv (webpack-internal:///../../../node_modules/babel-loader/lib/index.js??clonedRuleSet-1.use!../../../node_modules/vue-loader/dist/index.js??ruleSet[1].rules[5].use[0]!./src/ui/App-browser-NARS.vue?vue&type=script&setup=true&lang=ts:88:25)
	at onVnodeMounted._cache.<computed>._cache.<computed> (webpack-internal:///../../../node_modules/babel-loader/lib/index.js??clonedRuleSet-1.use!../../../node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[2]!../../../node_modules/vue-loader/dist/index.js??ruleSet[1].rules[5].use[0]!./src/ui/App-browser-NARS.vue?vue&type=template&id=4493d6d7&ts=true:14:64)
	at callWithErrorHandling (webpack-internal:///../../../node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js:296:18)
	at callWithAsyncErrorHandling (webpack-internal:///../../../node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js:304:17)
	 */
	return envConstructorBase(...modifiers)
	// ! modifiers中已经包含默认修饰器
	// // 新增玩家
	// experimentCarCollision2pModifier,
	// // 支持多玩家图表 + 色调偏移
	// multiPlayerPlotModifierHueShift,
	// 在直连修改器下环境下运行
}
