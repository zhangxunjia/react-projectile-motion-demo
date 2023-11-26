/**
 * 生成UUID
 * @returns 生成的UUID
 */
export function uuid() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (`${S4() + S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`);
}

/**
 * 判断图片是否应该渲染，增强代码健壮性
 * @param {*} imgList 该demo的图片列表
 * @param {*} index 图片索引
 * @returns 是否应该渲染
 */
export const isRender = (imgList, index) => Array.isArray(imgList) && imgList[index] && imgList[index].src
