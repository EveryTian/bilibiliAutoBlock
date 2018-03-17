let blockedPatternsJson = {}; // e.g. { "R#23{7}" : true, "T#可爱想" : false }, { formatString : isRegExp, ... }
document.getElementById('add-button').onclick = function () {
    addButtonClick(this);
};

function generateBlockedPatternTable() {
    if (localStorage.blockedPatterns) {
        blockedPatternsJson = JSON.parse(localStorage.blockedPatterns);
        let documentFragment = new DocumentFragment();
        for (let pattern in blockedPatternsJson) {
            if (blockedPatternsJson.hasOwnProperty(pattern)) {
                let isRegExp = blockedPatternsJson[pattern];
                if (typeof isRegExp !== 'boolean' || pattern.substring(0, 2) !== (isRegExp ? 'R#' : 'T#')) {
                    delete blockedPatternsJson[pattern];
                } else {
                    addNewPatternTrToDocumentFragment(documentFragment, isRegExp, pattern.substring(2));
                }
            }
        }
        let addNewTr = document.getElementById('add-button').parentElement.parentElement;
        addNewTr.parentElement.insertBefore(documentFragment, addNewTr);
    }
}

function removePatternFromLocalStorage(isRegExp, pattern) {
    delete blockedPatternsJson[(isRegExp ? 'R#' : 'T#') + pattern];
    updateLocalStoragePatterns();
}

function addPatternToLocalStorage(isRegExp, pattern) {
    let newPatternFormatString = (isRegExp ? 'R#' : 'T#') + pattern;
    if (blockedPatternsJson[newPatternFormatString]) {
        return false;
    }
    blockedPatternsJson[newPatternFormatString] = isRegExp;
    updateLocalStoragePatterns();
    return true;
}

function updateLocalStoragePatterns() {
    localStorage.blockedPatterns = JSON.stringify(blockedPatternsJson);
    localStorage.isBlockedPatternsChanged = 'true';
}

function deleteButtonClick(obj) {
    let tr = obj.parentElement.parentElement;
    let trChildren = tr.children;
    let isRegExp;
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
    let pattern = trChildren[1].innerText;
    removePatternFromLocalStorage(isRegExp, pattern);
    tr.parentElement.removeChild(tr);
}

function addButtonClick(obj) {
    let addNewTrChildren = obj.parentElement.parentElement.children;
    let input = addNewTrChildren[1].children[0];
    let pattern = input.value;
    if (pattern === '') {
        input.placeholder = '模式不能为空。';
        return;
    }
    let isRegExp;
    switch (addNewTrChildren[0].children[0].value) {
        case 'regexp':
            try {
                new RegExp(pattern);
            } catch (err) {
                alert('正则表达式语法不正确。');
                return;
            }
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
    let newTr = document.createElement('tr');
    newTr.innerHTML = '<td>' + (isRegExp ? '正则' : '文本') + '</td>' + '<td>' + pattern + '</td>'
        + '<td><button type="button" class="delete-button">删除</button></td>';
    newTr.getElementsByTagName('button')[0].onclick = () => {
        deleteButtonClick(this);
    };
    let addNewTr = document.getElementById('add-button').parentElement.parentElement;
    addNewTr.parentElement.insertBefore(newTr, addNewTr);
}

function addNewPatternTrToDocumentFragment(documentFragment, isRegExp, pattern) {
    let newTr = document.createElement('tr');
    newTr.innerHTML = '<td>' + (isRegExp ? '正则' : '文本') + '</td>' + '<td>' + pattern + '</td>'
        + '<td><button type="button" class="delete-button">删除</button></td>';
    newTr.getElementsByTagName('button')[0].onclick = function () {
        deleteButtonClick(this);
    };
    documentFragment.appendChild(newTr);
}

generateBlockedPatternTable();
