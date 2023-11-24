
// 防抖函数
// debounce
export function debounce (fn, wait = 50, immediate = false) {
    let timer = null
    return function(...args) {
        if (timer) clearTimeout(timer)
        if (immediate && !timer) {
            fn.apply(this, args)
        }
        timer = setTimeout(() => {
            fn.apply(this, args)
        }, wait)
    }
}

// 生成uuid
// generate uuid
export const uuid = () => {
    function S4() {
        // eslint-disable-next-line no-bitwise
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (`${S4() + S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`);
}