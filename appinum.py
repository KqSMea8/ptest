# -*- coding:utf-8
from time import sleep

from appium import webdriver

desired_caps = {
    #设备系统
    'platformName': 'Android',
    #设备名称
    #'deviceName': '127.0.0.1:62001',
    'deviceName': 'e1860339',
    #安卓版本
    'platformVersion': '8.1.0',
    # apk包名
    'appPackage': 'com.taobao.taobao',
    # apk的launcherActivity
    'appActivity': 'com.taobao.tao.welcome.Welcome',
    'unicodeKeyboard': True,  # 绕过手机键盘操作，unicodeKeyboard是使用unicode编码方式发送字符串
     'resetKeyboard':True,# 绕过手机键盘操作，resetKeyboard是将键盘隐藏起来

}
#启动app
driver = webdriver.Remote('http://127.0.0.1:4723/wd/hub', desired_caps)
sleep(20)
ret = driver.page_source
print ret
#点击淘宝首页搜索
driver.find_element_by_id("com.taobao.taobao:id/home_searchedit").click()
sleep(2)
#点击搜索
driver.find_element_by_id("com.taobao.taobao:id/searchEdit").click()
sleep(2)
#模拟输入搜索关键字
driver.find_element_by_id("com.taobao.taobao:id/searchEdit").send_keys(u"搜索的名称")
sleep(2)
#点击搜索
driver.find_element_by_id("com.taobao.taobao:id/searchbtn").click()
