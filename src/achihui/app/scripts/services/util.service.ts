
export function findById(a: Array<any>, id: number | string) {
    for (var i = 0; i < a.length; i++) {
        if (a[i].id === id)
            return a[i];
    }

    return null;
};

export function extendfunc(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
