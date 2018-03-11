function generateBlockedPatternTable() {
    // TODO
}

function removePatternFromLocalStorage(isRegExp, pattern) {
    // TODO
}

function addPatternToLocalStorage(isRegExp, pattern) {
    // TODO
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
    addPatternToLocalStorage(isRegExp, pattern);
    addNewPatternTr(isRegExp, pattern);
    input.value = "";
}

function addNewPatternTr(isRegExp, pattern) {
    var newTr = document.createElement('tr');
    newTr.innerHTML = '<td>' + (isRegExp ? '正则' : '文本') + '</td>' + '<td>' + pattern + '</td>'
        + '<td><button type="button" class="delete-button" onclick="deleteButtonClick(this)">删除</button></td>';
    var addNewTr = document.getElementById('add-button').parentElement.parentElement;
    addNewTr.parentElement.insertBefore(newTr, addNewTr);
}

generateBlockedPatternTable();
