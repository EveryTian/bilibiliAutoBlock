# bilibiliAutoBlock
基于弹幕内容的用户自动屏蔽Chrome扩展。

### 使用方法
修改`background.js`第一行代码，在其中添加想要屏蔽的正则匹配或文本匹配（使用正则表达式对象或字符串对象）。

例如：
```javascript
blockedRegexs = [
    /23{5}/, // 正则匹配
    "可爱想" // 文本匹配
];
```
