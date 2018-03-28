const debugSwitch = true;

let debugLog = debugSwitch ? console.log : () => {
};

function isNumber(obj) {
    return typeof(obj) === 'number';
}

function isString(obj) {
    return typeof obj === 'string';
}

function isRegExp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
}

function isDate(obj) {
    return Object.prototype.toString.call(obj) === '[object Date]';
}

function isEmptyObject(obj) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

function getDateTimeString(date) {
    if (isDate(date)) {
        return '' + date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate()
            + ' ' + date.getHours() + ':' + date.getMinutes();
    } else if (isNumber(date)) {
        date = new Date(date);
        return '' + date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate()
            + ' ' + date.getHours() + ':' + date.getMinutes();
    }
}

function post(url, data, callBackFn) {
    let xmlHttpRequest = new XMLHttpRequest();
    xmlHttpRequest.withCredentials = true;
    if (callBackFn !== undefined) {
        xmlHttpRequest.onreadystatechange = () => callBackFn(xmlHttpRequest);
    }
    xmlHttpRequest.open('POST', url, true);
    xmlHttpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xmlHttpRequest.send(data);
}

function getDaysNum(year, month) {
    if (month <= 0 || month > 12) {
        return 0;
    }
    if (month === 2 && (((year & 0x3) === 0 && year % 100 !== 0) || year % 400 === 0)) {
        return 29;
    }
    const daysNum = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return daysNum[month - 1];
}
