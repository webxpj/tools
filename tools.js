// 数组去重
Array.prototype.unique = function(){
    var arr = [],
        temp = {},
        len = this.length;
    for(var i = 0; i < len; i++){
        if(!temp[this[i]]){
            temp[this[i]] = "abc";
            arr.push(this[i]);
        }
    }
    return arr;
}

// 封装getStyle(elem,prop)
function getStyle(elem,prop){
    if(window.getComputedStyle){
        return window.getComputedStyle(elem,null)[prop];
    }else{
        return elem.currentStyle[prop];
    }
}

// 封装addEvent(elem,type,handle)
function addEvent(elem,type,handle){
    if(elem.addEventListener){
        elem.addEventListener(type,handle,false);
    }else if(elem.attachEvent){
        elem.attachEvent('on' + type, function(){
            handle.call(elem);
        })
    }else{
        elem['on' + type] = handle;
    }
}

// 封装removeEvent(ele,type,handle)
function removeEvent(elem,type,handle){
    if(elem.removeEventListener){
        elem.removeEventListener(type,handle,false);
    }else if(elem.detachEvent){
        elem.detachEvent('on' + type, function(){
            handle.call(elem);
        })
    }else{
        elem['on' + type] = null;
    }
}

// 封装取消冒泡的函数
function stopBubble(event){
    if(event.stopPropagation){
        event.stopPropagation();
    }else{
        event.cancelBubble = true;
    }
}

// 封装阻止默认事件的函数
function cancelHandle(event){
    if(event.preventDefault){
        event.preventDefault();
    }else{
        event.returnValue = false;
    }
}

// 封装拖拽运动
function drag(elem) {
    var disX,
        disY;
    addEvent(elem, 'mousedown', function (event) {
        var e = event || window.event;
        disX = (e.pageX || e.clientX) - parseInt(getStyle(elem, 'left'));
        disY = (e.pageY || e.clientY) - parseInt(getStyle(elem, 'top'));
        addEvent(document, 'mousemove', mouseMove);
        addEvent(document, 'mouseup', mouseUp);
        stopBubble(event);
        cancelHandle(event);
    });
    function mouseMove(event) {
        var e = event || window.event;
        elem.style.left =  (e.pageX || e.clientX)- disX + 'px';
        elem.style.top =  (e.pageY || e.clientY)- disY + 'px';
    }
    function mouseUp() {
        removeEvent(document, 'mousemove', mouseMove);
        removeEvent(document, 'mouseup', mouseUp);
    }
}
// 深度克隆
function clone(obj, deep) {
    if (Array.isArray(obj)) {
        return obj.slice();
    } else if (typeof obj === 'object' && obj !== null) {
        var newObj = {};
        for (var prop in obj) {
            newObj[prop] = Boolean(deep) ? clone(obj[prop], true) : obj[prop];
        }
        return newObj;
    } else {
        return obj;
    }
}
function deepClone(obj) {
    var newObj = obj instanceof Array ? [] : {};
    for (var prop in obj) {
        newObj[prop] = typeof obj[prop] == 'object' && obj[prop] != null ? deepClone(obj[prop]) : obj[prop];
    }
    return newObj
}

//防抖：一个时间段内多次触发不执行，等最后一次触发后延时一段时间再执行
function debounce(callback, duration) {
    var timer;
    return function () {
        clearTimeout(timer)
        var _this = this,
            args = arguments;
        timer = setTimeout(function () {
            callback.apply(_this, args);
        }, duration)
    }
}

//节流：保证一个时间段内只执行一次
function throttle(callback, duration, immediate) {
    if (immediate) {     //立即执行                         
        var time;      //定义初始时刻
        return function () {
            if (!time || Date.now() - time >= duration) {
                callback.apply(this, arguments);   //直接用外部传递的参数，不定参所以选择arguments
                time = Date.now();                //重新计时
            }
        }
    } else {
        var timer;
        return function () {
            if (timer) {
                return;                   //有计时器直接返回      
            }
            var _this = this,             //绑定this
                args = arguments;         //外部传参给function而非callback，所以要用args先存储
            timer = setTimeout(function () {
                callback.apply(_this, args);         //args是数组，所以用apply
                timer = null;              //清空计时器
            }, duration)
        }
    }
}

