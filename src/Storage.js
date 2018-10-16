const storage = weex.requireModule('storage');

export function saveItem(key, value) {
    if (typeof value === 'object') {
        value = JSON.stringify(value);
    }
    return new Promise((resolve, reject) => {
        storage.setItem(key, value, e => {
            if (e.result === 'success') {
                resolve();
            } else {
                reject(new Error(e.data));
            }
        });
    });
}

export async function loadItem(key) {
    return new Promise((resolve, reject) => {
        storage.getItem(key, e => {
            if (e.result === 'success') {
                let result = e.data;
                // json数据的话就转为object输出
                try {
                    result = JSON.parse(result);
                } catch (e) {}
                resolve(result);
            } else {
                resolve(undefined);
            }
        });
    });
}

// 注入到vue的methods方法集
export const methods = {
    saveItem,
    loadItem
};
