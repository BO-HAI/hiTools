### crossDomain: 跨域请求服务

    namespace: window.hi
    version: alpha 0.0.1

```javascript
var crossDomain = new window.hi.CrossDomain([$debug,] [$serverType]);
```

    @param: [$debug]{boolean} 用于切换API地址;

`settings`函数负责设置接口地址管理对象，他大概看起来是这样子的：

```javascript
{
	apiName1: {
		domain: '',
		testDomain: ''
	},
	apiName2: {
		domain: '',
		testDomain: ''
	}
};
```

配置接口管理对象

```javascript
crossDomain.settings({
	api: {
		domain: 'http://api.com/phpapi',
		testDomain: 'http://loaclhost:8080/phpapi'
	}
});
```

    @param: [$serverType] {String} 服务类型，默认：'normal'; 可选：'mvc'

如果你的服务是mvc架构，通过route来分配url,可以指定这个参数为“mvc”;

## CrossDomain提供的函数
#### 1.crossDomain.createFullUrl(projectName, interfaceName, data)

创建完整的API地址

    @param: projectName   {String}：项目名称
    @param: interfaceName {String}：接口路径
    @param: data          {Object}：请求参数（get, delete）
    @returns {String}

```javascript
var crossDomainMvc = new window.hi.crossDomain('mvc'),
    crossDomain = new window.hi.crossDomain(),
    url;

crossDomain.settings({
	api: {
		domain: 'http://api.com',
		testDomain: 'http://loaclhost:8080/phpapi'
	}
});

url = crossDomainMvc.createFullUrl('api', 'User', {name: '888wj', pwd: '1111'});

console.log(url); // http://api.com/User888wj/1111


url = crossDomain.createFullUrl('api', 'User', {name: '888wj', pwd: '1111'});

console.log(url); // http://api.com/User?name=888wj&pwd=1111
```


#### 2、crossDomain.getAsy(url, [data])
#### 3、crossDomain.postAsy(url, data)
#### 4、crossDomain.putAsy(url, data)
#### 5、crossDomain.delAsy(url, [data])


跨域请求


    @param: url {String}：请求地址
    @param: data {Object}：post & put 必选，提交数据键值对
    @returns {object} $Deferred.Promise


```javascript
function demo() {
    var loginPromise = crossDomain.postAsy(url, postData);
    loginPromise.done(function (result) {
        // 正确回调
    });
    loginPromise.fail(function (error) {
        // 请求异常处理
    });
};
```

#### 嵌套和依赖：按序执行

```javascript
// 第一次异步请求
loginPromise = crossDomain.postAsy(url, postData);

exitPromise = loginPromise.pipe(function (result) {
    // 第二次异步请求
    return server.getAsy(url);
});

exitPromise.done(function (result) {
    // 正确回调
});

exitPromise.fail(function (e) {
    // 请求异常处理
});
```

#### 嵌套和依赖：合并执行

```javascript
loginPromise = crossDomain.postAsy(login, postData);

userInfoPromise = loginPromise.pipe(function (data) {
    // 合并两个异步请求
    return $.when(server.getAsy(url1), server.getAsy(url2));
});

//当两个请求全部正确返回后
userInfoPromise.done(function (n, m) {
    console.info(n[0]);// result1
    console.info(m[0]);// result2
    //正常处理
});
```