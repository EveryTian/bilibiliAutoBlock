const recordJson = {};
// Format of recordJson:
// {
//     time: {
//         userId&blockId: danmaku
//     }
// }

const deleteRecordPrompt = '删除记录';
const unblockUserPrompt = '取消屏蔽';

const recordStampPrefix = storageName.recordStampPrefix;
const recordStampPrefixLength = recordStampPrefix.length;

let isDeleteRecordMode = false;

function generateRecordTable() {
    const recordDateTimeNumbers = Object.keys(localStorage)
        .filter(x => x.substring(0, recordStampPrefixLength) === recordStampPrefix)
        .map(x => parseInt(x.substring(recordStampPrefixLength)))
        .sort((a, b) => b - a);
    if (recordDateTimeNumbers.length === 0) {
        addEmptyPromptTr();
        return;
    }
    const documentFragment = new DocumentFragment();
    const expirationDate = new Date().getTime() - parseInt(localStorage[storageName.recordExpirationTime]) * 86400000;
    for (const dateTimeNumber of recordDateTimeNumbers) {
        if (dateTimeNumber < expirationDate) {
            delete localStorage[recordStampPrefix + dateTimeNumber];
            continue;
        }
        const blockedUsersList = JSON.parse(localStorage[recordStampPrefix + dateTimeNumber]);
        recordJson[dateTimeNumber] = blockedUsersList;
        Object.keys(blockedUsersList).forEach(userIdAndBlockId => {
            const separatorIndex = userIdAndBlockId.indexOf('&');
            const trElement = generateTr(
                userIdAndBlockId.substring(0, separatorIndex),
                userIdAndBlockId.substring(separatorIndex + 1),
                dateTimeNumber, blockedUsersList[userIdAndBlockId]);
            documentFragment.appendChild(trElement);
        });
    }
    document.getElementById('record-table-body').appendChild(documentFragment);
}

function initializeChangeModeButton() {
    document.getElementById('change-mode-button').onclick = () => {
        isDeleteRecordMode = !isDeleteRecordMode;
        const deleteButtons = document.getElementsByClassName('delete-button');
        if (isDeleteRecordMode) {
            for (let i = 0; i < deleteButtons.length; ++i) {
                deleteButtons[i].innerHTML = deleteRecordPrompt;
            }
            document.getElementById('change-mode-prompt').innerHTML = deleteRecordPrompt;
        } else {
            for (let i = 0; i < deleteButtons.length; ++i) {
                deleteButtons[i].innerHTML = unblockUserPrompt;
            }
            document.getElementById('change-mode-prompt').innerHTML = unblockUserPrompt;
        }
    };
}

function deleteButtonClick(obj) {
    const objName = obj.name;
    const separatorIndex = objName.indexOf('#');
    const dateTimeNumberString = objName.substring(separatorIndex + 1);
    const userIdAndBlockId = objName.substring(0, separatorIndex);
    if (!isDeleteRecordMode) {
        unblockUser(userIdAndBlockId.substring(userIdAndBlockId.indexOf('&') + 1));
    }
    delete recordJson[dateTimeNumberString][userIdAndBlockId];
    if (isEmptyObject(recordJson[dateTimeNumberString])) {
        delete recordJson[dateTimeNumberString];
        delete localStorage[recordStampPrefix + dateTimeNumberString];
        const trElement = obj.parentElement.parentElement;
        trElement.parentElement.removeChild(trElement);
        if (isEmptyObject(recordJson)) {
            addEmptyPromptTr();
        }
    } else {
        localStorage[recordStampPrefix + dateTimeNumberString] = JSON.stringify(recordJson[dateTimeNumberString]);
        const trElement = obj.parentElement.parentElement;
        trElement.parentElement.removeChild(trElement);
    }
}

function generateTr(userId, blockId, dateTimeNumber, danmakuContent) {
    const trElement = document.createElement('tr');
    trElement.innerHTML = '<td><div class="tooltip">' + userId + '<span class="tooltip-text">屏蔽时间：<br/>'
        + getDateTimeString(dateTimeNumber) + '</span></div></td><td>'
        + danmakuContent + '</td><td><button type="button" class="delete-button" name="'
        + userId + '&' + blockId + '#' + dateTimeNumber + '">' + unblockUserPrompt + '</button></td>';
    trElement.getElementsByTagName('button')[0].onclick = function () {
        deleteButtonClick(this);
    };
    return trElement;
}

function addEmptyPromptTr() {
    const emptyPromptTr = document.createElement('tr');
    emptyPromptTr.innerHTML = '<td>-</td><td>尚无屏蔽记录</td><td>-</td>';
    document.getElementById('record-table-body').appendChild(emptyPromptTr);
}

function unblockUser(blockId) {
    post('https://api.bilibili.com/x/dm/filter/user/del', 'ids=' + blockId + '&jsonp=jsonp&csrf');
}

initializeChangeModeButton();
generateRecordTable();
