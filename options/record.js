let recordJson = {};
// Format of recordJson:
// {
//     time: {
//         userId&blockId: danmaku
//     }
// }

function generateRecordTable() {
    let recordDateTimeNumbers = Object.keys(localStorage)
        .filter(x => x.substring(0, 5) === '#LOG#')
        .map(x => parseInt(x.substring(5)))
        .sort((a, b) => b - a);
    if (recordDateTimeNumbers.length === 0) {
        addEmptyPromptTr();
        return;
    }
    let documentFragment = new DocumentFragment();
    for (let dateTimeNumber of recordDateTimeNumbers) {
        let blockedUsersList = JSON.parse(localStorage['#LOG#' + dateTimeNumber]);
        recordJson[dateTimeNumber] = blockedUsersList;
        Object.keys(blockedUsersList).forEach(userIdAndBlockId => {
            let separatorIndex = userIdAndBlockId.indexOf('&');
            let trElement = generateTr(
                userIdAndBlockId.substring(0, separatorIndex),
                userIdAndBlockId.substring(separatorIndex + 1),
                dateTimeNumber, blockedUsersList[userIdAndBlockId]);
            documentFragment.appendChild(trElement);
        });
    }
    document.getElementById('record-table-body').appendChild(documentFragment);
}

function deleteButtonClick(obj) {
    let objName = obj.name;
    let separatorIndex = objName.indexOf('#');
    let dateTimeNumberString = objName.substring(separatorIndex + 1);
    let userIdAndBlockId = objName.substring(0, separatorIndex);
    unblockUser(userIdAndBlockId.substring(userIdAndBlockId.indexOf('&') + 1));
    delete recordJson[dateTimeNumberString][userIdAndBlockId];
    if (isEmptyObject(recordJson[dateTimeNumberString])) {
        delete recordJson[dateTimeNumberString];
        delete localStorage['#LOG#' + dateTimeNumberString];
        let trElement = obj.parentElement.parentElement;
        trElement.parentElement.removeChild(trElement);
        if (isEmptyObject(recordJson)) {
            addEmptyPromptTr();
        }
    } else {
        localStorage['#LOG#' + dateTimeNumberString] = JSON.stringify(recordJson[dateTimeNumberString]);
        let trElement = obj.parentElement.parentElement;
        trElement.parentElement.removeChild(trElement);
    }
}

function generateTr(userId, blockId, dateTimeNumber, danmakuContent) {
    let trElement = document.createElement('tr');
    trElement.innerHTML = '<td><div class="tooltip">' + userId + '<span class="tooltip-text">屏蔽时间：<br/>'
        + getDateTimeString(dateTimeNumber) + '</span></div></td><td>'
        + danmakuContent + '</td><td><button type="button" class="delete-button" name="'
        + userId + '&' + blockId + '#' + dateTimeNumber + '">取消屏蔽</button></td>';
    trElement.getElementsByTagName('button')[0].onclick = function () {
        deleteButtonClick(this);
    };
    return trElement;
}

function getDateTimeString(date) {
    if (Object.prototype.toString.call(date) === '[object Date]') {
        return '' + date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate()
            + ' ' + date.getHours() + ':' + date.getMinutes();
    } else if (typeof date === 'number') {
        date = new Date(date);
        return '' + date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate()
            + ' ' + date.getHours() + ':' + date.getMinutes();
    }
}

function addEmptyPromptTr() {
    let emptyPromptTr = document.createElement('tr');
    emptyPromptTr.innerHTML = '<td>-</td><td>尚无屏蔽记录</td><td>-</td>';
    document.getElementById('record-table-body').appendChild(emptyPromptTr);
}

function isEmptyObject(obj) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

function unblockUser(blockId) {
    let xmlHttpRequest = new XMLHttpRequest();
    xmlHttpRequest.withCredentials = true;
    xmlHttpRequest.open('POST', 'https://api.bilibili.com/x/dm/filter/user/del', true);
    xmlHttpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xmlHttpRequest.send('ids=' + blockId + '&jsonp=jsonp&csrf');
}

generateRecordTable();
