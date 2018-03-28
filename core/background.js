let blockedPatterns = [];
let specialOptions = {
    bottomException: true,
    topException: true,
    conversedException: true,
    advancedException: true,
    subtitleException: true,
    dateException: ''
};

initializeLocalStorage();

chrome.webRequest.onBeforeRequest.addListener(details => {
    let matchResult = /^https?:\/\/comment\.bilibili\.com\/\d+\.xml$/.exec(details.url);
    if (matchResult && details.type === 'xmlhttprequest') {
        if (localStorage[storageName.isBlockedPatternsChanged] === storageName.true) {
            console.log('Updating Blocked Patterns...');
            updateBlockedPatterns();
            localStorage[storageName.isBlockedPatternsChanged] = storageName.false;
            console.log('Blocked Patterns Updated.');
        }
        if (localStorage[storageName.isSpecialOptionsChanged] === storageName.true) {
            console.log('Updating Special Options...');
            updateSpecialOptions();
            localStorage[storageName.isSpecialOptionsChanged] = storageName.false;
            console.log('Special Options Updated.');
        }
        if (blockedPatterns.length !== 0) {
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
    }
}, {
    urls: ["*://comment.bilibili.com/*.xml"]
}, ["blocking"]);

function analyze(xmlString) {
    if (!xmlString) {
        return;
    }
    debugLog('Analyzing Danmaku...');
    debugLog('XML String:', xmlString);
    let xmlDomDiv = document.createElement('div');
    xmlDomDiv.innerHTML = xmlString;
    debugLog('XML DOM:', xmlDomDiv);
    let danmakuDomElements = xmlDomDiv.getElementsByTagName('d');
    debugLog('XML DOM Danmaku Elements:', danmakuDomElements);
    debugLog('Blocked Patterns:', blockedPatterns);
    let blockedDanmakuDomElements = [].filter.call(danmakuDomElements,
        x => danmakuBlockCheck(x.innerHTML, x.getAttribute('p').split(',')));
    debugLog('Blocked Danmaku:', blockedDanmakuDomElements);
    let blockedUsersInfo = {}; // { blockedUserId : blockedDanmakuContent }
    for (let i = 0; i < blockedDanmakuDomElements.length; ++i) {
        let blockedDanmakuDomElement = blockedDanmakuDomElements[i];
        blockedUsersInfo[blockedDanmakuDomElement.getAttribute('p').split(',')[6]] = blockedDanmakuDomElement.innerHTML;
    }
    debugLog('Blocked Users:', blockedUsersInfo);
    submitBlockedUsers(blockedUsersInfo);
}

function danmakuBlockCheck(danmakuContent, danmakuAttributes) {
    switch (danmakuAttributes[1]) {
        case '4': // Bottom danmaku.
            if (specialOptions.bottomException) {
                return false;
            }
            break;
        case '5': // Top danmaku.
            if (specialOptions.topException) {
                return false;
            }
            break;
        case '6': // Conversed danmaku.
            if (specialOptions.conversedException) {
                return false;
            }
            break;
        case '7':
        case '8': // Advanced danmaku.
            if (specialOptions.advancedException) {
                return false;
            }
            break;
        default:
            break;
    }
    switch (danmakuAttributes[5]) {
        case '1': // Subtitle pool.
            if (specialOptions.subtitleException) {
                return false;
            }
            break;
        case '2': // Special pool.
            if (specialOptions.advancedException) {
                return false;
            }
            break;
        default:
            break;
    }
    if (specialOptions.dateException !== 0 && parseInt(danmakuAttributes[4]) < specialOptions.dateException) {
        return false;
    }
    for (let blockedPattern of blockedPatterns) {
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
        debugLog(' | Submitting `' + blockedUserId + '`...');
        post('https://api.bilibili.com/x/dm/filter/user/add',
            'type=2&filter=' + blockedUserId + '&jsonp=jsonp&csrf',
            xmlHttpRequest => {
                debugLog('     | `' + blockedUserId + '` readyState:', xmlHttpRequest.readyState);
                debugLog('     | `' + blockedUserId + '` status:', xmlHttpRequest.status);
                if (xmlHttpRequest.readyState === 4 && xmlHttpRequest.status === 200) {
                    // {"code":0,"data":{"id":blockId,"mid":0,"type":0,"filter":userId,"comment":""},"message":"0","ttl":1}
                    let blockResponse = JSON.parse(xmlHttpRequest.responseText);
                    if (blockResponse.code === 0) {
                        debugLog('     | Block `' + blockedUserId +
                            '(' + submittedUsersInfo[blockedUserId] + ')` Successfully.');
                        submittedUsersInfo[blockedUserId + '&' + blockResponse.data.id] = blockedUsersInfo[blockedUserId];
                        ++submittedUsersCount;
                    }
                }
            });
    });

    function finishJudge(previousSubmittedUsersCount) {
        setTimeout(() => {
            if (previousSubmittedUsersCount === submittedUsersCount) {
                if (isEmptyObject(submittedUsersInfo)) {
                    return;
                }
                let key = storageName.recordStampPrefix + new Date().getTime();
                localStorage[key] = JSON.stringify(submittedUsersInfo);
                console.log(key, ':', submittedUsersInfo);
            } else {
                finishJudge(submittedUsersCount);
            }
        }, 1000);
    }

    finishJudge(submittedUsersCount); // Interface implementation.
}

function updateBlockedPatterns() {
    let localStorageBlockedPatterns = localStorage[storageName.blockedPatterns];
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

function updateSpecialOptions() {
    specialOptions.bottomException = localStorage[storageName.bottomException] === storageName.true;
    specialOptions.topException = localStorage[storageName.topException] === storageName.true;
    specialOptions.conversedException = localStorage[storageName.conversedException] === storageName.true;
    specialOptions.advancedException = localStorage[storageName.advancedException] === storageName.true;
    specialOptions.subtitleException = localStorage[storageName.subtitleException] === storageName.true;
    let dateExceptionString = localStorage[storageName.dateException];
    if (dateExceptionString === '') {
        specialOptions.dateException = 0;
    } else {
        specialOptions.dateException = Math.round(new Date(dateExceptionString).getTime() / 1000);
    }
}
