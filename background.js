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
    let xmlDomDiv = document.createElement('div');
    xmlDomDiv.innerHTML = xmlString;
    debugLog('XML DOM:', xmlDomDiv);
    let danmakuDomElements = xmlDomDiv.getElementsByTagName('d');
    debugLog('XML DOM Danmaku Elements:', danmakuDomElements);
    debugLog('Blocked Patterns:', blockedPatterns);
    let blockedDanmakuDomElements = [].filter.call(danmakuDomElements, x => danmakuBlockCheck(x.innerHTML));
    debugLog('Blocked Danmaku:', blockedDanmakuDomElements);
    let blockedUsersInfo = {}; // { blockedUserId : blockedDanmakuContent }
    for (let i = 0; i < blockedDanmakuDomElements.length; ++i) {
        let blockedDanmakuDomElement = blockedDanmakuDomElements[i];
        blockedUsersInfo[blockedDanmakuDomElement.getAttribute('p').split(',')[6]] = blockedDanmakuDomElement.innerHTML;
    }
    debugLog('Blocked Users:', blockedUsersInfo);
    submitBlockedUsers(blockedUsersInfo);
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

function submitBlockedUsers(blockedUsersInfo) {
    debugLog('Submitting Blocked Users...');
    let blockedUsersIdArray = Object.keys(blockedUsersInfo);
    let submittedUsersInfo = {};
    let submittedUsersCount = 0;
    blockedUsersIdArray.forEach(blockedUserId => {
        let xmlHttpRequest = new XMLHttpRequest();
        debugLog(' | Submitting `' + blockedUserId + '`...');
        xmlHttpRequest.withCredentials = true;
        xmlHttpRequest.onreadystatechange = () => {
            debugLog('     | `' + blockedUserId + '` readyState:', xmlHttpRequest.readyState);
            debugLog('     | `' + blockedUserId + '` status:', xmlHttpRequest.status);
            if (xmlHttpRequest.readyState === 4 && xmlHttpRequest.status === 200) {
                // {"code":0,"data":{"id":\d{6},"mid":0,"type":0,"filter":"","comment":""},"message":"0","ttl":1}
                let blockResponse = JSON.parse(xmlHttpRequest.responseText);
                if (blockResponse.code === 0) {
                    debugLog('     | Block `' + blockedUserId + '(' + submittedUsersInfo[blockedUserId] + ')` Successfully.');
                    submittedUsersInfo[blockedUserId] = blockedUsersInfo[blockedUserId];
                    ++submittedUsersCount;
                }
            }
        };
        xmlHttpRequest.open('POST', 'https://api.bilibili.com/x/dm/filter/user/add', true);
        xmlHttpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xmlHttpRequest.send('type=2&filter=' + blockedUserId + '&jsonp=jsonp&csrf');
    });

    function finishJudge(previousSubmittedUsersCount) {
        setTimeout(() => {
            if (previousSubmittedUsersCount === submittedUsersCount) {
                if (isEmptyObject(submittedUsersInfo)) {
                    return;
                }
                let key = '#LOG#' + getDateTimeString();
                localStorage[key] = JSON.stringify(submittedUsersInfo);
                console.log(key, ':', submittedUsersInfo);
            } else {
                finishJudge(submittedUsersCount);
            }
        }, 1000);
    }

    // finishJudge(submittedUsersCount); // Interface implementation.
}

function isString(obj) {
    return typeof obj === 'string';
}

function isRegExp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
}

function getDateTimeString() {
    let date = new Date();
    return '' + date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDay()
        + ' ' + date.getHours() + ':' + date.getMinutes()
        + '#' + date.getSeconds() + '.' + date.getMilliseconds(); // Use to avoid conflict.
}

function isEmptyObject(obj) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
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
