let blockedPatterns = [];
localStorage.isBlockedPatternsChanged = 'true';

const debugSwitch = true;

let debugLog = debugSwitch ? console.log : () => {
};

chrome.webRequest.onBeforeRequest.addListener(details => {
    let matchResult = /^https?:\/\/comment\.bilibili\.com\/\d+\.xml$/.exec(details.url);
    if (matchResult && details.type === 'xmlhttprequest') {
        let xmlHttpRequest = new XMLHttpRequest();
        debugLog('Danmaku File URI:', matchResult[0]);
        xmlHttpRequest.onreadystatechange = () => {
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
    if (localStorage.isBlockedPatternsChanged === 'true') {
        console.log('Updating Blocked Patterns...');
        updateBlockedPatterns();
        localStorage.isBlockedPatternsChanged = 'false';
        console.log('Blocked Patterns Updated.');
    }
    debugLog('Analyzing Danmaku...');
    debugLog('XML String:', xmlString);
    let xmlDom = document.createElement('div');
    xmlDom.innerHTML = xmlString;
    debugLog('XML DOM:', xmlDom);
    let danmakuElements = xmlDom.getElementsByTagName('d');
    debugLog('XML DOM Danmaku Elements:', danmakuElements);
    debugLog('Blocked Patterns:', blockedPatterns);
    let blockedDanmaku = [].filter.call(danmakuElements, x => danmakuBlockCheck(x.innerHTML));
    debugLog('Blocked Danmaku:', blockedDanmaku);
    let blockedUsers = [].map.call(blockedDanmaku, x => x.getAttribute('p').split(',')[6]);
    debugLog('Blocked Users:', blockedUsers);
    submitBlockedUsers(blockedUsers);
}

function danmakuBlockCheck(danmakuContent) {
    for (let i = 0; i < blockedPatterns.length; ++i) {
        let blockedPattern = blockedPatterns[i];
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
        let xmlHttpRequest = new XMLHttpRequest();
        debugLog(' | Submitting `' + blockedUser + '`...');
        xmlHttpRequest.withCredentials = true;
        xmlHttpRequest.onreadystatechange = () => {
            // TODO
        };
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

function updateBlockedPatterns() {
    let localStorageBlockedPatterns = localStorage.blockedPatterns;
    if (!localStorageBlockedPatterns) {
        return [];
    }
    debugLog("Blocked Patterns Local Storage:", localStorageBlockedPatterns);
    blockedPatterns = [];
    let blockedPatternsJson = JSON.parse(localStorageBlockedPatterns);
    debugLog('Blocked Patterns JSON:', blockedPatternsJson);
    for (let patternFormatString in blockedPatternsJson) {
        if (blockedPatternsJson.hasOwnProperty(patternFormatString)) {
            blockedPatterns.push(
                blockedPatternsJson[patternFormatString] ?
                    new RegExp(patternFormatString.substring(2)) :
                    patternFormatString.substring(2));
        }
    }
    return blockedPatterns;
}
