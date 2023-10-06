import { int, uint } from '../src/batr/legacy/AS3Legacy';
import { fPoint, iPoint, traverseNDSquare } from "../src/batr/common/geometricTools";
import IMap from '../src/batr/server/api/map/IMap';
import IMapLogic from '../src/batr/server/api/map/IMapLogic';
import IMapStorage from '../src/batr/server/api/map/IMapStorage';
import MapStorageSparse from '../src/batr/server/mods/native/maps/MapStorageSparse';
import BlockVoid from '../src/batr/server/mods/native/blocks/Void';
import { mRot } from '../src/batr/server/general/GlobalRot';
import { randInt, randIntBetween, sum } from '../src/batr/common/exMath';
import { NativeMaps } from '../src/batr/server/mods/native/registry/MapRegistry';
import BlockWall from '../src/batr/server/mods/native/blocks/Wall';
import BlockBedrock from '../src/batr/server/mods/native/blocks/Bedrock';
import BlockGlass from '../src/batr/server/mods/native/blocks/Glass';

let { log, info, time, timeEnd } = console;
log(new MapStorageSparse(2))

function assert(condition: boolean, errorMessage: string = "Assertion failed!"): void {
    if (!condition)
        throw new Error(errorMessage)
}

const assert_equal: (v1: any, v2: any) => void = (v1: any, v2: any): void => assert(v1 === v2, `Assertion failed: ${v1} !== ${v2}`)

function show(name: string, obj: any = null): void {
    info(`${name} =`, obj)
}

function 地图读取测试(): void {
    let m: IMap = NativeMaps.MAP_B
    let ml: IMapLogic = m, ms: IMapStorage = m.storage

    assert_equal(ml.getBlockPlayerDamage(new iPoint(19, 4)), -1)
    assert(ml.getBlockPlayerDamage(new iPoint(19, 2)) !== 0)

    show("ms.getBlock(new iPoint(19, 2))", ms.getBlock(new iPoint(19, 2)))

    info("all blocks: ")
    ms.forEachValidPositions(
        (p: iPoint): void => log(`(${p.x}, ${p.y}): `, ms.getBlock(p))
    )
} 地图读取测试();

/**
 * 各类性能测试
 * 1 2d情况
 * 2 新对象情况
 * 3 缓存的对象情况
 * 
 * * 【20230913 17:28:39】现已停用
 */

(function 多维点性能遍历测试(s: int, e: int): void {
    function sum_2d(x: int, y: int): int { return x + y }
    function sum(p: iPoint): int { return p.x + p.y }

    info(`开始测试 ${s} ~ ${e} `)

    time("2d")
    for (let x = s; x < e; x++)
        for (let y = s; y < e; y++)
            sum_2d(x, y)
    timeEnd("2d")

    time("point_new")
    for (let x = s; x < e; x++)
        for (let y = s; y < e; y++)
            sum(new iPoint(x, y))
    timeEnd("point_new")

    time("point_cached")
    let point_cached: iPoint = new iPoint(2)
    for (let x = s; x < e; x++)
        for (let y = s; y < e; y++) {
            point_cached.x = x
            point_cached.y = y
            sum(point_cached)
        }
    timeEnd("point_cached")
})(0, 100);

/**
 * 若方块为「空」，则填充空格；否则截断并补全空格
 * @param name 方块类型（类名）
 * @returns 格式化后的定长名字
 */
function showBlock(name: string): string {
    return (name == BlockVoid.name ? '' : name.slice(5, 5 + 7)).padEnd(7)
}
function 地图可视化(storage: MapStorageSparse, ...otherPos_I: int[]): void {
    let line: string[];
    let iP: iPoint = new iPoint(0, 0, ...otherPos_I);
    for (let y = storage.borderMin[1]; y <= storage.borderMax[1]; y++) {
        line = [];
        for (let x = storage.borderMin[0]; x <= storage.borderMax[0]; x++) {
            iP.copyFromArgs(x, y); // ! 会忽略其它地方的值
            line.push(
                showBlock(
                    storage.getBlock(iP).type.name
                )
            );
        }
        log('|' + line.join(' ') + '|')
    }
}
for (const map of NativeMaps.ALL_NATIVE_MAPS) {
    log(`<========MAP "${map.name}"========>`)
    地图可视化(map.storage as MapStorageSparse);
    log()
}

