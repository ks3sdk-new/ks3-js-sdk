(function(){
    //选择符API   note: suite for IE 9+
    var $ = document.querySelectorAll.bind(document);
    //事件监听
    Element.prototype.on = Element.prototype.addEventListener;
    //在NodeList对象上通过forEach部署监听函数
    NodeList.prototype.on = function (event, fn) {
        // this 为 NodeList
        [].forEach.call(this, function (el) {
            el.on(event, fn);
        });
        return this;
    };

    /**
     * 上传文件示例
     * @type {HTMLElement}
     */

    Ks3.config.AK = 'YOB+XnjUoALcD0nFASOP';  //TODO： 请替换为您的AK
    Ks3.config.SK = 'your secret key'; //注意：不安全，如果前端计算signature，请确保不会泄露SK
    Ks3.config.SK = '0c8JNIOjSJnvNGyd+khIDOKn63OV+oELowAHdzpR';
    Ks3.config.region = 'HANGZHOU'; //TODO: 需要设置bucket所在region的endpoint， 如杭州region： HANGZHOU, 全部region参见：http://ks3.ksyun.com/doc/api/index.html
    Ks3.config.bucket = 'chenjin3';  // TODO : 设置默认bucket name

    var filelistNode = document.getElementById('filelist');
    var bucketName = "chenjin3";   //TODO: 请替换为您需要上传文件的bucket名称

    /*
     *  如果bucket不是公开读写的，需要先鉴权，即提供policy和signature表单
     *  policy的conditions中需要指明请求体的form中用户添加的字段
     */
    var policy = {
        "expiration": new Date(getExpires(3600)*1000).toISOString(), //一小时后
        "conditions": [
            ["eq","$bucket", bucketName],
            ["starts-with", "$key", ""],
            ["starts-with","$acl", "public-read"],
            ["starts-with", "$name", ""],   //表单中传了name字段，也需要加到policy中
            ["starts-with", "$x-kss-meta-cache-control",""],  //必须只包含小写字符
            ["starts-with", "$Cache-Control",""]
        ]
    };
    //policy stringify再经过BASE64加密后的字符串（utf8编码格式）
    var stringToSign = Ks3.Base64.encode(JSON.stringify(policy));

    //建议从后端sdk获取signature签名  算法为：Signature = Base64(HMAC-SHA1(YourSecretKey, stringToSign ) );
    var signatureFromPolicy = Ks3.b64_hmac_sha1(Ks3.config.SK, stringToSign);
    console.log('signatureFromPolicy:' + signatureFromPolicy);


    var ks3UploadUrl;
    //支持https 上传
    if (window.location.protocol === 'https:') {
        Ks3.config.protocol = 'https';
    } else {
        Ks3.config.protocol = 'http';
    }
    ks3UploadUrl =  Ks3.config.protocol + '://' + Ks3.ENDPOINT[Ks3.config.region] + '/';

    var ks3Options = {
        KSSAccessKeyId: Ks3.config.AK,
        policy: stringToSign,
        signature: signatureFromPolicy,
        bucket_name: bucketName,
        key: '${filename}',
        acl: "public-read",
        uploadDomain: ks3UploadUrl  + bucketName,
        autoStart: false,
        'x-kss-meta-Cache-Control': 'max-age=60',
        'Cache-Control': 'max-age=60',
        onUploadProgressCallBack: function(uploader, obj){
            var itemNode = document.getElementById(obj.id);
            var resultNode = itemNode.querySelector('span');
            resultNode.innerHTML = obj.percent + "%";
        },
        onFileUploadedCallBack: function(uploader, obj){ //obj是当前上传的文件对象
            var itemNode = document.getElementById(obj.id);
            var resultNode = itemNode.querySelector('span');
            resultNode.innerHTML = "完成";
            //显示上传的文件的链接
            var linkNode = itemNode.querySelector('a');
            linkNode.href = ks3Options.uploadDomain + "/" + obj.name;
            linkNode.innerHTML = obj.name;

            //增加加水印按钮
            var adpBtn = document.createElement("button");
            adpBtn.innerHTML = '添加水印';
            adpBtn.onclick = function(){
                var url = ks3UploadUrl + bucketName + '/' + obj.name + '?adp' ;
                var kssHeaders = {
                    'kss-async-process': 'tag=imgWaterMark&type=2&dissolve=65&gravity=NorthEast&text=6YeR5bGx5LqR&font=5b6u6L2v6ZuF6buR&fill=I2JmMTcxNw==&fontsize=500&dy=10&dx=20|tag=saveas&bucket=' + bucketName + '&object=imgWaterMark-' + obj.name,
                    'kss-notifyurl': 'http://10.4.2.38:19090/'
                };
                var signature = Ks3.generateToken(Ks3.config.SK, bucketName, obj.name + '?adp', 'PUT','', kssHeaders, '');
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        if(xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
                            alert("put请求成功");
                            var waterMarkImgLink = document.createElement('a');
                            waterMarkImgLink.setAttribute('target','_blank');
                            waterMarkImgLink.style.marginLeft = "30px";
                            var processedImgName = "imgWaterMark-" + obj.name;
                            waterMarkImgLink.innerHTML = processedImgName;

                            //10分钟后的时间戳
                            var  timeStamp = getExpires(600);

                            //根据Expires过期时间戳计算外链signature
                            var expiresSignature = Ks3.generateToken(Ks3.config.SK, bucketName, processedImgName, 'GET', '' ,kssHeaders, timeStamp);
                            setTimeout(function(){ //异步任务，等1秒再看处理结果
                                waterMarkImgLink.href = ks3UploadUrl + bucketName + '/imgWaterMark-' + obj.name + '?KSSAccessKeyId=' +  encodeURIComponent(Ks3.config.AK) + '&Expires=' + timeStamp + '&Signature=' + encodeURIComponent(expiresSignature);
                                itemNode.appendChild(waterMarkImgLink);
                            },1000);

                        }else{
                            alert('Request was unsuccessful: ' + xhr.status);
                        }
                    }
                };

                xhr.open("put", url, true);

                xhr.setRequestHeader('Authorization','KSS ' + Ks3.config.AK + ':' + signature );
                xhr.setRequestHeader('kss-async-process', kssHeaders['kss-async-process']);
                xhr.setRequestHeader('kss-notifyurl',kssHeaders['kss-notifyurl']); //替换成您接收异步处理任务完成通知的url地址
                xhr.send(null);
            };
            itemNode.appendChild(adpBtn);

        },
        onFilesAddedCallBack: function(uploader, objArray){ // objArray是等待上传的文件对象的数组
            for (var i = 0 ; i < objArray.length ; i++){
                var itemNode = document.createElement("li");
                itemNode.innerHTML = objArray[i].name + "<span style='margin:5px 20px;'></span><a style='margin-right: 20px;' target='_blank'></a>";
                itemNode.id = objArray[i].id;
                filelistNode.appendChild(itemNode);
            }
        },
        onErrorCallBack: function(uploader, errObject){
            alert(errObject.code + " : Error happened in uploading " + errObject.file.name + " ( " + errObject.message + " )");
        }
    };

    var pluploadOptions = {
        browse_button: 'browse', //触发对话框的DOM元素自身或者其ID
        drop_element: document.body //指定了使用拖拽方式来选择上传文件时的拖拽区域，即可以把文件拖拽到这个区域的方式来选择文件。该参数的值可以为一个DOM元素的id,也可是DOM元素本身，还可以是一个包括多个DOM元素的数组。如果不设置该参数则拖拽上传功能不可用。目前只有html5上传方式才支持拖拽上传。
    }

    var tempUpload = new ks3FileUploader(ks3Options, pluploadOptions);

    document.getElementById('start-upload').onclick = function (){
    	console.log("start...");
        tempUpload.uploader.start();
    }



    /**
     * GET Bucket （List Objects)
     *  获取bucket（空间）中object（文件对象）示例
     *  参见：http://ks3.ksyun.com/doc/api/bucket/get.html
     */
    document.getElementById('get-bucket').onclick = function() {
        Ks3.listObject({
            'max-keys': 15
        },function(json) {
            document.getElementById('responsexml').innerHTML = JSON.stringify(json, null, 4);
        });

    };

    /**
     *  Delete Object
     *  删除指定文件
     */
    (function listObjects() {
        Ks3.listObject(
            {
                Bucket: 'chenjin3',
                'max-keys': 10
            },function(json) {
                /**
                 * 以表格展示bucket中的object
                 */
                var tableEle = document.getElementById('example5');
                var objectArray =  json['ListBucketResult']['Contents'];
                for(var i= 0, len = objectArray.length; i< len; i++) {
                    var item = document.createElement("tr");
                    var objKey = objectArray[i]['Key'];
                    item.id = objKey;
                    item.innerHTML = '<td>' + objKey + '</td><td>' + objectArray[i]['Size']/1024 + ' KB </td>' + '<td>' + new Date(objectArray[i]['LastModified']).toLocaleString() + '</td>' + '<td class="del-opt">删除</td>';
                    tableEle.appendChild(item);
                };
                $('.del-opt').on('click', function(e) {
                    var key = this.parentNode.firstChild.innerHTML;
                    Ks3.delObject(
                        {
                            Key: key
                        }, function(status) {
                            if( status === 204) {
                                alert( key + " 删除成功");
                                var ele = document.getElementById(key);
                                ele.parentNode.removeChild(ele);
                            }
                        });
                });
            });
    })();


    /**
     *  PUT Object 上传触发处理示例(上传图片增加水印,后端计算签名，转发请求到Ks3 API）
     *  参见：http://ks3.ksyun.com/doc/api/async/trigger.html
     *  注： 这里使用了FormData序列化表单中选取的文件，XMLHttpRequest 2级定义了FormData类型，
     *  支持的浏览器有Firefox 4+，Safari 5+，Chrome 和 Android 3+版的WebKit
     */

    document.getElementById('utp').onclick = function() {
        var imgFile = document.getElementById('imgFile').files[0]; //获取文件对象
        var formData = new FormData();
        var objKey = imgFile.name;
        formData.append("key", objKey);
        formData.append("file", imgFile);

        //10分钟后的时间戳，以秒为单位
        var  timeStamp = getExpires( 10 * 60 );

        var url = 'http://127.0.0.1:3000/' + bucketName + '?t=' + timeStamp ;
        var kssHeaders = {
            'kss-async-process': 'tag=imgWaterMark&type=2&dissolve=65&gravity=NorthEast&text=6YeR5bGx5LqR&font=5b6u6L2v6ZuF6buR&fill=I2JmMTcxNw==&fontsize=500&dy=10&dx=20|tag=saveas&bucket=' + bucketName + '&object=imgWaterMark-' + objKey,
            'kss-notifyurl': 'http://10.4.2.38:19090/',
            'x-kss-storage-class' : 'STANDARD'   // STANDARD | STANDARD_IA 即标准存储和低频访问存储（主要用于备份）
        };

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if(xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
                    alert("上传触发处理成功");
                    var waterMarkImg = document.getElementById('display-adp-result').firstChild;
                    console.log('Signature:' + xhr.responseText);

                    console.log('timestamp:' + timeStamp);
                    waterMarkImg.src = 'http://kss.ksyun.com/' + bucketName + '/imgWaterMark-' + objKey + '?KSSAccessKeyId=' +  encodeURIComponent(Ks3.config.AK) + '&Expires=' + timeStamp + '&Signature=' + encodeURIComponent(xhr.responseText);
                }else{
                    alert('Request was unsuccessful: ' + xhr.status);
                }
            }
        };

        function progressFunction(e) {
            var progressBar = document.getElementById("progressBar");
            if (e.lengthComputable) {
                progressBar.max = e.total;
                progressBar.value = e.loaded;
            }
        }
        xhr.upload.addEventListener("progress", progressFunction, false);
        xhr.open("put", url, true);

        //xhr.setRequestHeader('Content-Length',imgFile.size);

        xhr.setRequestHeader('Authorization','KSS ' + Ks3.config.AK );
        xhr.setRequestHeader('kss-async-process', kssHeaders['kss-async-process']);
        xhr.setRequestHeader('kss-notifyurl',kssHeaders['kss-notifyurl']); //替换成您接收异步处理任务完成通知的url地址
        xhr.setRequestHeader('x-kss-storage-class', kssHeaders['x-kss-storage-class']);
        xhr.send(formData);
    };

    /**
     *  PUT Object 上传触发处理示例2（不依赖与后端）
     *  前端计算signature，put请求直接到ks3 API
     *  注意：容易泄露SK, 建议只用于内部项目
     *
     */

    document.getElementById('utp2').onclick = function() {
        var imgFile = document.getElementById('imgFile2').files[0]; //获取文件对象
        var objKey = imgFile.name;
        var contentType = imgFile.type;
        //var url = 'http://'+ bucketName + '.kss.ksyun.com/' + objKey;

        var url = ks3UploadUrl + bucketName + '/' + objKey;
        var kssHeaders = {
            'kss-async-process': 'tag=imgWaterMark&type=2&dissolve=65&gravity=NorthEast&text=6YeR5bGx5LqR&font=5b6u6L2v6ZuF6buR&fill=I2JmMTcxNw==&fontsize=500&dy=10&dx=20|tag=saveas&bucket=' + bucketName + '&object=imgWaterMark-' + objKey,
            'kss-notifyurl': 'http://10.4.2.38:19090/',
            'x-kss-storage-class' : 'STANDARD'   // STANDARD | STANDARD_IA 即标准存储和低频访问存储（主要用于备份）
        };
        var signature = Ks3.generateToken(Ks3.config.SK, bucketName, objKey, 'PUT', contentType ,kssHeaders, '');
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if(xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
                    alert("上传触发处理成功");
                    var waterMarkImg = document.getElementById('display-adp-result2').firstChild;
                    //10分钟后的时间戳, s
                    var  timeStamp = getExpires(10 * 60);

                    //根据Expires过期时间戳计算外链signature
                    var expiresSignature = Ks3.generateToken(Ks3.config.SK, bucketName, 'imgWaterMark-' + objKey, 'GET', '' ,'', timeStamp);
                    setTimeout(function() {
                        //异步任务，等两秒
                        waterMarkImg.src = ks3UploadUrl + bucketName + '/imgWaterMark-' + objKey + '?KSSAccessKeyId=' +  encodeURIComponent(Ks3.config.AK) + '&Expires=' + timeStamp + '&Signature=' + encodeURIComponent(expiresSignature);
                    },2000);

                }else{
                    alert('Request was unsuccessful: ' + xhr.status);
                }
            }
        };

        function progressFunction(e) {
            var progressBar = document.getElementById("progressBar2");
            if (e.lengthComputable) {
                progressBar.max = e.total;
                progressBar.value = e.loaded;
            }
        }
        xhr.upload.addEventListener("progress", progressFunction, false);
        xhr.open("put", url, true);

        xhr.setRequestHeader('Authorization','KSS ' + Ks3.config.AK + ':' + signature );
        xhr.setRequestHeader('kss-async-process', kssHeaders['kss-async-process']);
        xhr.setRequestHeader('kss-notifyurl',kssHeaders['kss-notifyurl']); //替换成您接收异步处理任务完成通知的url地址
        xhr.setRequestHeader('x-kss-storage-class', 'STANDARD');
        xhr.send(imgFile);
    };
    
})();
