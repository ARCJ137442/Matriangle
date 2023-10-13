import { int, uint } from '../src/batr/legacy/AS3Legacy';
import { fPoint, iPoint, traverseNDSquare } from "../src/batr/common/geometricTools";
import IMap from '../src/batr/server/api/map/IMap';
import IMapLogic from '../src/batr/server/api/map/IMapLogic';
import IMapStorage from '../src/batr/server/api/map/IMapStorage';
import MapStorageSparse from '../src/batr/server/mods/native/maps/MapStorageSparse';
import { mRot } from '../src/batr/server/general/GlobalRot';
import { randInt, randIntBetween, sum } from '../src/batr/common/exMath';
import { BatrDefaultMaps } from '../src/batr/server/mods/batr/registry/MapRegistry';
import { BatrBlockPrototypes } from '../src/batr/server/mods/batr/registry/BlockRegistry';
import { mapV地图可视化 } from '../src/batr/server/mods/visualization/textVisualizations';

const { log, info, time, timeEnd } = console;
log(new MapStorageSparse(2));

function assert(condition: boolean, errorMessage: string = "Assertion failed!"): void {
    if (!condition)
        throw new Error(errorMessage);
}

const assert_equal: (v1: any, v2: any) => void = (v1: any, v2: any): void => assert(v1 === v2, `Assertion failed: ${v1} !== ${v2}`);

function show(name: string, obj: any = null): void {
    info(`${name} =`, obj);
}

function 地图读取测试(): void {
    const m: IMap = BatrDefaultMaps.MAP_B;
    const ml: IMapLogic = m, ms: IMapStorage = m.storage;

    assert_equal(ml.getBlockPlayerDamage(new iPoint(19, 4)), -1);
    assert(ml.getBlockPlayerDamage(new iPoint(19, 2)) !== 0);

    show("ms.getBlock(new iPoint(19, 2))", ms.getBlock(new iPoint(19, 2)));

    info("all blocks: ");
    ms.forEachValidPositions(
        (p: iPoint): void => log(`(${p.x}, ${p.y}): `, ms.getBlock(p))
    );
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
    function sum_2d(x: int, y: int): int { return x + y; }
    function sum(p: iPoint): int { return p.x + p.y; }

    info(`开始测试 ${s} ~ ${e} `);

    time("2d");
    for (let x = s; x < e; x++)
        for (let y = s; y < e; y++)
            sum_2d(x, y);
    timeEnd("2d");

    time("point_new");
    for (let x = s; x < e; x++)
        for (let y = s; y < e; y++)
            sum(new iPoint(x, y));
    timeEnd("point_new");

    time("point_cached");
    const point_cached: iPoint = new iPoint(2);
    for (let x = s; x < e; x++)
        for (let y = s; y < e; y++) {
            point_cached.x = x;
            point_cached.y = y;
            sum(point_cached);
        }
    timeEnd("point_cached");
})(0, 100);

for (const map of BatrDefaultMaps._ALL_MAPS) {
    log(`<========MAP "${map.name}"========>`);
    mapV地图可视化(map.storage as MapStorageSparse);
    log();
}

(function 随机取点测试(storage: MapStorageSparse, nRandom: uint): void {
    log('storage:', storage);
    let criteria: boolean = false;
    let rsp: iPoint;
    for (let i = 0; !criteria && i < nRandom; i++) {
        rsp = storage.randomPoint;
        log(`Random Point @`, rsp);
        log(`Random Spawn Point @`, storage.randomSpawnPoint);
        criteria = (rsp.some((x: int): boolean => x === 0 || x === 23));
    }
})(BatrDefaultMaps.MAP_H.storage as MapStorageSparse, 10000);

(function 随机朝向测试(map: IMap, nRandom: uint): void {
    log('map:', map);
    let pi: iPoint = new iPoint(map.storage.numDimension);
    const pf: fPoint = new fPoint(map.storage.numDimension);
    let step_i: int;
    let step_f: number;
    let rot: mRot, rRot: mRot;

    for (let i = 0; i < nRandom; i++) {
        // 生成随机朝向
        assert(
            map.storage.randomRotateDirectionAt(pi, 0, randIntBetween(1, 3)) !== 0
        );
        // 朝着朝向前进
        pi = map.storage.randomPoint;
        pf.copyFrom(pi);
        rot = map.storage.randomForwardDirectionAt(pi);
        step_i = randInt(5);
        step_f = Math.random();
        log(`Random toward-I [${pi.join(', ')}] --(${rot}, ${step_i})->`, map.towardWithRot_II(pi, rot, step_i));
        log(`Random toward-F [${pf.join(', ')}] --(${rot}, ${step_f})->`, map.towardWithRot_FF(pf, rot, step_f));
    }

})(BatrDefaultMaps.FRAME, 100);

/**
 * 像Julia遍历张量一样可视化一个地图
 */
function 地图可视化_高维(storage: MapStorageSparse): void {
    const zwMax: iPoint = new iPoint().copyFromArgs(...storage.borderMax.slice(2));
    const zwMin: iPoint = new iPoint().copyFromArgs(...storage.borderMin.slice(2));
    console.log(zwMax, zwMin);
    traverseNDSquare(
        zwMin, zwMax, (zw: iPoint): void => {
            console.info(`切片 [:, :, ${zw.join(', ')}] = `);
            mapV地图可视化(storage, ...zw);
        }
    );
}
(function 高维地图测试(): void {
    // 三维 8*8*8 = 512 🆚 24²=576
    const s3: MapStorageSparse = new MapStorageSparse(3);
    s3.setBorder(
        new iPoint(0, 0, 0),
        new iPoint(7, 7, 7),
    );
    s3.forEachValidPositions((p: iPoint): void => {
        // 外框
        if (p.some(x => x === 0 || x === 7))
            s3.setBlock(p, BatrBlockPrototypes.COLORED.softCopy());
        // 内空
        else
            s3.setVoid(p);
    });

    地图可视化_高维(s3);
    // 地图可视化(s3, 0);
    // 地图可视化(s3, 1);

    // 四维 4*4*4*4 = 1024 🆚 24²=576
    const s4: MapStorageSparse = new MapStorageSparse(4);
    s4.setBorder(
        new iPoint(0, 0, 0, 0),
        new iPoint(3, 3, 3, 3),
    );
    s4.forEachValidPositions((p: iPoint): void => {
        // 外框
        if (p.some(x => x === 0 || x === 3))
            s4.setBlock(p, BatrBlockPrototypes.BEDROCK.softCopy());
        else if (sum(p) == 5)
            s4.setBlock(p, BatrBlockPrototypes.GLASS.softCopy());
        // 内空
        else
            s4.setVoid(p);
    });

    地图可视化_高维(s4);
})();

// while (1);