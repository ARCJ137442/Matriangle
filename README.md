# Matriangle

## Overview 概述

Matriangle（中译名未定）是一个

* 承继于其前身[BattleTriangle-Gamma](https://github.com/ARCJ137442/BattleTriangle-Gamma)的
* 基于**TypeScript/Node**的
* 基于类Minecraft「地图+实体」机制的
* 其「地图」原生支持任意维度的
* 用于为AI提供「网格化」「实体化」的「虚拟环境」的

模拟程序库。

其名由「Matrix」（取自《The Matrix》，象征「模拟」）「Triangle」（取自前身[BattleTriangle-Gamma](https://github.com/ARCJ137442/BattleTriangle-Gamma)，作为其TypeScript延续）组成。

## Quick Start 快速开始

### 安装

作为一个npm包，Matriangle可以通过`git clone`被下载，并通过npm进行部署：

```bash
git clone https://github.com/ARCJ137442/Matriangle.git
npm install
```

（确保命令的执行位置为matriangle根目录）

### 运行

在安装后，可直接通过npm运行：

#### 显示「可执行命令」的列表（无描述）

```bash
npm run
```

只会显示可执行的脚本（script）列表

* 附带每个脚本对应的cmd指令
* 除此之外没有其它副作用

#### 实例「Battle Triangle TS」

以下的启动脚本记录在实例「BaTS-Server」中，最好预先使用如下命令跳转至相应目录：

```bash
cd src/instance/BaTS-Server
```

（若预先跳转了目录，下面指令中的`cd`行便可省略）

⚠️注意：实例代码后续可能**独立**成单独的npm包

#### 启动游戏「Battle Triangle TS」

```bash
cd src/instance/BaTS-Server
npm run batr
```

启动Node服务端，一并启动Vue客户端

#### 启动游戏「Battle Triangle TS」服务端

```bash
cd src/instance/BaTS-Server
npm run serve
```

单独启动BaTS的Node服务端

#### NARS实验相关

以下的启动脚本记录在实例「NARS-Experiment」中，最好预先使用如下命令跳转至相应目录：

```bash
cd src/instance/NARS-experiment
```

（若预先跳转了目录，下面指令中的`cd`行便可省略）

⚠️注意：实例代码后续可能**独立**成单独的npm包

##### 启动「NARS小车碰撞实验」

```bash
cd src/instance/NARS-experiment
npm run car
```

启动Node服务端，一并启动Vue客户端

##### 启动「NARS小车碰撞实验」服务端

```bash
cd src/instance/NARS-experiment
npm run server-car
```

##### 启动「NARS能量包收集实验」

```bash
cd src/instance/NARS-experiment
npm run powerup
```

启动Node服务端，一并启动Vue客户端

##### 启动「NARS能量包收集实验」服务端

```bash
cd src/instance/NARS-experiment
npm run server-powerup
```

#### 启动「NARS实验通用」客户端

```bash
cd src/instance/NARS-experiment
npm run client
```

#### VueUI相关

目前项目客户端使用Vue+Webpack编写，并记录在实例「VueUI-V1」中，最好预先使用如下命令跳转至相应目录：

```bash
cd src/instance/VueUI-V1
```

（若预先跳转了目录，下面指令中的`cd`行便可省略）

⚠️注意：实例代码后续可能**独立**成单独的npm包

##### 构建「基于Node服务端」的客户端

```bash
cd src/instance/VueUI-V1
npm run build-n
```

构建「与Node服务端进行连接」并且「使用Websocket进行通信」的客户端（不把服务端集成进客户端中）

##### 构建「纯浏览器」的客户端（集成NARS测试环境）

```bash
cd src/instance/VueUI-V1
npm run build-bn
```

构建「不依赖Node，逻辑显示一同在浏览器端运作」且「上载了NARS测试环境」的一体式客户端

##### 调试「基于Node服务端」的客户端

```bash
cd src/instance/VueUI-V1
npm run dev-n
```

调试「与Node服务端进行连接」并且「使用Websocket进行通信」的客户端（不把服务端集成进客户端中）

##### 调试「纯浏览器」的客户端（集成NARS测试环境）

```bash
cd src/instance/VueUI-V1
npm run dev-bn
```

调试「不依赖Node，逻辑显示一同在浏览器端运作」且「上载了NARS测试环境」的一体式客户端

## Features 功能

### 模块：API | `matriangle-api`

* 许可证： ***LGPL 3.0***
* 基于TypeScript的API，包含众多 `interface` 以及部分（实用）标准实现
* 构建了Matriangle的基本框架和程序架构
  * 整个模拟世界运行在一个「Matrix」（母体）中
  * 这个「母体」由「地图」「实体」组成
    * 地图由「方块」组成
      * 可以是**任意**维度
        * 其「高维方向」的存储由一个叫「任意维整数角」的机制实现
    * 实体在「母体」中作为「智能体行动」的基础单位
      * 由母体自身进行维护
      * 具有高度可自定义的行为，如：
        * 活跃：会被「母体」在每一个「世界刻」中调用功能
        * 有坐标⇒格点/非格点：确定实体的「位置」概念
        * 有方向：确认实体的「方向」概念
        * ……
      * 子集「程序」：其中「高度不变」「常用于为母体添加功能」的一类「实体」
        * 例如：
          * 玩家控制器
          * 方块随机刻分派者
          * 地图切换者
          * ……
        * 这些「程序」可用于实现一些「本来需要修改母体自身源码」的机制，如：
          * 「随机刻」机制（现迁移至模组**BaTS**）

### 模块：通用 | `matriangle-common`

* 许可证： *MIT*
* 直接承继于其前身的[common文件夹](https://github.com/ARCJ137442/BattleTriangle-Gamma/tree/master/batr/common)，在此基础上进行了TS化和功能迁移

### 模块：遗留 | `matriangle-legacy`

* 许可证： *MIT*
* 主要包括了一些在「从 ***ActionScript 3.0*** 迁移到 ***TypeScript***」时遗留的AS3特性
* 例如：
  * AS3的整数类型：`int`、`uint`等
    * 其以TS「类型别名」的形式保留，仅在项目内部使用
  * AS3的Flash API：`DisplayObject`、`Sprite`等
    * 此模块未来将随着「H5客户端的开发」而被弃置

### 各类「模组」

这些「模组」实为一个个独立的npm包，与Matriangle本身没有直接关系，但均由Matriangle提供支持。

主要（已独立为npm包的）模组如下：

#### 原生 | `matriangle-mod-native`

* 许可证： ***LGPL 3.0***
* 主要提供API模块 `matriangle-api` 的标准默认实现
  * 「母体」
  * 「稀疏地图」
* 新引入了「玩家」`Player`的概念
* 可为后续模组开发提供模板

#### BaTS | `matriangle-mod-bats`

* 许可证： ***LGPL 3.0***
* 其前身BattleTriangle-Gamma的TS复刻，即「BattleTriangle-TS」
  * 目前只复原了部分特性——尚未复原的如：
    * 除「子弹」「激光」以外的「武器系统」
    * 除「Dummy」以外的游戏AI
    * 「游戏胜利」机制
    * 「国际化文本」机制

#### WebIO | `matriangle-mod-web-io`

* 许可证： *MIT*
* 用于「母体」服务器和各Web客户端之间的通信
  * 基于HTTP和WebSocket双协议，可实现「远程控制」「远程监控」等功能

#### 可视化 | `matriangle-mod-visualization`

* 许可证： *MIT*
* 用于「母体」中「方块」「实体」的可视化
* 可与**WebIO**结合，实现带显示界面的远程客户端

#### NAR框架 | `matriangle-mod-nar-framework`

* 许可证： *MIT*
* 用于对接AI系统[NARS](http://www.opennars.org/)，以开展AI实验的框架

## 许可证

包的**整体**以 ***LesserGNU General Public License v3(LGPLv3)*** 协议发布

* 使用者可以在**不修改源码时**私用
* 若使用者修改了源码，则必须将源码以相同协议发布

一部分包以 *MIT* 协议发布

* 此时许可相对宽松

## Related Repos 相关项目

前身：[BattleTriangle-Gamma](https://github.com/ARCJ137442/BattleTriangle-Gamma)

## Author's Note 作者注

* 该项目原先作为自身对Web开发的学习项目，用于学习TypeScript、Node与Web开发技术
* 该项目尚未正式发布（进入「稳定版」1.0阶段），许多代码可能在未来面临大幅变动
  * 不建议将其用于生产环境
* 该项目的当前目标是「为AI构建虚拟环境」，尚不打算用于其它用途
