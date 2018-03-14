const debugSwitch = true;

var debugLog = debugSwitch ? console.log : function () {
};

chrome.webRequest.onBeforeRequest.addListener(function(details) {
    var matchResult = /^https?:\/\/comment\.bilibili\.com\/\d+\.xml$/.exec(details.url);
    if (matchResult && details.type === 'xmlhttprequest') {
        var xmlHttpRequest = new XMLHttpRequest();
        debugLog('Danmaku File URI:', matchResult[0]);
        xmlHttpRequest.onreadystatechange = function() {
            debugLog('     | readyState:', xmlHttpRequest.readyState);
            debugLog('     | status:', xmlHttpRequest.status);
            if (xmlHttpRequest.readyState === 4 && xmlHttpRequest.status === 200) {
                analyze(xmlHttpRequest.responseText);
            }
        };
        xmlHttpRequest.open('GET', matchResult[0] + '?bilibiliAutoBlock', true);
        debugLog(' | Getting Danmaku File...');
        xmlHttpRequest.send(null);
    }
}, {
    urls: ["*://comment.bilibili.com/*.xml"]
}, ["blocking"]);


function analyze(xmlString) {
    if (!xmlString) {
        return;
    }
    debugLog('Analyzing Danmaku...');
    debugLog(' | XML String:', xmlString);
    var xmlDom = document.createElement('div');
    xmlDom.innerHTML = xmlString;
    debugLog(' | XML DOM:', xmlDom);
    var danmakuElements = xmlDom.getElementsByTagName('d');
    debugLog(' | XML DOM Danmaku Elements:', danmakuElements);
    var blockedDanmaku = [].filter.call(danmakuElements, x => danmakuBlockCheck(x.innerHTML));
    debugLog(' | Blocked Danmaku:', blockedDanmaku);
    var blockedUsers = [].map.call(blockedDanmaku, x => x.getAttribute('p').split(',')[6]);
    debugLog(' | Blocked Users:', blockedUsers);
    submitBlockedUsers(blockedUsers);
}

function danmakuBlockCheck(danmakuContent) {
    var blockedPatterns = getBlockedPatterns();
    debugLog('Blocked Patterns:', blockedPatterns);
    for (var i = 0; i < blockedPatterns.length; ++i) {
        var blockedPattern = blockedPatterns[i];
        if (!blockedPattern) {
            continue;
        }
        if (isString(blockedPattern) && blockedPattern !== '' && danmakuContent.indexOf(blockedPattern) !== -1) {
            return true;
        }
        if (isRegExp(blockedPattern) && blockedPattern.exec(danmakuContent)) {
            return true;
        }
    }
    return false;
}

function submitBlockedUsers(blockedUsers) {
    function submitBlockedUser(blockedUser) {
        var xmlHttpRequest = new XMLHttpRequest();
        debugLog(' | Submitting `' + blockedUser + '`...');
        xmlHttpRequest.withCredentials = true;
        xmlHttpRequest.open('POST', 'https://api.bilibili.com/x/dm/filter/user/add', true);
        xmlHttpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xmlHttpRequest.send('type=2&filter=' + blockedUser + '&jsonp=jsonp&csrf');
    }
    debugLog('Submitting Blocked Users...');
    blockedUsers.forEach(submitBlockedUser);
}

function isString(obj) {
    return typeof obj === 'string';
}

function isRegExp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
}

function getBlockedPatterns() {
    var localStorageBlockedPatterns = localStorage.blockedPatterns;
    if (!localStorageBlockedPatterns) {
        return [];
    }
    debugLog("Blocked Patterns Local Storage:", localStorageBlockedPatterns);
    var blockedPatterns = [];
    var blockedPatternsJson = JSON.parse(localStorageBlockedPatterns);
    debugLog('Blocked Patterns JSON:', blockedPatternsJson);
    for (var patternFormatString in blockedPatternsJson) {
        if (blockedPatternsJson.hasOwnProperty(patternFormatString)) {
            blockedPatterns.push(
                blockedPatternsJson[patternFormatString] ?
                    new RegExp(patternFormatString.substring(2)) :
                    patternFormatString.substring(2));
        }
    }
    return blockedPatterns;
}
