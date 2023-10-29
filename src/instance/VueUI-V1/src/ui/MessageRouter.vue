<!--
	* 拥有空的模板
	* 承载各种消息注册服务
 -->
<template></template>

<script setup lang="ts">
import MessageRouter from 'matriangle-mod-message-io-api/MessageRouter'
import { splitAddress } from '../lib/common'
import { IMessageService } from '../../../../mods/message-io-api/MessageInterfaces'
import { voidF } from '../../../../common'

/** 路由器对象 */
const router = new MessageRouter()
/** 用于「尝试保持连接」的「间隔ID字典」 */
const keepAliveIntervalIds = new Map<string, any>() // ! 这里值的类型不清楚
/** 用于「尝试保持连接」的「间隔时长字典」 */
const keepAliveIntervalPeriods = new Map<string, number>()
/**
 * 用于模拟「服务关闭事件」、「在服务『不再活跃』时回调」的「关闭回调字典」
 * * 键：服务地址
 * * 值：回调函数
 */
const serviceStopCallbacks = new Map<string, voidF | undefined>()

const self = {
	/**
	 * 给路由器传递消息
	 */
	send: (address: string, message: string): boolean =>
		router.sendMessageTo(...splitAddress(address), message),
	/**
	 * 检查服务是否存在
	 */
	hasService: (address: string): boolean =>
		router.hasServiceAt(...splitAddress(address)),
	/**
	 * 检查服务是否活跃
	 * * 具体条件：已存在 & 活跃
	 */
	isServiceActive: (address: string): boolean =>
		router.hasServiceAt(...splitAddress(address)) &&
		(router.getServiceAt(...splitAddress(address)) as IMessageService)
			?.isActive,
	/**
	 * 软开启服务
	 * * 没服务⇒使用「新服务构造函数」
	 * * 有服务⇒重启旧服务
	 */
	softOpenService: (
		address: string,
		serviceConstructor: () => IMessageService,
		openedCallback?: () => void
	): void => {
		// 有服务
		const [host, port] = splitAddress(address)
		if (router.hasServiceAt(host, port)) {
			// 活跃⇒返回，非活跃⇒重启
			if ((router.getServiceAt(host, port) as IMessageService).isActive)
				return
			;(router.getServiceAt(host, port) as IMessageService).stop()
			// 在回调中重启，会导致「频繁关闭/重启」（可能因为「关闭的回调延时超过了心跳的时长」）
			;(router.getServiceAt(host, port) as IMessageService).launch(
				openedCallback
			)
		}
		// 没服务
		else router.registerService(serviceConstructor(), openedCallback)
	},
	/**
	 * 开启一个「保持连接」服务
	 * * 目的：自动管理「心跳状态」，使用`setInterval`轮询尝试打开连接
	 * * 逻辑：
	 *   * 没有「心跳循环」⇒创建「心跳循环」，不断启动软更新
	 *   * 有「心跳循环」⇒检查心跳周期
	 *     * 一致⇒不动
	 *     * 不一致⇒以新周期重置「心跳循环」
	 */
	openKeepConnectService(
		address: string,
		heartbeatTimeMS: number,
		serviceConstructor: () => IMessageService,
		openedCallback?: voidF,
		stopCallback?: voidF
	): void {
		// 有「心跳循环」⇒检查心跳周期，关闭
		if (keepAliveIntervalPeriods.has(address))
			if (keepAliveIntervalPeriods.get(address) !== heartbeatTimeMS) {
				// 清除旧的「心跳循环」
				clearInterval(keepAliveIntervalIds.get(address))
				// 删除「心跳周期」
				keepAliveIntervalPeriods.delete(address)
			}

		// 无「心跳循环」⇒启动（注册）新的「心跳循环」
		if (!keepAliveIntervalIds.has(address)) {
			// 设置「关闭回调」
			serviceStopCallbacks.set(address, stopCallback)
			// 以新周期设置「心跳循环」
			keepAliveIntervalIds.set(
				address,
				setInterval(
					(): void =>
						// 运作逻辑：不断「软打开服务」
						this.softOpenService(
							address,
							serviceConstructor,
							openedCallback
						),
					heartbeatTimeMS
				)
			)
			// 将周期记录在册
			keepAliveIntervalPeriods.set(address, heartbeatTimeMS)
		}
	},
	/**
	 * 向「被软打开的服务」发送消息，同时检测「是否发生终止」
	 * * 「原先打开的服务」不再活跃⇒回调「关闭事件」
	 * * 防止连接断开后「一直缓存」导致「连接重启后发送大量消息」的事故
	 *
	 * ? 或许后续需要决定「是否交给路由器缓存」
	 */
	softSend(address: string, message: string): boolean {
		// 若服务活跃
		if (self.isServiceActive(address)) return self.send(address, message)
		// 若有服务但不活跃⇒回调「关闭」事件
		else if (self.hasService(address)) {
			console.warn(' 服务「' + address + '」不再活跃!')
			serviceStopCallbacks.get(address)?.()
		}
		// 没服务⇒报错
		else console.error(' 服务「' + address + '」不存在!')
		return false
	},
	/**
	 * 处理「连接地址变更」事件
	 * * 目的：允许「被打开的服务」重新指定地址
	 * * 可能有服务在变更后重启
	 */
	handleAddressChange(oldAddress: string, newAddress: string): void {
		// TODO: 具体逻辑，以及路由器支持
		console.log(`地址变更：${oldAddress} => ${newAddress}`)
	},
}
defineExpose(self)
</script>