// ES5下实现const  详细解答 https://juejin.im/post/5ce3b2d451882533287a767f
function _const(data, value) {
    window.data = value;
    Object.defineProperty(window, data, {
        enumerable: false,
        configurable: false,
        get: function () {
            return value
        },
        set: function (data) {
            if (data !== value) {
                throw new TypeError('Assignment to constant variable')
            } else {
                return value
            }
        }
    })
}

//手写call
Function.prototype.myCall = function (thisArg, ...args) {
    const fn = Symbol('fn');
    thisArg = thisArg || window;
    thisArg[fn] = this;
    const result = thisArg[fn](...args);
    delete thisArg[fn];
    return result;
}

//手写apply
Function.prototype.myApply = function (thisArg, args) {
    const fn = Symbol('fn');
    thisArg = thisArg || window;
    thisArg[fn] = this;
    const result = thisArg[fn](...args);
    delete thisArg[fn];
    return result;
}

//手写bind
Function.prototype.myBind = function (thisArg, ...args) {
    var self = this;
    var fbound = function () {
        self.apply(this instanceof self ? this : thisArg, args.concat(Array.prototype.slice.call(arguments)))
    }
    fbound.prototype = Object.create(self.prototype);
    return fbound;
}

//手写Promise  详细解答 https://juejin.im/post/5e3b9ae26fb9a07ca714a5cc
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
class MyPromise {
    constructor(executor) {
        this._status = PENDING;
        this._value = undefined;
        this._resolveQueue = [];
        this._rejectQueue = [];
        let _resolve = (val) => {
            const run = () => {
                if (this._status !== PENDING) return;
                this._status = FULFILLED;
                this._value = val;
                while (this._resolveQueue.length) {
                    const callback = this._resolveQueue.shift();
                    callback(val);
                }
            }
            setTimeout(run);
        }
        let _reject = (val) => {
            const run = () => {
                if (this._status !== PENDING) return;
                this._status = REJECTED;
                this._value = val;
                while (this._rejectQueue.length) {
                    const callback = this._rejectQueue.shift();
                    callback(val);
                }
            }
            setTimeout(run);
        }
        executor(_resolve, _reject)
    }
    then(resolveFn, rejectFn) {
        typeof resolveFn !== 'function' ? resolveFn = value => value : null;
        typeof rejectFn !== 'function' ? rejectFn = reason => {
            throw new Error(reason instanceof Error ? reason.message : reason)
        } : null;
        return new MyPromise((resolve, reject) => {
            const fulfilledFn = value => {
                try {
                    let x = resolveFn(value);
                    x instanceof MyPromise ? x.then(resolve, reject) : resolve(x)
                } catch (error) {
                    reject(error)
                }
            }
            const rejectedFn = error => {
                try {
                    let x = rejectFn(error);
                    x instanceof MyPromise ? x.then(resolve, reject) : resolve(x);
                } catch (error) {
                    reject(error)
                }
            }
            switch (this._status) {
                case PENDING:
                    this._resolveQueue.push(fulfilledFn);
                    this._rejectQueue.push(rejectedFn);
                    break;
                case FULFILLED:
                    fulfilledFn(this._value);
                    break;
                case REJECTED:
                    rejectedFn(this._value);
                    break;
            }
        })
    }
}

// 模拟实现new  详细解答 https://juejin.im/post/5e8b261ae51d4546c0382ab4#heading-11
function myNews(foo,...args){
    let obj = Object.create(foo.prototype);
    let result = foo.apply(obj,args);
    return Object.prototype.toString.call(result) === "[object Object]" ? result : obj;
}