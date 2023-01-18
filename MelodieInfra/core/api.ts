export const floor = Math.floor
export const randint = (a: number, b: number): number => {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

export const random = Math.random

export function lru_cache(size: number) {

    return function (f: any) {
        return function (...num: (boolean | number | string)[]) {
            return f(...num)
        }
    }
}