(function 随机取点测试(storage: MapStorageSparse, nRandom: uint): void {
    log('storage:', storage)
    let criteria: boolean = false
    let rsp: iPoint;
    for (let i = 0; !criteria && i < nRandom; i++) {
        rsp = storage.randomPoint
        log(`Random Point @`, rsp)
        log(`Random Spawn Point @`, storage.randomSpawnPoint)
        criteria = (rsp.some((x: int): boolean => x === 0 || x === 23))
    }
})(NativeMaps.MAP_H.storage as MapStorageSparse, 10000);

(function 随机朝向测试(map: IMap, nRandom: uint): void {
    log('map:', map)
    let pi: iPoint = new iPoint(map.storage.numDimension);
    let pf: fPoint = new fPoint(map.storage.numDimension);
    let step_i: int;
    let step_f: number;
    let rot: mRot, rRot: mRot;

    for (let i = 0; i < nRandom; i++) {
        // 生成随机朝向
        assert(
            map.storage.randomRotateDirectionAt(pi, 0, randIntBetween(1, 3)) !== 0
        )
        // 朝着朝向前进
        pi = map.storage.randomPoint
        pf.copyFrom(pi)
        rot = map.storage.randomForwardDirectionAt(pi)
        step_i = randInt(5)
        step_f = Math.random()
        log(`Random toward-I [${pi.join(', ')}] --(${rot}, ${step_i})->`, map.towardWithRot_II(pi, rot, step_i))
        log(`Random toward-F [${pf.join(', ')}] --(${rot}, ${step_f})->`, map.towardWithRot_FF(pf, rot, step_f))
    }

})(NativeMaps.FRAME, 100);

/**
 * 像Julia遍历张量一样可视化一个地图
 */
function 地图可视化_高维(storage: MapStorageSparse): void {
    let zwMax: iPoint = new iPoint().copyFromArgs(...storage.borderMax.slice(2));
    let zwMin: iPoint = new iPoint().copyFromArgs(...storage.borderMin.slice(2));
    console.log(zwMax, zwMin)
    traverseNDSquare(
        zwMin, zwMax, (zw: iPoint): void => {
            console.info(`切片 [:, :, ${zw.join(', ')}] = `)
            地图可视化(storage, ...zw);
        }
    );
}
(function 高维地图测试(): void {
    // 三维 8*8*8 = 512 🆚 24²=576
    let s3: MapStorageSparse = new MapStorageSparse(3);
    s3.setBorder(
        new iPoint(0, 0, 0),
        new iPoint(7, 7, 7),
    )
    s3.forEachValidPositions((p: iPoint): void => {
        // 外框
        if (p.some(x => x === 0 || x === 7))
            s3.setBlock(p, new BlockWall())
        // 内空
        else
            s3.setVoid(p)
    })

    地图可视化_高维(s3);
    // 地图可视化(s3, 0);
    // 地图可视化(s3, 1);

    // 四维 4*4*4*4 = 1024 🆚 24²=576
    let s4: MapStorageSparse = new MapStorageSparse(4);
    s4.setBorder(
        new iPoint(0, 0, 0, 0),
        new iPoint(3, 3, 3, 3),
    )
    s4.forEachValidPositions((p: iPoint): void => {
        // 外框
        if (p.some(x => x === 0 || x === 3))
            s4.setBlock(p, new BlockBedrock())
        else if (sum(p) == 5)
            s4.setBlock(p, new BlockGlass())
        // 内空
        else
            s4.setVoid(p)
    })

    地图可视化_高维(s4);
})();

// while (1);