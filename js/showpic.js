/**
 * Created by Administrator on 2017/2/25.
 */
function previewImage(file,id){
    var width=200;
    var height=200;
    var div=$("#"+id);
    div.html("");   //每一次更改图片内容都先设为空，就不会看到图片的xianshe

    //预览图片
    var reader=new FileReader();
    reader.onload=function(evt){
        div.html('<img src="'+evt.target.result+'" id="img" width="'+width+'"'+'height="'+height+'" />' );
    };
    reader.readAsDataURL(file.files[0]);
}