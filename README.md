# bilibiliAutoBlock
基于弹幕内容的用户自动屏蔽Chrome扩展。

### 使用方法

[基于开发者模式的安装方法](#安装方法)

（以下使用说明最后更新于`2018/3/12`）

**以下为假设的应用场景，并无任何倾向，仅用于功能演示：**

**`??????`的选取仅因看到一视频中相关弹幕较多方便用于演示，无他意。**

假设你看到如下一连串的问号决定屏蔽该用户，你可以使用bilibiliAutoBlock实现自动屏蔽。

![](readme_images/1.png)

1. 进入选项进行屏蔽模式的设置：

   ![](readme_images/2.png)

   你决定屏蔽掉发送弹幕中含有`??????`的用户，在类型中选取文本，输入模式进行添加：

   ![](readme_images/3.png)

   完成后如下图所示：

   ![](readme_images/4.png)

2. 接下来你在正常使用b站的同时便可以实现对于满足该条件用户的自动屏蔽，bilibiliAutoBlock会自动利用所登陆bilibili账号进行云端屏蔽，你只需在适当的时候进行列表的同步即可，如下：

   ![](readme_images/5.png)

   点击“同步屏蔽列表”后结果如下：

   ![](readme_images/6.png)

   若当前视频弹幕中存在含有`??????`的弹幕，可以看到已经对于该用户进行了屏蔽：

   ![](readme_images/7.png)

**使用正则进行更精准的匹配。**

#### 安装方法

1. 通过某种方法获取bilibiliAutoBlock项目文件：

   ![](readme_images/install1.png)

2. 进入扩展程序管理界面（chrome://extensions），注意勾选开发者模式选框，随后点击“加载已解压的扩展程序”，选择bilibiliAutoBlock项目所在文件夹进行加载：

   ![](readme_images/install2.png)

3. 如下图所示则说明加载成功：

   ![](readme_images/install3.png)


**注：在扩展运行时会使用项目所在文件夹，故不能移动或删除该文件夹。**

开发者模式运行扩展会出现以下情形，可能影响使用体验...（缺一张信用卡系列）

![](readme_images/install4.png)

[点击查看更新日志](update.log.md)
