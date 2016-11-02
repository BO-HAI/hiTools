/**
 * @file: 跨域Ajax POST 请求服务
 * @author: bohai (bohai@100.com).
 * @date: 16/11/1
 */

(function (window, document, undefined) {
    var CrossDomain;

    /**
     *
     * @param $debug      {Boolean=} 调试状态,默认：false
     * @param $serverType {String=}  类型,默认：'normal',; 'mvc'
     * @constructor
     */
    CrossDomain = function ($debug, $serverType) {
        this.debug = false;
        this.serverType = 'normal';

        if (arguments.length === 1 && typeof arguments[0] === 'boolean') {
            debug = arguments[0];
        }

        if (arguments.length === 1 && typeof arguments[0] === 'string') {
            serverType = arguments[0];
        }

        if (arguments.length > 1) {
            debug = arguments[0];
            serverType = arguments[1];
        }

        this.getDebug = function () {
            return debug;
        };

        this.getServerType = function () {
            return serverType;
        };

        this.config = this.getConfig();
    };

    CrossDomain.prototype.getConfig = function () {
        if (!window.EduConfig) {
            return {
                project: {}
            };
        }

        if (!window.EduConfig.server) {
            return {
                project: {}
            };
        }

        return window.EduConfig.server;
    };

    /**
     * 函数描述：api GET 请求，异步函数
     *
     * @param  {string} url
     * @param  {object} data 参数对象
     * @return {object} Promise
     */
    CrossDomain.prototype.getAsy = function (url, data) {

        if (!data) {
            data = {};
        }

        return $.ajax({
            type: 'GET',
            data: data,
            url: url,
            dataType: "jsonp",
            jsonp: "callback",
            jsonpcallback: "?"
        });
    };

    /**
     * 函数描述：api POST 请求，异步函数
     *
     * @param  {string} url
     * @param  {object} data 参数对象
     * @return {object} Promise
     */
    CrossDomain.prototype.postAsy = function (url, data) {
        var that = this, r,
            deferred = $.Deferred(),
            req = {},
            container = $('#webApiRequestContainer'),
            iframe = $('#webApiRequestIframe'),
            form = $('#webApiRequestForm'),
            callbackUrl = EduConfig ? EduConfig.server.callbackUrl : '/callback.html';


        if (arguments.length === 0) {
            return 'post方法参数错误';
        }

        if (typeof arguments[0] !== 'string') {
            return '参数1错误，非string类型。';
        }

        if (typeof arguments[0] === 'string') {
            req.url = arguments[0];
        }

        if (typeof arguments[1] === 'object') {
            req.postdata = arguments[1];
        }

        //IE浏览器
        if (!!window.ActiveXObject) {
            document.charset = 'UTF-8';
        }
        if (container.length === 0) {

            container = $('<div style="display:none;" id="webApiRequestContainer"></div>');

            iframe = $('<iframe style="width:0;height:0" id="webApiRequestIframe" name="webApiRequestIframe"></iframe>');

            form = $('<form id="webApiRequestForm" method="post" target="webApiRequestIframe"  accept-charset="' + req.charset + '"></form>');

            container.append(iframe).append(form).appendTo($('body'));
        }
        form.attr('action', req.url +
            (req.url.indexOf('?') > 0 ? '&' : '?') + 'r=' + callbackUrl);

        form.html('');

        for (r in req.postdata) {
            if (req.postdata.hasOwnProperty(r)) {
                form.append($('<input type="hidden" name="' +
                    r + '" value="' + req.postdata[r] + '" />'));
            }
        }
        form.submit();
        iframe.unbind("load").load(function () {
            var url, obj;

            /**
             * 函数描述：获取URL参数
             *
             * @param  {string} url
             * @private
             * @return {object} Object
             */
            function getQueryStringObj(url) {
                var search = url.slice(url.indexOf('?') + 1),
                    result = {},
                    queryString = search || location.search.slice(1),
                    re = /([^&=]+)=([^&]*)/g,
                    m;

                while ((m = re.exec(queryString)) !== null) {
                    result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
                }
                return result;
            }

            try {
                url = this.contentWindow.location.href;
                obj = getQueryStringObj(url);

                deferred.resolve(obj);
            } catch (e) {

                deferred.reject(e);
            }
        });

        return deferred.promise();
    };

    /**
     * 函数描述：api PUT 请求，异步函数
     *
     * @param  {string} url
     * @param  {object} data 参数对象
     * @return {object} Promise
     */
    CrossDomain.prototype.putAsy = function (url, data) {
        var that = this;

        if (arguments.length < 2) {
            //console.log("参数错误;");
            return null;
        }
        if (typeof arguments[0] !== "string") {
            //console.log("参数1类型错误;");
            return null;
        }
        if (typeof arguments[1] !== "object") {
            //console.log("参数2类型错误;");
            return null;
        }
        url = url + (url.indexOf("?") > 0 ? "&" : "?") + "m=put";
        return that.postAsy(url, data);
    };

    /**
     * 函数描述：api DELETE 请求，异步函数
     *
     * @param  {string} url
     * @param  {object} data 参数对象
     * @return {object} Promise
     */
    CrossDomain.prototype.delAsy = function (url, data) {
        var that = this;
        url = url + (url.indexOf("?") > 0 ? "&" : "?") + "m=delete";
        if (arguments.length < 2) {
            //console.log("参数错误;");
            return null;
        }
        if (typeof arguments[0] !== "string") {
            //console.log("参数1类型错误;");
            return null;
        }
        return that.getAsy(url, data);
    };

    /**
     * 函数描述：创建API地址
     *
     * @param projectName   {String}  项目名称
     * @param interfaceName {String}  接口名称
     * @param data          {Object=} 参数对象
     * @returns {String}
     */
    CrossDomain.prototype.createFullUrl = function (projectName, interfaceName, data) {
        var that = this,
            config = that.getConfig(),
            urlType = that.getServerType(),
            urlData = {},
            chars,
            key,
            url,
            domain;

        //if (typeof arguments[arguments.length - 1] === 'string') {
        //    urlType = arguments[arguments.length - 1];
        //}

        if (typeof arguments[2] === 'object') {
            urlData = arguments[2];
        }


        // 判断是否调试状态
        if (!that.getDebug() && (projectName in config.project)) {
            domain = config.project[projectName].domain;
        } else if (projectName in config.project) {
            domain = config.project[projectName].testDomain;
        }

        if (interfaceName.substr(0, 1) !== '/') {
            interfaceName = '/' + interfaceName;
        }

        // 如果项目名不存在，直接使用projectName当作域名；即：可以传入一个完整域名
        if (projectName in config.project) {
            url = domain + interfaceName;
        } else {
            projectName = projectName.substr(projectName.length - 1) === '/' ?
                projectName.substr(0, projectName.length - 1) : projectName;
            url = projectName + interfaceName;
        }


        if (!urlData) {
            return url;
        }

        if (urlType === 'normal') {
            chars = interfaceName.indexOf('?') > -1 ? '&' : '?';
        } else if (urlType === 'mvc') {
            chars = interfaceName.substring(interfaceName.length - 1) === '/' ? '' : '/';
        }


        url += chars;

        for (key in urlData) {

            if (urlData.hasOwnProperty(key)) {

                //url += urlType === 'normal' ?
                //    key + '=' + urlData[key] + '&' :
                //    urlData[key] + '/';

                if (urlType === 'normal') {
                    url += key + '=' + urlData[key] + '&';
                }

                if (urlType === 'mvc') {
                    url += urlData[key] + '/';
                }
            }
        }

        url = url.substr(0, url.length - 1);
        return url;
    };

    window.hi = window.hi || {};

    window.hi.CrossDomain = CrossDomain;

}(window, document, undefined));