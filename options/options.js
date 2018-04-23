let blockedPatternsJson = {}; // e.g. { "R#23{7}" : true, "T#可爱想" : false }, { formatString : isRegExp, ... }
const regExpPrefix = storageName.regExpPrefix;
const textPrefix = storageName.textPrefix;

function initPatternTable() {
    // Add pattern button click:
    document.getElementById('add-button').onclick = function () {
        addButtonClick(this);
    };
    // Enter key event for input box:
    document.getElementById('pattern-input').onkeydown = keyEvent => {
        if (keyEvent.keyCode === 13) { // Enter
            document.getElementById('add-button').click();
        }
    };
}

function initBasicExceptionOptions() {
    // 5 checkboxes initialization:
    const bottomExceptionCheckbox = document.getElementById('bottom-exception');
    const topExceptionCheckbox = document.getElementById('top-exception');
    const conversedExceptionCheckbox = document.getElementById('conversed-exception');
    const advancedExceptionCheckbox = document.getElementById('advanced-exception');
    const subtitleExceptionCheckbox = document.getElementById('subtitle-exception');
    bottomExceptionCheckbox.onclick = topExceptionCheckbox.onclick = conversedExceptionCheckbox.onclick =
        advancedExceptionCheckbox.onclick = subtitleExceptionCheckbox.onclick = function () {
            checkboxClick(this);
        };
    bottomExceptionCheckbox.checked = localStorage[storageName.bottomException] === storageName.true;
    topExceptionCheckbox.checked = localStorage[storageName.topException] === storageName.true;
    conversedExceptionCheckbox.checked = localStorage[storageName.conversedException] === storageName.true;
    advancedExceptionCheckbox.checked = localStorage[storageName.advancedException] === storageName.true;
    subtitleExceptionCheckbox.checked = localStorage[storageName.subtitleException] === storageName.true;
}

function initDateExceptionOption() {
    // Date exception:
    const curYear = new Date().getFullYear();
    const selectYearElement = document.getElementById('select-year');
    const selectYearOptions = selectYearElement.options;
    for (let year = 2009; year < curYear; ++year) {
        const yearString = '' + year;
        selectYearOptions.add(new Option(yearString, yearString));
    }
    selectYearOptions.add(new Option('' + curYear, '' + curYear, true, true));
    const selectMonthElement = document.getElementById('select-month');
    const selectMonthOptions = selectMonthElement.options;
    for (let month = 1; month <= 12; ++month) {
        const monthString = '' + month;
        selectMonthOptions.add(new Option(monthString, monthString.length === 2 ? monthString : '0' + monthString));
    }
    const selectDayElement = document.getElementById('select-day');
    const updateDateExceptionString = () => {
        localStorage[storageName.dateException] = document.getElementById('select-year').value + '-' +
            document.getElementById('select-month').value + '-' + document.getElementById('select-day').value;
        localStorage[storageName.isSpecialOptionsChanged] = storageName.true;
    };
    selectYearElement.onchange = selectMonthElement.onchange = () => {
        generateSelectDayOptions();
        updateDateExceptionString();
    };
    selectDayElement.onchange = updateDateExceptionString;
    const dateExceptionCheckbox = document.getElementById('date-exception');
    dateExceptionCheckbox.onclick = function () {
        if (this.checked) {
            document.getElementById('select-date').hidden = false;
            updateDateExceptionString();
        } else {
            document.getElementById('select-date').hidden = true;
            localStorage[storageName.dateException] = '';
            localStorage[storageName.isSpecialOptionsChanged] = storageName.true;
        }
    };
    const dateExceptionString = localStorage[storageName.dateException];
    if (dateExceptionString !== '') {
        const yearString = dateExceptionString.substring(0, 4);
        const monthString = dateExceptionString.substring(5, 7);
        const dayString = dateExceptionString.substring(8, 10);
        selectYearElement.value = yearString;
        selectMonthElement.value = monthString;
        generateSelectDayOptions();
        selectDayElement.value = dayString;
        dateExceptionCheckbox.checked = true;
        document.getElementById('select-date').hidden = false;
    } else {
        generateSelectDayOptions();
        dateExceptionCheckbox.checked = false;
        document.getElementById('select-date').hidden = true;
    }
}

function initHistoryOprions() {
    // Select expiration time:
    const selectRecordExpirationTime = document.getElementById('record-expiration-time');
    selectRecordExpirationTime.onchange = function () {
        localStorage[storageName.recordExpirationTime] = this.value;
    };
    selectRecordExpirationTime.value = localStorage[storageName.recordExpirationTime];
    // Clear history button click:
    document.getElementById('clear-history').onclick = () => {
        if (confirm('确认清空历史屏蔽记录？') === true) {
            const recordStampPrefix = storageName.recordStampPrefix;
            const recordStampPrefixLength = recordStampPrefix.length;
            Object.keys(localStorage).forEach(key => {
                if (key.substring(0, recordStampPrefixLength) === recordStampPrefix) {
                    delete localStorage[key];
                }
            });
        }
    };
}

