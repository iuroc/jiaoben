// ==UserScript==
// @name         视频解析器显示播放列表
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *://*/*url=http*iqiyi.com*
// @match        *://*/*url=http*youku.com*
// @match        *://*/*url=http*mgtv.com*
// @match        *://*/*url=http*v.qq.com*
// @require      https://cdn.staticfile.org/jquery/3.2.1/jquery.min.js
// @require      https://cdn.staticfile.org/blueimp-md5/2.19.0/js/md5.min.js
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_xmlhttpRequest
// ==/UserScript==



(function () {
    // iframe加载时不执行脚本
    if (self != top) {
        return
    }

    var url = getQueryVariable('url')
    var video_from = get_video_from(url)
    if (video_from == 'iqiyi') {
        load_from_iqiyi(url)
    }
    if (!url) {
        return
    }
    function load_play_list(play_list, video_from) {
        var html = ''
        if (video_from == 'iqiyi') {
            play_list.sort((a, b) => {
                return a.album_order - b.album_order
            })
            for (var i = 0; i < play_list.length; i++) {
                if (!play_list[i].page_url) {
                    // 预告片待处理
                    continue
                }
                var v_url = play_list[i].page_url.replace(/^http(.*)$/, 'https$1')
                if (v_url == url) {
                    var hh = 'background-color:white;color:black;'
                } else {
                    var hh = 'color:white;'
                }
                var play_url = location.href.replace(/(.*?\?.*url=)http.*?(&.*?)?$/, '$1' + v_url + '$2')
                html += `<div style="${hh}text-align:center;height:unset;width:30%;padding:15px;margin-left:5px;margin-right:5px;margin-bottom:10px;border:1px solid white;border-radius:5px;flex: 40px;cursor:pointer;" onclick="location.href='${play_url}'">${play_list[i].album_order}</div>`
            }
        }
        out_html = `<div class="play_list_box" style="color:white;position:fixed;top:10px;right:10px;width:320px;max-height:400px;overflow-y:auto;overflow-x:hidden;padding-left:10px;padding-right:10px;padding-bottom:10px;">
                        <div class="nav" style="height:unset;padding:15px;position:sticky;top:0;font-size:20px;margin:0;background:black;">播放列表
                        <span style="cursor:pointer;font-size:16px;" onclick="document.querySelector('.play_list_box').style.display='none'">（关闭，刷新可显示）</span>
                        </div>
                        <div class="play_list" style="display:flex;flex-wrap:wrap;">${html}</div>
                    </div>`
        $('body').append(out_html)
        window.addEventListener('keydown', function (event) {
            console.log(event.keyCode)
        })
    }

    /**
     * 爱奇艺解析
     * @param {string} url 视频链接
     */
    function load_from_iqiyi(url) {
        $.get(url, function (data) {
            var entity_id = data.match(/"tvId":(\w+)/)[1]
            var sign = md5(`app_version=3.0.0&auth_cookie=&device_id=apee&entity_id=${entity_id}&src=pcw_tvg&timestamp=0&user_id=&vip_status=0&vip_type=&secret_key=howcuteitis`).toUpperCase()
            var url_2 = `https://mesh.if.iqiyi.com/tvg/pcw/base_info?entity_id=${entity_id}&timestamp=0&src=pcw_tvg&vip_status=0&vip_type=&auth_cookie=&device_id=apee&user_id=&app_version=3.0.0&sign=${sign}`
            $.get(url_2, function (data) {
                var play_list = data.data.template.pure_data.selector_bk[1].videos.feature_paged
                var keys = Object.keys(play_list)
                var list = []
                for (var i = 0; i < keys.length; i++) {
                    var item = play_list[keys[i]]
                    for (var j = 0; j < item.length; j++) {
                        list.push(item[j])
                    }
                }
                load_play_list(list, 'iqiyi')
            })
        })
    }
    /**
     * 判断视频来源 爱奇艺 腾讯 芒果 优酷
     * @param {string} url 视频连接
     */
    function get_video_from(url) {
        var keys = ['iqiyi.com', 'v.qq.com', 'mgtv.com', 'youku.com']
        var names = ['iqiyi', 'qq', 'mgtv', 'youku']
        var url_data = new URL(url)
        for (var i = 0; i < keys.length; i++) {
            if (url_data.hostname.search(keys[i]) != -1) {
                return names[i]
            }
        }
        return false
    }

    /**
     * 获取GET参数内容
     * @param {string} variable GET参数
     * @returns 参数内容
     */
    function getQueryVariable(variable) {
        var query = window.location.search.substring(1)
        var vars = query.split("&")
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=')
            if (pair[0] == variable) {
                return pair[1]
            }
        }
        return false
    }
}())
