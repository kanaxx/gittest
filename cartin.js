void((function(f){
    if(window.jQuery && jQuery().jquery > '3.2') {
        console.log('use jquery');
      f(jQuery);
    }else{
        console.log('load jquery');
      var script = document.createElement('script');
      script.src = '//code.jquery.com/jquery-3.2.1.min.js';
      script.onload = function(){
        var $ = jQuery.noConflict(true);
        f($);
      };
      document.body.appendChild(script);
    }
  })(
    function($,undefined){
        interval_second=0.1;
        max = 100;
        result = 0;
        ng_list =[];

        console.log('jquery version is %s', $.fn.jquery);

        if( $('div#__all_into_cart').length<=0 ){
            $('div#landingBox').prepend(
                '<div id="__all_into_cart">'+
                '<div style="display:inline-block">かごに入れるカタログコード<br><textarea rows="15" id="__all_into_cart_list"></textarea></div>'+
                '<div style="display:inline-block">かごに入らなかったカタログコード<br><textarea rows="15" id="__all_into_err_list"></textarea></div>'+
                '<div style="display:inline-block">ページ内のカタログコード<br><span id="__all_into_cart_num"></span></div>'+
                '</div>');

            catalog_id_list = findCatalogCode();
            console.log(catalog_id_list);
            s = catalog_id_list.join("\n");

            $('textarea#__all_into_cart_list').val(s);
            $('span#__all_into_cart_num').text(catalog_id_list.length);
            
            alert('ページ内に' + catalog_id_list.length + '個のカタログIDが見つかりました');
            
            return;
        }else{
            list_text = $('textarea#__all_into_cart_list').val();
            list = list_text.split(/\n/);
            list = list.filter(function (x, i, self) {
                if(x.trim()==''){
                    return false;
                }
                return self.indexOf(x) === i;
            });
            api_list=[];
            for(i=0; i<list.length; i++){

            }

            var df0 = $.Deferred();
            var dfi = df0.then( function(){ 
                console.log('df0 break!');
                return wait(0.5);
            });
            for( var i=0; i<list.length && i<max;i++){
                dfi = dfi
                .then(function(){
                    return wait(interval_second);
                })
                .then( 
                    function(cnt){
                        return function(){
                            //return $.when( registerCart(catalog_id_list[cnt],1,1), wait(interval_second));
                            console.log('%s/%s',cnt,list.length);
                            return registerCart(list[cnt],1,1);
                        }
                    }(i)
                )
                ;
            }
            dfi.then(function(){
                console.log('Finish');
                s = ng_list.join("\n");
                $('textarea#__all_into_err_list').val(s);
                alert( result +'個の商品をかごにいれました。');
            });

            console.log('main thread is finished');
            df0.resolve();
        }

        function findCatalogCode(){
            var ans = [];

            link = $('div#landingBox a[href^="/product/"]');
            link.each(function(a,b){ 
                href=$(b).attr('href');
                //console.log(href);
                if( href.match(/\/product\/([0-9a-zA-Z]*)/ )){
                    ans.push(RegExp.$1);
                }
            });
            
            //console.log(ans);
            ans = ans.filter(function (x, i, self) {
                return self.indexOf(x) === i;
            });
            //console.log(ans);
            return ans;
        }
    
        function registerCart(e, a, t) {
            console.log('call add cart [%s]', e);
            var d = $.Deferred();

            $.ajax({
                url: 'https://lohaco.jp/tpc/top/apiRegistCart/',
                type: "POST",
                dataType: "xml",
                data: "ctgItemCd=" + encodeURI(e) + "&qty=" + encodeURI(a),
            }).done(function (response, textStatus, jqXHR) {
                result++;
                console.log('done add cart [%s]', e);
                d.resolve(e);
            }).fail(function (jqXHR, textStatus, errorThrown) {
                console.log('fail add cart [%s]', e);
                ng_list.push(e);
                d.resolve(e);
            });
            return d.promise();
        }
        function wait(sec) {
            // console.log('wait %s second', sec);
            var d = $.Deferred();
            setTimeout(function() {
                // console.log('waited %s second', sec);
                d.resolve(sec);
            }, sec * 1000);
            // console.log('return wait method', sec);
            return d.promise();
        }
    }
))