function initFilePort() {
    // Options import from & export to file:
    document.getElementById('file-io-checkbox').onchange = function () {
        document.getElementById('file-io').hidden = !this.checked;
    };
    document.getElementById('import-options').onclick = () => document.getElementById('file-port').click();
    document.getElementById('file-port').onchange = () => {
        const file = document.getElementById('file-port').files[0];
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onload = event => {
            const content = event.target.result;
            // TODO: analyzeContent
        };
        reader.readAsText(file);
    };
    document.getElementById('export-options').onclick = () => {
        // TODO: generateContent
    };
}

function initElements() {
    initPatternTable();
    initBasicExceptionOptions();
    initDateExceptionOption();
    initHistoryOprions();
    // initFilePort();
}

function generateSelectDayOptions() {
    const dayNum = getDaysNum(parseInt(document.getElementById('select-year').value),
        parseInt(document.getElementById('select-month').value));
    const selectDayOptions = document.getElementById('select-day').options;
    const curSelectDayOptionsNum = selectDayOptions.length;
    if (curSelectDayOptionsNum > dayNum) {
        for (let i = curSelectDayOptionsNum - 1; i >= dayNum; --i) {
            selectDayOptions.remove(i);
        }
    } else if (curSelectDayOptionsNum < dayNum) {
        for (let day = curSelectDayOptionsNum + 1; day <= dayNum; ++day) {
            const dayString = '' + day;
            selectDayOptions.add(new Option(dayString, dayString.length === 2 ? dayString : '0' + dayString));
        }
    }
}

function generateBlockedPatternTable() {
    if (localStorage.blockedPatterns) {
        blockedPatternsJson = JSON.parse(localStorage.blockedPatterns);
        const documentFragment = new DocumentFragment();
        for (const pattern in blockedPatternsJson) {
            if (blockedPatternsJson.hasOwnProperty(pattern)) {
                const isRegExp = blockedPatternsJson[pattern];
                if (typeof isRegExp !== 'boolean' ||
                    pattern.substring(0, 2) !== (isRegExp ? regExpPrefix : textPrefix)) {
                    delete blockedPatternsJson[pattern];
                } else {
                    addNewPatternTrToDocumentFragment(documentFragment, isRegExp, pattern.substring(2));
                }
            }
        }
        const addNewTr = document.getElementById('add-button').parentElement.parentElement;
        addNewTr.parentElement.insertBefore(documentFragment, addNewTr);
    }
}

function removePatternFromLocalStorage(isRegExp, pattern) {
    delete blockedPatternsJson[(isRegExp ? regExpPrefix : textPrefix) + pattern];
    updateLocalStoragePatterns();
}

function addPatternToLocalStorage(isRegExp, pattern) {
    const newPatternFormatString = (isRegExp ? regExpPrefix : textPrefix) + pattern;
    if (newPatternFormatString in blockedPatternsJson) {
        return false;
    }
    blockedPatternsJson[newPatternFormatString] = isRegExp;
    updateLocalStoragePatterns();
    return true;
}

function updateLocalStoragePatterns() {
    localStorage.blockedPatterns = JSON.stringify(blockedPatternsJson);
    localStorage.isBlockedPatternsChanged = storageName.true;
}

function checkboxClick(obj) {
    let exceptionName;
    switch (obj.id) {
        case 'bottom-exception':
            exceptionName = storageName.bottomException;
            break;
        case 'top-exception':
            exceptionName = storageName.topException;
            break;
        case 'conversed-exception':
            exceptionName = storageName.conversedException;
            break;
        case 'advanced-exception':
            exceptionName = storageName.advancedException;
            break;
        case 'subtitle-exception':
            exceptionName = storageName.subtitleException;
            break;
        default:
            return;
    }
    localStorage[exceptionName] = obj.checked ? storageName.true : storageName.false;
    localStorage[storageName.isSpecialOptionsChanged] = storageName.true;
}

function deleteButtonClick(obj) {
    const tr = obj.parentElement.parentElement;
    const trChildren = tr.children;
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
    const pattern = trChildren[1].innerText;
    removePatternFromLocalStorage(isRegExp, pattern);
    tr.parentElement.removeChild(tr);
}

function addButtonClick() {
    const addTrChildren = document.getElementById('add-tr').children;
    const input = addTrChildren[1].children[0];
    const pattern = input.value;
    if (pattern === '') {
        input.placeholder = '模式不能为空。';
        return;
    }
    let isRegExp;
    switch (addTrChildren[0].children[0].value) {
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
    const newTr = document.createElement('tr');
    newTr.innerHTML = '<td>' + (isRegExp ? '正则' : '文本') + '</td><td>' + pattern
        + '</td><td><button type="button" class="delete-button">删除</button></td>';
    newTr.getElementsByTagName('button')[0].onclick = function () {
        deleteButtonClick(this);
    };
    const addNewTr = document.getElementById('add-button').parentElement.parentElement;
    addNewTr.parentElement.insertBefore(newTr, addNewTr);
}

function addNewPatternTrToDocumentFragment(documentFragment, isRegExp, pattern) {
    const newTr = document.createElement('tr');
    newTr.innerHTML = '<td>' + (isRegExp ? '正则' : '文本') + '</td><td>' + pattern
        + '</td><td><button type="button" class="delete-button">删除</button></td>';
    newTr.getElementsByTagName('button')[0].onclick = function () {
        deleteButtonClick(this);
    };
    documentFragment.appendChild(newTr);
}

initElements();
generateBlockedPatternTable();
