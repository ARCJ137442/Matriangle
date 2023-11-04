/**
 * 专用：小车碰撞实验
 * * 用于特定的「小车碰撞实验」
 * * 📍一般不会频繁更改
 */
import { NARSEnv } from './server'
import configConstructor from './config/Experiment-car-collision.config.template'
import nodeServicesModifier from './config/node-services.modifier'

/** 创建环境 */
const env: NARSEnv = new NARSEnv(nodeServicesModifier(configConstructor()))

// 启动
void env.launch()
