// ==UserScript==
// @name         视频解析器显示播放列表
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  为你的视频解析页面增加播放列表，无需再回原网页找链接，目前已支持爱奇艺电视剧
// @author       欧阳鹏
// @match        *://*/*url=http*iqiyi.com*
// @match        *://*/*url=http*youku.com*
// @match        *://*/*url=http*mgtv.com*
// @match        *://*/*url=http*v.qq.com*
// @require      https://cdn.staticfile.org/jquery/3.2.1/jquery.min.js
// @require      https://cdn.staticfile.org/blueimp-md5/2.19.0/js/md5.min.js
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==



(function () {
    'use strict';
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
        $('body').append(`<iframe style="position:fixed;top:0;right:0;width:300px;height:400px;margin:10px;border-radius:10px;color:white;overflow:hidden;" class="apee_play_list" id="apee_play_list" name="apee_play_list" frameborder="0" allowtransparency="true"></iframe>`)

        var html = `<!DOCTYPE html>
        <html lang="zh-CN">
        
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <style>
                /* body {
                    background-color: rgb(148, 51, 51);
                } */
        
                * {
                    user-select: none;
                    -moz-user-select: none;
                    -webkit-user-select: none;
                }
        
                .play_list_box {
                    position: fixed;
                    top: 0;
                    right: 0;
                    height: calc(100% - 20px);
                    margin: 10px;
                    background-color: rgba(0, 0, 0, 0.8);
                    border-radius: 10px;
                    color: white;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
        
                .play_list_box .nav {
                    display: flex;
                    padding: 15px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
                }
        
                .play_list_box .nav .title {
                    margin-right: auto;
                }
        
                .play_list_box .nav .close {
                    cursor: pointer;
                    text-align: center;
                }
        
                .play_list_box .play_list {
                    flex: 1;
                    padding: 10px;
                    overflow: auto;
                }
        
                .play_list_box .play_list .content {
                    display: flex;
                    flex-wrap: wrap;
                }
        
                .play_list_box .play_list::-webkit-scrollbar-thumb {
                    background: rgba(69, 157, 245, .24);
                    border-radius: 3px;
                    height: 100px;
                }
        
                .play_list_box .play_list::-webkit-scrollbar {
                    width: 10px;
                    background: rgba(255, 255, 255, 0.1);
                }
        
                .play_list_box .play_list .item {
                    padding: 10px;
                    border: 1px solid white;
                    border-radius: 10px;
                    margin-bottom: 10px;
                    flex: 30px;
                    cursor: pointer;
                    text-align: center;
                    margin: 5px;
                    transition: all .2s;
                }
        
                .play_list_box .play_list .item:hover {
                    background-color: rgba(255, 255, 255, 0.3);
                }
        
                .play_list_box .play_list .item.active {
                    background-color: white;
                    color: black;
                }
        
                .footer {
                    text-align: center;
                    padding: 10px;
                    border-top: 1px solid rgba(255, 255, 255, 0.3);
                    color: rgba(255, 255, 255, 0.3);
                }
        
                .show_tab {
                    position: fixed;
                    top: 0;
                    right: 0;
                    margin: 10px;
                    padding: 10px;
                    border-radius: 10px;
                    background-color: rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    display: none;
                }
            </style>
        </head>
        
        <body>
            <div class="play_list_box">
                <div class="nav">
                    <div class="title">播放列表</div>
                    <div class="close" onclick="closeTab()">关闭</div>
                </div>
                <div class="play_list">
                    <div class="content">
                        <!-- list -->
                    </div>
                </div>
                <div class="footer" onclick="window.open('https://apee.top')">
                    By APEE.TOP
                </div>
            </div>
            <div class="show_tab" onclick="showTab()">
                显示播放列表
            </div>
            <script>
                var play_list_box = document.querySelector('.play_list_box')
                var show_tab = document.querySelector('.show_tab')
                var play_list = document.querySelector('.play_list')
                function closeTab() {
                    play_list_box.style.display = 'none'
                    show_tab.style.display = 'block'
                }
                function showTab() {
                    show_tab.style.display = 'none'
                    play_list_box.style.display = 'flex'
                }
            </script>
        </body>
        
        </html>`

        var list_html = ''
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
                var play_url = location.href.replace(/(.*?\?.*url=)http.*?(&.*?)?$/, '$1' + v_url + '$2')
                list_html += `<div class="item ${url.search(v_url) != -1 ? 'active' : ''}" onclick="top.location.href='${play_url}'">${play_list[i].album_order}</div>`
            }
        }
        html = html.replace('<!-- list -->', list_html)
        var iframe = window.frames['apee_play_list']
        iframe.document.open()
        iframe.document.write(html)
        iframe.document.close()
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
                if (data.data.template.template_id == 'album_template') {
                    var play_list = data.data.template.pure_data.selector_bk
                    for (var i = 0; i < play_list.length; i++) {
                        if (typeof play_list[i].videos == 'object' && play_list[i].videos.feature_paged != 'undefined') {
                            play_list = play_list[i].videos.feature_paged
                            break
                        }
                    }
                    var keys = Object.keys(play_list)
                    var list = []
                    for (var i = 0; i < keys.length; i++) {
                        var item = play_list[keys[i]]
                        for (var j = 0; j < item.length; j++) {
                            list.push(item[j])
                        }
                    }
                    load_play_list(list, 'iqiyi')
                }
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
