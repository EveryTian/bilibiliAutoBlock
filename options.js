var blockedPatterns = {}; // e.g. { "R#23{7}" : true, "T#可爱想" : false }, { formatString : isRegExp, ... }
document.getElementById('add-button').onclick = function () {
    addButtonClick(this);
};

function generateBlockedPatternTable() {
    blockedPatterns = JSON.parse(localStorage.blockedPatterns);
    for (var pattern in blockedPatterns) {
        if (!blockedPatterns.hasOwnProperty(pattern)) {
            continue;
        }
        var isRegExp = blockedPatterns[pattern];
        if (typeof isRegExp !== 'boolean' || pattern.substring(0, 2) !== (isRegExp ? 'R#' : 'T#')) {
            delete blockedPatterns[pattern];
        } else {
            addNewPatternTr(isRegExp, pattern.substring(2));
        }
    }
}

function removePatternFromLocalStorage(isRegExp, pattern) {
    delete blockedPatterns[(isRegExp ? 'R#' : 'T#') + pattern];
    updateLocalStoragePatterns();
}

function addPatternToLocalStorage(isRegExp, pattern) {
    var newPatternFormatString = (isRegExp ? 'R#' : 'T#') + pattern;
    if (blockedPatterns[newPatternFormatString]) {
        return false;
    }
    blockedPatterns[newPatternFormatString] = isRegExp;
    updateLocalStoragePatterns();
    return true;
}

function updateLocalStoragePatterns() {
    localStorage.blockedPatterns = JSON.stringify(blockedPatterns);
}

function deleteButtonClick(obj) {
    var tr = obj.parentElement.parentElement;
    var trChildren = tr.children;
    var isRegExp;
    switch (trChildren[0].innerText) {
        case '正则':
            isRegExp = true;
            break;
        case '文本':
            isRegExp = false;
            break;
        default:
            tr.parentElement.removeChild(tr);
            return;
    }
    var pattern = trChildren[1].innerText;
    removePatternFromLocalStorage(isRegExp, pattern);
    tr.parentElement.removeChild(tr);
}

function addButtonClick(obj) {
    var addNewTrChildren = obj.parentElement.parentElement.children;
    var input = addNewTrChildren[1].children[0];
    var pattern = input.value;
    if (pattern === '') {
        input.placeholder = '模式不能为空。';
        return;
    }
    var isRegExp;
    switch (addNewTrChildren[0].children[0].value) {
        case 'regexp':
            isRegExp = true;
            break;
        case 'string':
            isRegExp = false;
            break;
        default:
            return;
    }
    if (addPatternToLocalStorage(isRegExp, pattern)) {
        addNewPatternTr(isRegExp, pattern);
        input.placeholder = '请输入匹配模式';
        input.value = '';
    } else {
        input.placeholder = '屏蔽模式已存在。';
        input.value = '';
    }
}

function addNewPatternTr(isRegExp, pattern) {
    var newTr = document.createElement('tr');
    newTr.innerHTML = '<td>' + (isRegExp ? '正则' : '文本') + '</td>' + '<td>' + pattern + '</td>'
        + '<td><button type="button" class="delete-button">删除</button></td>';
    newTr.getElementsByTagName('button')[0].onclick = function () {
        deleteButtonClick(this);
    };
    var addNewTr = document.getElementById('add-button').parentElement.parentElement;
    addNewTr.parentElement.insertBefore(newTr, addNewTr);
}

generateBlockedPatternTable();
