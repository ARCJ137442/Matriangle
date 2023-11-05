<!--
	* 原MessageRouter的套壳
	* 连接各种消息注册服务
	* 作为「直连服务器」与母体进行连接
	   	* 母体启动代码直接复制自`launch.ts`
 -->
<template></template>

<script setup lang="ts">
import MessageRouterAdvanced, {
	vueExposeConstructor,
} from 'matriangle-mod-message-io-api/MessageRouterAdvanced'
import {
	envModifiers_default,
	envConstructor,
} from 'matriangle-instance-nars-experiment/launch$base'
import directServicesModifier from 'matriangle-instance-nars-experiment/config/direct-services.modifier'
import { NARSEnv } from '../../../NARS-experiment/NARSEnv'
import { NARSEnvConfig } from '../../../NARS-experiment/config/API'

// 客户端路由 //
/** 路由器对象 */
const routerClient = new MessageRouterAdvanced()

// 直连服务器 //

/** 创建环境 */
const env: NARSEnv = envConstructor(
	// 构造器的额外配置
	{
		// 二维地图
		map_sizes: [7, 5],
	},
	// 承继默认修饰器
	...envModifiers_default,
	// 使用直连服务
	(config: NARSEnvConfig): NARSEnvConfig =>
		directServicesModifier(config, routerClient)
)

/** 通过引入可重用的「自我构造函数」，复用代码 */
const self = vueExposeConstructor(routerClient)
defineExpose({
	...self,
	routerClient,
	// 上载母体端路由器，留给App链接
	routerMatrix: env.router,
	// 上载自身环境，留给App启动
	env,
})
</script>
