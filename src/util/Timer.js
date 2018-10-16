class Timer {
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

let timer = new Timer();
export default timer;
