(function(){
    /**
     * 上传文件示例
     * @type {HTMLElement}
     */
    var filelistNode = document.getElementById('filelist')
    var bucketName = "bucket4jssdk";
    var ks3Options = {
        KSSAccessKeyId: "S1guCl0KF/pEoT6TKTR1",
        policy: "",
        signature: "",
        bucket_name: bucketName,
        key: '${filename}',
        acl: "public-read",
        uploadDomain: "http://kssws.ks-cdn.com/" + bucketName,
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
        },
        onFilesAddedCallBack: function(uploader, objArray){ // objArray是等待上传的文件对象的数组
            for (var i = 0 ; i < objArray.length ; i++){
                var itemNode = document.createElement("li");
                itemNode.innerHTML = objArray[i].name + "<span style='margin:5px 20px;'></span><a></a>";;
                itemNode.id = objArray[i].id;
                filelistNode.appendChild(itemNode);
            }
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
        var bucketName = "chenjin";
        var url = 'http://' + bucketName + '.kss.ksyun.com';  //元数据获取不要走cdn
        url = addURLParam(url, listObjectParams);

        xhr.onreadystatechange = function() {
            if (xhr.readyState==4) {
                if(xhr.status >=200 && xhr.status < 300 || xhr.status ==304){
                    //xml转为json格式方便js读取
                    document.getElementById('responsexml').innerHTML = JSON.stringify(xmlToJson(xhr.responseXML),null, 4);
                }else{
                    alert('Request was unsuccessful: ' + xhr.status);
                }
            }
        };
        //在金山云存储控制台(ks3.ksyun.com)中的”空间设置"页面需要设置对应空间(bucket)的CORS配置，允许请求来源(Allow Origin: * )和请求头(Allow Header: * )的GET请求,否则浏览器会报跨域错误
        xhr.open('GET',url,true);
        xhr.send(null);
    };

})();
