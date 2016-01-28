(function(){
    /**
     * 上传文件示例
     * @type {HTMLElement}
     */
    var Constants = {
        AK: "S1guCl0KF/pEoT6TKTR1",   //replace with your AK
        UPLOAD_HTTP_URL: "http://kss.ksyun.com/",
        UPLOAD_HTTPS_URL: "https://kss.ksyun.com/"    //杭州region 其他region的域名参见：http://ks3.ksyun.com/doc/api/index.html
    };

    var SK = 'your secret key'; //注意：不安全，如果前端计算signature，请确保不会泄露SK

    var filelistNode = document.getElementById('filelist')
    var bucketName = "bucket4jssdk";

    //如果bucket不是公开读写的，需要先鉴权，即提供policy和signature表单
    var policy = {
        "expiration": "2016-02-02T12:00:00.000Z",
        "conditions": [
            ["eq","$bucket", bucketName],
            ["starts-with", "$key", ""],
            ["starts-with","$acl", "public-read"],
            ["starts-with", "$name", ""]   //表单中传了name字段，也需要加到policy中
        ]
    };
    //policy stringify再经过BASE64加密后的字符串（utf8编码格式）
    var stringToSign = Ks3.Base64.encode(JSON.stringify(policy));

    //建议从后端sdk获取signature签名  算法为：Signature = Base64(HMAC-SHA1(YourSecretKey, stringToSign ) );
    var signatureFromPolicy = b64_hmac_sha1(SK, stringToSign);
    console.log(signatureFromPolicy);


    var ks3UploadUrl;
    //支持https 上传
    if (window.location.protocol === 'https:') {
        ks3UploadUrl = Constants['UPLOAD_HTTPS_URL'];
    } else {
        ks3UploadUrl = Constants['UPLOAD_HTTP_URL'];
    }

    var ks3Options = {
        KSSAccessKeyId: Constants['AK'],
        policy: stringToSign,
        signature: signatureFromPolicy,
        bucket_name: bucketName,
        key: '${filename}',
        acl: "public-read",
        uploadDomain: ks3UploadUrl + bucketName,
        autoStart: false,
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
                var url = ks3UploadUrl + bucketName + '/' + obj.name + '?adp';
                var kssHeaders = {
                    'kss-async-process': 'tag=imgWaterMark&type=2&dissolve=65&gravity=NorthEast&text=6YeR5bGx5LqR&font=5b6u6L2v6ZuF6buR&fill=I2JmMTcxNw==&fontsize=500&dy=10&dx=20|tag=saveas&bucket=' + bucketName + '&object=imgWaterMark-' + obj.name,
                    'kss-notifyurl': 'http://10.4.2.38:19090/'
                };
                var signature = generateToken(SK, bucketName, obj.name, 'PUT', kssHeaders);
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        if(xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
                            alert("put请求成功");
                            var waterMarkImgLink = document.createElement('a');
                            waterMarkImgLink.setAttribute('target','_blank');
                            waterMarkImgLink.style.marginLeft = "30px";
                            waterMarkImgLink.innerHTML = "imgWaterMark-" + obj.name;

                            //一分钟后的时间戳
                            var  timeStampIn60Second = new Date((new Date()).valueOf() + 1000*60).valueOf();
                            setTimeout(function(){ //异步任务，等1秒再看处理结果
                                waterMarkImgLink.href = ks3UploadUrl + bucketName + '/imgWaterMark-' + obj.name + '?KSSAccessKeyId=' +  encodeURIComponent(Constants['AK']) + '&Expires=' + timeStampIn60Second + '&Signature=' + encodeURIComponent(signature);
                                itemNode.appendChild(waterMarkImgLink);
                            },1000);

                        }else{
                            alert('Request was unsuccessful: ' + xhr.status);
                        }
                    }
                };

                xhr.open("put", url, true);

                xhr.setRequestHeader('Authorization','KSS ' + Constants['AK'] + ':' + signature );
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
        var xhr = new XMLHttpRequest();
        var listObjectParams = {
            delimiter: null, //分隔符，用于对一组参数进行分割的字符。
            'encoding-type': null, //指明请求KS3与KS3响应使用的编码方式。
            marker:  null , //指定列举指定空间中对象的起始位置。KS3按照字母排序方式返回结果，将从给定的 marker 开始返回列表。如果相应内容中IsTruncated为true，则可以使用返回的Contents中的最后一个key作为下次list的marker参数
            'max-keys':'10', //设置响应体中返回的最大记录数（最后实际返回可能小于该值）。默认为1000。如果你想要的结果在1000条以后，你可以设定 marker 的值来调整起始位置。
            prefix: null //限定响应结果列表使用的前缀
        };
        var bucketName = "bucket4jssdk";
        var url = 'http://' + bucketName + '.kss.ksyun.com';  //元数据获取不要走cdn
        url = Ks3.addURLParam(url, listObjectParams);

        xhr.onreadystatechange = function() {
            if (xhr.readyState==4) {
                if(xhr.status >=200 && xhr.status < 300 || xhr.status ==304){
                    //xml转为json格式方便js读取
                    document.getElementById('responsexml').innerHTML = JSON.stringify(Ks3.xmlToJson(xhr.responseXML),null, 4);
                }else{
                    alert('Request was unsuccessful: ' + xhr.status);
                }
            }
        };
        //在金山云存储控制台(ks3.ksyun.com)中的”空间设置"页面需要设置对应空间(bucket)的CORS配置，允许请求来源(Allow Origin: * )和请求头(Allow Header: * )的GET请求,否则浏览器会报跨域错误
        xhr.open('GET',url,true);
        xhr.send(null);
    };


    /**
     *  PUT Object 上传触发处理示例(上传图片增加水印）
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
        var bucketName = "bucket4jssdk";
        var url = 'http://127.0.0.1:3000/' + bucketName ;
        var kssHeaders = {
            'kss-async-process': 'tag=imgWaterMark&type=2&dissolve=65&gravity=NorthEast&text=6YeR5bGx5LqR&font=5b6u6L2v6ZuF6buR&fill=I2JmMTcxNw==&fontsize=500&dy=10&dx=20|tag=saveas&bucket=' + bucketName + '&object=imgWaterMark-' + objKey,
            'kss-notifyurl': 'http://10.4.2.38:19090/'
        };

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if(xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
                    alert("上传触发处理成功");
                    var waterMarkImg = document.getElementById('display-adp-result').firstChild;

                    //一分钟后的时间戳
                    var  timeStampIn60Second = new Date((new Date()).valueOf() + 1000*60).valueOf();
                    waterMarkImg.src = 'http://kss.ksyun.com/' + bucketName + '/imgWaterMark-' + objKey + '?KSSAccessKeyId=' +  encodeURIComponent(Constants['AK']) + '&Expires=' + timeStampIn60Second + '&Signature=' + encodeURIComponent(xhr.responseText);
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

        xhr.setRequestHeader('Authorization','KSS ' + Constants['AK'] );
        xhr.setRequestHeader('kss-async-process', kssHeaders['kss-async-process']);
        xhr.setRequestHeader('kss-notifyurl',kssHeaders['kss-notifyurl']); //替换成您接收异步处理任务完成通知的url地址
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
        var formData = new FormData();
        var objKey = imgFile.name;
        formData.append("file", imgFile);
        var bucketName = "bucket4jssdk";
        var url = 'http://'+ bucketName + '.kss.ksyun.com/' + objKey;
        var kssHeaders = {
            'kss-async-process': 'tag=imgWaterMark&type=2&dissolve=65&gravity=NorthEast&text=6YeR5bGx5LqR&font=5b6u6L2v6ZuF6buR&fill=I2JmMTcxNw==&fontsize=500&dy=10&dx=20|tag=saveas&bucket=' + bucketName + '&object=imgWaterMark-' + objKey,
            'kss-notifyurl': 'http://10.4.2.38:19090/'
        };
        var signature = '';

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if(xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
                    alert("上传触发处理成功");
                    var waterMarkImg = document.getElementById('display-adp-result2').firstChild;
                    //一分钟后的时间戳
                    var  timeStampIn60Second = new Date((new Date()).valueOf() + 1000*60).valueOf();
                    setTimeout(function(){
                        //异步任务，等两秒
                        waterMarkImg.src = 'http://kss.ksyun.com/' + bucketName + '/imgWaterMark-' + objKey + '?KSSAccessKeyId=' +  encodeURIComponent(Constants['AK']) + '&Expires=' + timeStampIn60Second + '&Signature=' + encodeURIComponent(signature);
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

        signature = generateToken(SK, bucketName, objKey, 'PUT', kssHeaders);

        xhr.setRequestHeader('Authorization','KSS ' + Constants['AK'] + ':' + signature );
        xhr.setRequestHeader('kss-async-process', kssHeaders['kss-async-process']);
        xhr.setRequestHeader('kss-notifyurl',kssHeaders['kss-notifyurl']); //替换成您接收异步处理任务完成通知的url地址
        xhr.send(formData);
    };



})();
