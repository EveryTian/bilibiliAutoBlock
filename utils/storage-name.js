const storageName = {
    isBlockedPatternsChanged: 'isBlockedPatternsChanged',
    blockedPatterns: 'blockedPatterns',
    isSpecialOptionsChanged: 'isSpecialOptionsChanged',
    bottomException: 'bottomException',
    topException: 'topException',
    conversedException: 'conversedException',
    advancedException: 'advancedException',
    subtitleException: 'subtitleException',
    dateException: 'dateException',
    recordExpirationTime: 'recordExpirationTime',
    recordStampPrefix: '#LOG#',
    regExpPrefix: 'R#',
    textPrefix: 'T#',
    true: 'true',
    false: 'false'
};

const nameDefaultValuePairs = {
    blockedPatterns: '{}',
    isBlockedPatternsChanged: 'true',
    bottomException: 'true',
    topException: 'true',
    conversedException: 'true',
    advancedException: 'true',
    subtitleException: 'true',
    dateException: '',
    isSpecialOptionsChanged: 'true',
    recordExpirationTime: '7'
};

function initializeLocalStorage() {
    Object.keys(nameDefaultValuePairs).forEach(name => {
        if (localStorage[name] === undefined) {
            localStorage[name] = nameDefaultValuePairs[name];
        }
    });
}
