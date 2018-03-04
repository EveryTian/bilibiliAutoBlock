blockedRegexs = [];

chrome.webRequest.onBeforeRequest.addListener(function(details) {
    var matchResult = /^https?:\/\/comment\.bilibili\.com\/\d+\.xml$/.exec(details.url);
    if (matchResult && details.type === 'xmlhttprequest') {
        var xmlHttpRequest = new XMLHttpRequest();
        xmlHttpRequest.onreadystatechange = function() {
            if (xmlHttpRequest.readyState === 4 && xmlHttpRequest.status === 200) {
                analyze(xmlHttpRequest.responseText);
            }
        }
        xmlHttpRequest.open('GET', matchResult[0] + '?bilibiliAutoBlock', true);
        xmlHttpRequest.send(null);
    }
}, {
    urls: ["*://comment.bilibili.com/*.xml"]
}, ["blocking"]);


function analyze(xmlString) {
    if (!xmlString) {
        return;
    }
    var xmlDom = document.createElement('div');
    xmlDom.innerHTML = xmlString;
    var danmakuElements = xmlDom.getElementsByTagName('d');
    var blockedDanmaku = [].filter.call(danmakuElements, x => danmakuBlockCheck(x.innerHTML));
    var blockedUsers = [].map.call(blockedDanmaku, x => x.getAttribute('p').split(',')[6]);
    submitBlockedUsers(blockedUsers);
}

function danmakuBlockCheck(danmakuContent) {
    for (var i = 0; i < blockedRegexs.length; ++i) {
        var blockedRegex = blockedRegexs[i];
        if (!blockedRegex) {
            continue;
        }
        if (typeof blockedRegex === 'string') {
            blockedRegex = new RegExp(blockedRegex);
        }
        if (blockedRegex.exec(danmakuContent)) {
            return true;
        }
    }
    return false;
}

function submitBlockedUsers(blockedUsers) {
    function submitBlockedUser(blockUser) {
        var xmlHttpRequest = new XMLHttpRequest();
        xmlHttpRequest.withCredentials = true;
        xmlHttpRequest.open('POST', 'https://api.bilibili.com/x/dm/filter/user/add', true);
        xmlHttpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xmlHttpRequest.send('type=2&filter=' + blockUser + '&jsonp=jsonp&csrf');
    }
    blockedUsers.forEach(submitBlockedUser);
}