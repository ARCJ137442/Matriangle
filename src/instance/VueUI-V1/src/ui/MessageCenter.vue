<!--
	* 拥有空的模板
	* 承载各种消息注册服务
 -->
<template></template>

<script setup lang="ts">
import MessageRouterAdvanced, {
	vueExposeConstructor,
} from 'matriangle-mod-message-io-api/MessageRouterAdvanced'

/** 路由器对象 */
const router = new MessageRouterAdvanced()

/** 通过引入可重用的「自我构造函数」，复用代码 */
const self = vueExposeConstructor(router)
defineExpose({
	...self,
	routerClient: router,
})
</script>
