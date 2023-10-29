<!--
	* 拥有空的模板
	* 承载各种消息注册服务
 -->
<template></template>

<script setup lang="ts">
import MessageRouter from 'matriangle-mod-message-io-api/MessageRouter'
import { IMessageService } from 'matriangle-mod-message-io-api/MessageInterfaces'
import { splitAddress } from '../lib/common'
import { voidF } from 'matriangle-common'

/** 路由器对象 */
const router = new MessageRouter()

/**
 * 服务附加信息
 * * 用于附加给服务，统一管理有关「心跳循环」等内容
 * * 核心逻辑类似多继承和组合（mixin）
 */
type ServiceFurtherInf = {
	/** 心跳循环ID */
	intervalID: any
	/** 心跳循环时长 */
	intervalPeriod: number | undefined
	/** 开启回调 */
	openCallback: voidF | undefined
	/** 关闭回调 */
	stopCallback: voidF | undefined
	/** 上一次活跃状态（用于边缘检测） */
	lastActive: boolean
}
/**
 * 以服务为中心，存储服务的「附加信息」
 * * 键：服务
 * * 值：附加信息
 */
const serviceFurtherInf: Map<IMessageService, ServiceFurtherInf> = new Map()

/**
 * 心跳循环的回调函数
 * * 前提假设：服务已经启动
 * * 核心逻辑
 *   * 服务保持活跃⇒无动作
 *   * 服务从不活跃变得活跃⇒回调「已开启」
 *   * 服务从活跃变得不活跃⇒重启（+回调「已关闭」）
 *     * 原因一般是网络异常或者服务未启动
 */
function keepAlive(service: IMessageService): void {
	// 获取「附加信息」
	let furtherInf: ServiceFurtherInf = serviceFurtherInf.get(service)!
	// 当前正在活跃
	if (service.isActive)
		if (furtherInf.lastActive)
			// 一直活跃⇒无动作
			return
		// 否则⇒回调「开启」事件
		else {
			furtherInf.lastActive = true
			furtherInf.openCallback?.()
		}
	// 关闭状态
	else {
		// 边缘检测⇒关闭事件
		if (furtherInf.lastActive) {
			// 同步状态
			furtherInf.lastActive = false
			furtherInf.stopCallback?.()
		}
		// 尝试重启服务
		console.log(
			' 服务「' + service.address + '」未活跃! 正在尝试重启服务。。。'
		)
		service.stop()
		service.launch()
	}
}

/**
 * 随着服务注册，初始化「附加信息」
 * * 就好像这些属性真的是和服务一起的一样
 * * 实现断言：服务已注册⇒服务一定有「附加信息」
 *
 * @returns {IMessageService} 服务自身，用于嵌套操作
 */
function initFurtherInf(service: IMessageService): IMessageService {
	serviceFurtherInf.set(service, {
		intervalID: undefined,
		intervalPeriod: undefined,
		openCallback: undefined,
		stopCallback: undefined,
		lastActive: service.isActive,
	})
	return service
}

/**
 * 配置一个服务的「心跳循环」
 */
function setupHeartbeatLoop(
	service: IMessageService,
	heartbeatTimeMS: number,
	openCallback?: voidF,
	stopCallback?: voidF
): void {
	// 获取「附加信息」（有注册必有附加信息）
	let furtherInf: ServiceFurtherInf = serviceFurtherInf.get(service)!

	// 有旧循环⇒重置旧循环，预备开启新循环
	if (furtherInf.intervalID !== undefined) {
		// 清除旧的「心跳循环」，不论周期是否相同
		clearInterval(furtherInf.intervalID)
		furtherInf.intervalID = undefined
		furtherInf.intervalPeriod = undefined
	}

	// 启动新的「心跳循环」 //
	// 设置「开启回调」「关闭回调」
	furtherInf.openCallback = openCallback
	furtherInf.stopCallback = stopCallback
	// 以新周期设置「心跳循环」
	furtherInf.intervalID = setInterval((): void => {
		console.log('心跳：', service.address)
		// 运作逻辑：专用的「保持活跃」方法 // !【2023-10-29 23:17:51】不再滥用「软打开」
		keepAlive(service)
	}, heartbeatTimeMS)
	// 将周期记录在册
	furtherInf.intervalPeriod = heartbeatTimeMS
}

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
	 *
	 * @returns {IMessageService} 已有的服务 / 新服务
	 */
	softOpenService: (
		address: string,
		serviceConstructor: () => IMessageService
	): IMessageService => {
		// 有服务
		const [host, port] = splitAddress(address)
		if (router.hasServiceAt(host, port)) {
			// 活跃⇒返回，非活跃⇒重启
			let service: IMessageService = router.getServiceAt(host, port)!
			if (service.isActive) return service
			service!.stop()
			// 在回调中重启，会导致「频繁关闭/重启」（可能因为「关闭的回调延时超过了心跳的时长」）
			service!.launch()
			return service
		}
		// 没服务⇒注册服务
		else if (router.registerService(serviceConstructor())) {
			// 注册「附加信息」，返回（一定有的）服务
			return initFurtherInf(router.getServiceAt(host, port)!)
		}
		// 理论上不可能发生：没有服务都已经注册了
		else
			throw new Error(
				'softOpenService: 没有已有服务，但新服务注册失败' +
					`${host}:${port}`
			)
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
		openCallback?: voidF,
		stopCallback?: voidF
	): void {
		// 对应地址有服务
		if (router.hasServiceAt(...splitAddress(address))) {
			// 初始化「心跳循环」
			setupHeartbeatLoop(
				router.getServiceAt(...splitAddress(address))!,
				heartbeatTimeMS,
				openCallback,
				stopCallback
			)
		}
		// 对应地址无服务⇒启动服务
		else {
			// 创建服务之后，重新启动心跳循环
			console.log('对应地址无服务⇒启动服务', address)
			self.softOpenService(address, serviceConstructor)
			// 这时候一定有服务
			if (router.hasServiceAt(...splitAddress(address)))
				this.openKeepConnectService(
					address,
					heartbeatTimeMS,
					serviceConstructor,
					openCallback,
					stopCallback
				)
			else
				throw new Error(
					'openKeepConnectService: 服务启动失败' + address
				)
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
			/* console.warn(
				'softSend: 服务「' + address + '」不再活跃!',
				serviceFurtherInf.get(
					router.getServiceAt(...splitAddress(address))!
				)!.stopCallback
			) */
			// 回调
			serviceFurtherInf
				.get(router.getServiceAt(...splitAddress(address))!)!
				.stopCallback?.()
		}
		// 没服务⇒报错
		// else console.error('softSend: 服务「' + address + '」不存在!')
		return false
	},
	/**
	 * 处理「连接地址变更」事件
	 * * 目的：允许「被打开的服务」重新指定地址
	 * * 可能有服务在变更后重启
	 */
	handleAddressChange(oldAddress: string, newAddress: string): void {
		console.log(`地址变更：${oldAddress} => ${newAddress}`)
		// 通知路由器
		if (
			router.changeServiceAt(
				...splitAddress(oldAddress),
				...splitAddress(newAddress)
			)
		) {
			console.info(`地址成功变更：${oldAddress} => ${newAddress}`)
			// !【2023-10-29 22:29:18】现在和服务绑定，不再需要迁移「心跳循环」的回调函数
			console.log
		}
	},
}
defineExpose(self)
</script>
