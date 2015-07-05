/***
 * 文件使用规范：
 * 1，可编辑区域必须在“#edit_area”内部
 * 2，可编辑的区域必须使用“msgs”中的key包含，然后各属性对应数组值
 * 3，编辑项的单项必须在“.edit_area_item”内部，该选项只存在与教育和工作经历可以使用，也就是数组“have_edit_area_item_clazz”内部的样式
 * 4，编辑的最小单位内容才可使用“contenteditable”属性，里面所有内容都已p标签段落
 * 5，不分段元素请使用p或者span等元素包含；如果分段请使用div包含p元素分段，切勿将文字放于非标签包含的情况，例如：<div>文章<p>内容</p></div>;
 */
/**chrome浏览器自带生成PDF非常完美*/
/**
 * $("body").html($("#edit_area").prop("outerHTML"));
 * window.print();
 */
/**
 * 使用指南：
 * 1，粘贴时使用纯文本
 */
// 后台参数信息
var msgs = {
	"base_title" : [
		"edit_self_title",
		"edit_want_title",
		"edit_edu_title",
		"edit_work_title",
		"edit_cart_title"
	],
	"edit_base" : [
		"edit_name",
		"edit_photo",
		"edit_gender",
		"edit_birthday",
		"edit_age",
		"edit_work_years",
		"edit_place_native",
		"edit_place_abode",
		"edit_mobile",
		"edit_phone",
		"edit_email",
		"edit_qq",
		"edit_id_number",
		"edit_height",
		"edit_politics_status",
		"edit_marital_status",
		"edit_want_job",
		"edit_self_assessment"
	],
	"edit_want" : [
		"edit_want_place",
		"edit_want_time",
		"edit_want_job",
		"edit_want_salary"
	],
	"edit_edu" : [
		"edit_edu_time",
		"edit_edu_school",
		"edit_edu_major",
		"edit_edu_background",
		"edit_edu_major_info",
		"edit_edu_awards"
	],
	"edit_work" : [
		"edit_work_time",
		"edit_work_company",
		"edit_work_department",
		"edit_work_position",
		"edit_work_introduce"
	],
	"edit_cart" : [
		"edit_cart_skill"
	],
	"edit_custom":[ //定制
        "edit_custom_title",
	    "edit_custom_content"
	],
	"edit_experdall":[
	    "edit_work_time",
	    "edit_work_company",
	    "edit_work_position",
	    "edit_work_introduce"
	],
	"edit_experball":[
	    "edit_work_time",
	    "edit_work_company",
	    "edit_work_position",
	    "edit_work_introduce"
	],
	"edit_experall":[
	     "edit_work_time",
	     "edit_work_company",
	     "edit_work_position",
	     "edit_work_introduce"
	],
	"edit_honor":[
	      "edit_honor_info"
	]
}

// 添加信息
var addmsgs = {
	"edit_work" : "",
	"edit_edu" : ""
}

// 头像剪切
var headcut = {
	x : null,
	y : null,
	whdth : null,
	height : null,
	originalw : null
}

/**
 * 样式解释：.edit_item：可编辑的一个区域，所有的改元素都不能添加margin-top属性
 * 样式解释：.edit_area：可编辑的一个区域
 * 样式解释：.edit_area_item：可编辑的一个区域里面的单项
 * 样式解释：.edit_area_items：可编辑的一个区域里面的多项
 */
var cut_image;
var pagenum = 1; // 当前页码
var editing = false; // 是否处于编辑状态
var openthemes = false; // 主题是否打开
var preview = false; // 是否是预览，预览不添加退出确定
var save_trigger; // 是否保存触发器
var now_id = ""; // 当前主题id
var now_clazz = ""; // 当前主题样式
var edit_head = "edit_"; // JSON去掉编辑头
var edit_area = "#edit_area"; // 编辑区域ID名称
var edit_area_item = ".edit_area_item"; // 编辑项的单项，该选项只存在与教育和工作经历
var have_edit_area_item_clazz = ["edit_edu", "edit_work", "edit_custom", "edit_experdall", "edit_experball", "edit_experall"]; // 编辑项的单项，该选项只存在与教育和工作经历
var page ="#page"; //整个简历页面
var guideindex = 0; //引导步骤
var resume_bank_id = 0; //resumeBankId，数据通用后，选择不同主题时，判断是否需要换页的标志

$(document).ready(function(){
	if($.browser.msie) {
		addArrayIndexOf();
		var browserPrompt = true;
		if(localStorage && localStorage.hideBrowserPrompt && localStorage.hideBrowserPrompt == "true")
			browserPrompt = false;
		if(browserPrompt)
			$(".browserPrompt").show();
	}
	$('.box_bottom').mouseover(function(){
		$('.zxbj').stop().show()
	});
	$('.box_bottom').mouseout(function(){
		$('.zxbj').stop().hide()
	});
	$(document).scroll(function(){
		var scrollTop = $(this).scrollTop();
		if(scrollTop < 90) {
			$(".box_t").stop().animate({'top':'90'}, 200);
		} else {
			$(".box_t").stop().animate({'top':'0'}, 200);
		}
	});
	$('.browserPrompt .close').click(function(){
		$('.browserPrompt').stop().slideUp(500);
		if(localStorage)
			localStorage.hideBrowserPrompt = "true";
	})
	// 选择主题
	$(".m-zxbjzt .ztitem ul li").live("click", function(){
		var $this = $(this);
		var id = $this.attr("data-id");
		var clazz = $this.attr("data-class");
		var bankid = $this.attr("data-bankid");
		if(resume_bank_id != bankid){ // 换页
			set_save_status(true);
			$.ajax({type : "post", async : false, url : wbdcnf.base + "/editresume/edit.jhtml", data : {"json":getSubmsg(),"id":id}, success : function(data) { // 保存
				if(data == 0)
					alert("文本中存在乱码，未保存成功！");
				else
					window.location.href = wbdcnf.base + "/editresume/resume/" + bankid + ".jhtml?itemid=" + id + "&page=" + pagenum; // 跳页
			}});
		} else {
			setStyle(id, clazz);
			checkPageSize();
		}
		$(".m-zxbjzt .ztitem ul li.current").removeClass("current");
		$this.addClass("current");
	});
	// 保存
	$("#editing_save").click(function(e){
		$.post(wbdcnf.base + "/editresume/edit.jhtml", {"json" : getSubmsg(), "id" : now_id}, function(data) {
			if(data == 0) {
				alert("文本中存在乱码，未保存成功！");
				return false;
			}
			set_save_status(true);
			notice("保存成功！");
			$("#editing_down").attr("href", wbdcnf.base + "/editresume/export/" + now_id + ".jhtml");
		});
		return true;
	});
	// 导出按钮
	$("#editing_down").click(function(e){
		if(!checkChange()){//修改的比率
			return false;
		}
		$.ajax({type : "post", async : false, url : wbdcnf.base + "/editresume/edit.jhtml", data : {"json" : getSubmsg(), "id" : now_id}, success : function(data) {
			if(data == 0) {
				alert("文本中存在乱码，未保存成功！");
				return false;
			}
			set_save_status(true);
			notice("保存成功！");
			window.location.href = wbdcnf.base + "/editresume/export/" + now_id + ".jhtml";
		}});
		return true;
	});
	// 覆盖删除
	$(".edit_item .delete").live("mouseover", function(){
		$(this).closest(".edit_area_item").css({"filter":"alpha(opacity=20)", "opacity":".2"});
	});
	// 离开删除
	$(".edit_item .delete").live("mouseleave", function(){
		$(this).closest(".edit_area_item").css({"filter":"alpha(opacity=100)", "opacity":"1"});
	});
	// 点击删除
	$(".edit_item .delete").live("click", function(e){
		var item = $(this).closest(".edit_area_item");
		item.remove();
		//移除自定义项
		var sortid = item.attr("data-sort");
		$(".m-jlmk_list").find("li span[data-id=" + sortid + "]").parent().remove();
		checkPageSize();
	});
	// 右侧快捷方式
	$(".m-jlmk_list li span").live("click", function(){
		var id = "#" + $(this).attr("data-id") + "div";
		if($(this).hasClass("noselect")){
			$(this).removeClass("noselect");
			$(id).removeClass("hidden");
			$(id).find("input[type='hidden']").val(true);
		} else {		
			$(this).addClass("noselect");
			$(id).addClass("hidden");
			$(id).find("input[type='hidden']").val(false);
		}
		checkPageSize();
	});
	// 开始编辑
	$(".edit_item").hover(function(e){
		editing = true;
	});
	// 删除提示
	$(".msg_tip").live("click", function(){
		$(this).remove();
	});
	// 检测
	$(edit_area).keydown(function(e){
		set_save_status(false);
		checkPageSize();
	});
	// 替换粘贴内容
	$("div[contenteditable]").live("keyup", function(e){
		if(e.ctrlKey && e.keyCode == 86) {
			var children = $(this).children();
			var children_p = $(this).contents().filter(function(){return this.nodeType === 3;}).text();
			if(children_p && children_p != "")
				children_p = "<p>" + children_p + "</p>";
			else
				children_p = "";
			for(var i = 0; i < children.length; i++){
				var obj = $(children.get(i));
				children_p += "<p>" + $("<div></div>").text(obj.text()).html() + "</p>";
			}
			$(this).html(children_p);
		}
		checkPageSize(); //粘贴之后提示
	}).live("blur", function(e){ // 右键粘贴
		var children = $(this).children();
		var children_p = $(this).contents().filter(function(){return this.nodeType === 3;}).text();
		if(children_p && children_p != "")
			children_p = "<p>" + children_p + "</p>";
		else
			children_p = "";
		for(var i = 0; i < children.length; i++){
			var obj = $(children.get(i));
			children_p += "<p>" + $("<div></div>").text(obj.text()).html() + "</p>";
		}
		$(this).html(children_p);
		checkPageSize(); //粘贴之后提示
	}).live("focus", function(){
		$(this).find(".msg_tip").remove();
	});
	// 头像设置
	$("#changehead").click(function(){
		$("#cut_image").attr("src")
		$(".preview_head img").attr("src", "");
		$(".msg_div").show();
		$("#image_cut").show();
	});
	// 上传文件
	$("#headfile").live("change", function(){
		var name = $(this).val();
		var fileName = name.substring(name.lastIndexOf("\\") + 1);
		var fileType = name.substring(name.lastIndexOf(".") + 1);
		if(fileType.toLocaleLowerCase() != "jpg" && fileType.toLocaleLowerCase() != "png") {
			alert("只支持jpg，png文件格式！");
			return;
		}
		if(!checkSize($(this)[0], true, 2))
			return;
		$("#cut_image").attr("src", wbdcnf.staticUrl + "/resources/500d/editresume/images/loading.gif");
		$(".msg_div").hide();
		$.ajaxFileUpload({
	        type: 'post',
	        secureuri : false,
	        dataType : 'content',
	        fileElementId : 'headfile',
	        url : wbdcnf.base + '/file/uploadedithead.jhtml',
	        data : {"token" : getCookie("token")},
	        success : function(data, status) {
	        	if(data == "error") {
	        		alert("修改失败！");
	        	} else if(data == "notlogin") {
	        		alert("上传头像请先登录！");
	        	} else if(data == "ntosuport") {
	        		alert("文件格式不支持！");
	        	} else {
	        		if($.browser.msie) {
	        			if(data.indexOf('<PRE>') >= 0) {
	        				data = data.substring(5);
	        				data = data.substring(0, data.length - 6);
	        			}
	        		}
	        		cutImg(wbdcnf.staticUrl + data);
	        	}
	        },
	        error: function (data, status, e) {
	            alert("发生错误" + e);
	        }
	    });
	});
	// 截取图片
	$("#image_cut_btn").click(function(){
		$.post(wbdcnf.base + "/file/cutedithead.jhtml", {x1 : headcut.x, y1 : headcut.y, width : headcut.width, height : headcut.height, originalw : headcut.originalw, cutwidth : cutimgmsg.width, cutheight : cutimgmsg.height, square : cutimgmsg.square}, function(data){
			if(data == "error") {
        		alert("修改失败！");
			} else if(data == "fileerror") {
				alert("图片文件错误，请重写选择图片！");
        	} else if(data == "notlogin") {
        		alert("上传头像请先登录！");
        	} else if(data == "notfoundfile") {
        		alert("文件不存在！");
        	} else {
        		$("#changehead").attr("src", wbdcnf.staticUrl + data);
        		setPhoto(data);
        	}
			closeCutImg();
		});
	});
	// 取消截取
	$("#image_cut_cancel").click(function(){
		closeCutImg();
	});
	$(".ztbtn, .replace_btn").live("click", function(){
		themes();
	});
	$(".hide_left").toggle(function(){
		var doc_width = $(document).width();
		var left_menu_widht = 240;
		$(".editresume_left").animate({'left':'0'}, 800);
		$(".editresume_right").animate({"marginLeft":left_menu_widht, "width":(doc_width - left_menu_widht)}, 800);
		$(".box_t").animate({"margin-left":"0.01px"},800);
		$('.hide_left span').css('background-position-x', '-20px');
	}, function(){
		$(".editresume_left").animate({'left':'-240px'}, 800);
		$(".editresume_right").animate({"marginLeft":0, "width":"100%"}, 800);
		$(".editresume_right").animate({'margin-left':'0px'}, 800);
		$(".box_t").animate({"margin-left":"0px"},800);
		$('.hide_left span').css('background-position-x', '0');
	});
	// 导入
	$("#import_resume").click(function(){
		$("#import_resume_box").show();
		$(".import_cancel").click(function(){
			$("#import_resume_box").hide();
		});
		$(".import_confirm").click(function(){
			$.ajaxFileUpload({
		        type: 'post',
		        secureuri : false,
		        dataType : 'content',
		        fileElementId : 'resumeFile',
		        url : wbdcnf.base + '/editresume/upload.jhtml',
		        data : {"token" : getCookie("token")},
		        success : function(data, status) {
		        	if(data == "error")
		        		alert("修改失败！");
		        	else if(data == "cantread")
		        		alert("解析不了该word，请使用word另存一份标准的doc/docx文档！");
		        	else
		        		location.reload();
		        },
		        error: function (data, status, e) {
		            alert("发生错误" + e);
		        }
		    });
		});
	});
	initFontUtils();
});
/**图表项*/
var graphItem = "";
var $editGraphItem = null;
// 图表操作
function initGraph(value) {
	this.graphItem = value;
	$('.graph_close').click(function(){
		$('.graph_bg').stop().hide(200);
	});
	$('.graph_add').click(function(){
		$editGraphItem = null;
		$('.graph_bg').stop().show(200);
	});
	$(".add_graph").click(function(){
		var nameObj = $(".graph_name");
		var valueObj = $(".graph_value");
		var name = nameObj.val();
		var value = valueObj.val();
		if(!(name && value && name != "" && value != "")) {
			alert("请填写内容！");
			return;
		}
		var graphItemObj = $(graphItem.replace(/\{name\}/g, name).replace(/\{value\}/g, value));
		if($editGraphItem) {
			$editGraphItem.html(graphItemObj.html());
			$editGraphItem = null;
		} else {
			$("#graph_content").append(graphItemObj);
		}
		nameObj.val("");
		valueObj.val("");
	});
	$(".graph_de").die().live("click", function(event){
		$(this).closest(".graph_item").remove();
		return false;
	});
	$(".graph_item").die().live("click", function(){
		$editGraphItem = $(this);
		var name = $editGraphItem.find(".name").attr("data");
		var value = $editGraphItem.find(".value").attr("data");
		$(".graph_name").val(name);
		$(".graph_value").val(value);
		$('.graph_bg').stop().show(200);
	});
}
//===============编辑===============//
// 显示隐藏主题
function themes(){
	if(openthemes) {
		$('.m-zxbjzt').animate({'bottom':'-300px'}, 800);
		$('.ztbtn i').css('background-position-y', '-20px');
	} else {
		$('.m-zxbjzt').animate({'bottom':'0px'}, 800);
		$('.ztbtn i').css('background-position-y', '0px');
	}
	openthemes = !openthemes;
}
// 关闭图片裁切
function closeCutImg() {
	if(cut_image)
		cut_image.imgAreaSelect({remove:true});
	$("#image_cut").hide();
	$("#cut_image").attr("src", "");
	$("#preview").remove();
}
// 设置保存状态：true：保存；false：未保存
function set_save_status(status) {
	if(save_trigger == undefined)
		save_trigger = !status;
	if(status && status != save_trigger) {
		save_trigger = status;
		$(window).unbind("beforeunload", not_save_notice);
	} else if(!status && status != save_trigger && !preview) {
		save_trigger = status;
		$(window).bind("beforeunload", not_save_notice);
	}
}
// 加载image剪切
var cutimgmsg = {
	width:120,
	height:160,
	square:false
}
// 设置是否正方形截取
function setSquare(square, radius){
	if(square) {
		cutimgmsg.square = true;
		if(radius)
			$("#image_cut .preview_head").css({"height":"120px","border-radius":"50%"});
		else
			$("#image_cut .preview_head").css({"height":"120px"});
	} else {
		cutimgmsg.square = false;
	}
}
function getCutPos(width, height) {
	var x1, y1, x2, y2;
	if(width / height > cutimgmsg.width / cutimgmsg.height) {
		var rwidth = Math.floor(height * cutimgmsg.width / cutimgmsg.height);
		var rheight = height;
		x1 = (width - rwidth) / 2;
		y1 = 0;
		x2 = x1 + rwidth;
		y2 = height;
	} else {
		var rwidth = width;
		var rheight = Math.floor(width * cutimgmsg.height / cutimgmsg.width);
		x1 = 0;
		y1 = (height - rheight) / 2;
		x2 = width;
		y2 = y1 + rheight;
	}
	return {"x1" : x1, "y1" : y1, "x2" : x2, "y2" : y2};
}
function cutImg(src) {
    $("#image_cut img").attr("src", src);
    $("#cut_image").load(function(){
    	$(".preview_head img").attr("src", src);
    	var rw = $("#cut_image").width();
    	var rh = $("#cut_image").height();
    	// 使用规定比例截取
//    	var bx1 = (rw - cutimgmsg.width) / 2;
//    	var by1 = (rh - cutimgmsg.height) / 2;
//    	var bx2 = bx1 + cutimgmsg.width;
//    	var by2 = by1 + cutimgmsg.height;
    	// 默认最大图片截取
    	var cutpos = getCutPos(rw, rh);
    	var bx1 = cutpos.x1;
    	var by1 = cutpos.y1;
    	var bx2 = cutpos.x2;
    	var by2 = cutpos.y2;
    	cut_image = $("#cut_image").imgAreaSelect({
    		maxWidth : 300,
    		maxHeight : 300,
    		handles : true,
    		show : true,
    		x1 : bx1,
    		y1 : by1,
    		x2 : bx2,
    		y2 : by2,
    		aspectRatio : cutimgmsg.width + ":" + cutimgmsg.height,
    		onInit : function(img, selection){
    			headcut.x = selection.x1;
    			headcut.y = selection.y1;
    			headcut.width = selection.width;
    			headcut.height = selection.height;
    			headcut.originalw = rw;
    			var scaleX = cutimgmsg.width / (selection.width || 1);
    			var scaleY = cutimgmsg.height / (selection.height || 1);
    			$(".preview_head img").css({
    				width : Math.round(scaleX * rw) + 'px',
    				height : Math.round(scaleY * rh) + 'px',
    				marginLeft : '-' + Math.round(scaleX * selection.x1) + 'px',
    				marginTop : '-' + Math.round(scaleY * selection.y1) + 'px'
    			});
    		},
    		onSelectChange : function(img, selection) {
    			headcut.x = selection.x1;
    			headcut.y = selection.y1;
    			headcut.width = selection.width;
    			headcut.height = selection.height;
    			headcut.originalw = rw;
    			var scaleX = cutimgmsg.width / (selection.width || 1);
    			var scaleY = cutimgmsg.height / (selection.height || 1);
    			$(".preview_head img").css({
    				width : Math.round(scaleX * rw) + 'px',
    				height : Math.round(scaleY * rh) + 'px',
    				marginLeft : '-' + Math.round(scaleX * selection.x1) + 'px',
    				marginTop : '-' + Math.round(scaleY * selection.y1) + 'px'
    			});
    		}
    	});
    	$("#cut_image").unbind("load");
    });
}
// 未保存设置
function not_save_notice(event) {
	return "你有修改内容没有保存，确定要离开吗？";
}
// 设置主题
function setStyle(id, clazz) {
	$(page).removeClass(now_clazz).addClass(clazz).animate();
	now_id = id;
	now_clazz = clazz;
}
// 初始化主题
function setNowClazz(id, clazz, bank_id) {
	now_id = id;
	now_clazz = clazz;
	resume_bank_id = bank_id;
}
// 获取排序
function getSort(obj) {
	var sort = [];
	var i = 0;
	$("#base_content .edit_item").each(function(index){
		var title = $(this).attr("data-sort");
		var id = $(this).attr("id");
		if(title.indexOf(edit_head) == 0)
			title = title.substring(edit_head.length);
		if($(this).hasClass("hidden")){
			obj[id] = false;			
		}else{
			obj[id] = true;
			sort[i++] = title; // 显示的才加入排序
		}
	});
	obj["exchange"]= sort.join("-");
}
// 获取提交信息
function getSubmsg() {
	var jsonMsg = {};
	for(var clazz in msgs)
		jsonMsg[getKey(clazz)] = getMsg(clazz);
	getSort(jsonMsg);
	getGraph(jsonMsg);
	//=======================================//
	return JSON.stringify(jsonMsg);
}
// 页面检查
var page_default_h = 1555; // A4的高度
var head_height = 40; // 默认页头空的距离
var end_height = 60; // 默认页尾空的距离
var split_height = 10; // 10px的分页边距
function getPageHeight(page) { // 获取页面高度
	return page * page_default_h - split_height - end_height;
}
function checkPageSize() {
	var pagesize = 1; // 页数
	var nowHeight = 0; // 现在高度
	var marginTop = 0; // 距离顶部
	var topHeight = $(edit_area).offset().top;
	$(".distraction").css("marginTop", "0px").removeClass("distraction"); // 不设置为初始值，ie浏览器
	$("#base_content").children().each(function(index, children){
		children = $(children);
		if(!children.is(":hidden")) {
			nowHeight = children.offset().top - topHeight;
			if((nowHeight + children.outerHeight(true)) > getPageHeight(pagesize)) {
				var dtHeight = children.find("dt").outerHeight(true);
				if((nowHeight + dtHeight) > getPageHeight(pagesize)) {
					marginTop = (page_default_h + split_height) * pagesize - nowHeight + head_height;
					children.find("dt").closest(".edit_item").addClass("distraction").css("marginTop", marginTop + "px");
					pagesize++;
				}
				
				var ddOuterHeight = 0;
				if(children.find("dd").length)
					ddOuterHeight = children.find("dd").offset().top - children.offset().top;
				
				if(children.find(".edit_area_item").length) {
					children.find(".edit_area_item").each(function(indexx, editItem){
						editItem = $(editItem);
						nowHeight = editItem.offset().top - topHeight;
						if((nowHeight + editItem.outerHeight(true)) > getPageHeight(pagesize)) {
							if((nowHeight + editItem.find(".msg_title").eq(0).outerHeight(true)) > getPageHeight(pagesize)) {
								marginTop = (page_default_h + split_height) * pagesize - nowHeight + head_height;
								editItem.addClass("distraction").css("marginTop", marginTop + "px");
								pagesize++;
							}
							editItem.find("div[contenteditable]").find("p").each(function(indexx, pchildren){
								pchildren = $(pchildren);
								nowHeight = pchildren.offset().top - topHeight;
								pHeight = pchildren.outerHeight(true);
								if(nowHeight + pHeight > getPageHeight(pagesize)) {
									marginTop = (page_default_h + split_height) * pagesize - nowHeight + head_height;
									pchildren.addClass("distraction").css("marginTop", marginTop + "px");
									pagesize++;
								}
							});
						}
					});
				} else {
					children.find("div[contenteditable]").find("p").each(function(indexx, pchildren){
						pchildren = $(pchildren);
						nowHeight = pchildren.offset().top - topHeight;
						pHeight = pchildren.outerHeight(true);
						if(nowHeight + pHeight > getPageHeight(pagesize)) {
							marginTop = (page_default_h + split_height) * pagesize - nowHeight + head_height;
							pchildren.addClass("distraction").css("marginTop", marginTop + "px");
							pagesize++;
						}
					});
				}
			}
		}
	});
	$(page).height(Math.ceil($(edit_area).height() / (page_default_h + split_height)) * (page_default_h + split_height));
}
/***图表操作**/
var graphMessage = {"isGraph" : false, "graphName" : null};
function setGraph(graphName) {
	graphMessage.isGraph = true;
	graphMessage.graphName = graphName;
}
/***/
function getGraph(jsonMsg) {
	if(graphMessage.isGraph) {
		var graphObj = new Object();
		graphObj["graphName"] = graphMessage.graphName;
		var graphData = new Array();
		$("#graph_content li").each(function(index, ele){
			var name = $(ele).find(".name").attr("data");
			var value = $(ele).find(".value").attr("data");
			if(name && value)
				graphData[graphData.length] = {"name" : name, "value" : value};
		});
		graphObj["data"] = graphData;
		jsonMsg["graph"] = graphObj;
	}
}
// 判断内容修改度
function checkChange(){
	var baseMsg = {"base_title":{"self_title":"自我评价","want_title":"","edu_title":"教育背景","work_title":"工作经历","cart_title":"技能证书"},"base":{"name":"五百丁","photo":"/resources/500d/editresume/images/default_head.png","gender":"","birthday":"","age":"24岁","work_years":"","place_native":"","place_abode":"广东省广州市","mobile":"13888888888","phone":"","email":"service@500d.me","qq":"","id_number":"","height":"","politics_status":"","marital_status":"","want_job":"求职目标：五百丁市场专员","self_assessment":"本人是市场营销专业毕业生，有丰富的营销知识体系做基础；对于市场营销方面的前沿和动向有一定的了解，善于分析和吸取经验熟悉网络推广，尤其是社会化媒体方面，有独到的见解和经验个性开朗，容易相处，团队荣誉感强"},"want":{"want_place":"","want_time":"","want_job":"求职目标：五百丁市场专员","want_salary":""},"edu":[{"edu_time":"2008.09-2012.07","edu_school":"五百丁科技大学","edu_major":"市场营销","edu_background":"","edu_major_info":"主修课程\n基本会计、统计学、市场营销、国际市场营销、市场调查与预测、商业心理学、广告学、公共关系学、货币银行学、经济法、国际贸易、大学英语、经济数学、计算机应用等。","edu_awards":""}],"work":[{"work_time":"2013.10至今","work_company":"卓望信息科技有限公司","work_department":"","work_position":"营运推广主管","work_introduce":"1、负责社会化媒体营销团队的搭建工作，制定相关运营策略和指标，带领团队实施计划；\n2、网站常态运营活动规划和推进执行\n3、相关数据报告和统计，为公司决策层提供决策依据\n4、轻量级产品和应用的策划，统筹产品、技术团队成员实施。\n工作成果\n社会化媒体账号总共涨粉67万（包含QQ空间，人人网，新浪微博，腾讯微博）日均互动量相比接手前提升1000%，评论转发量级达到百千级"},{"work_time":"2012.08-2013.09","work_company":"广州灵心沙文化活动有限公司","work_department":"","work_position":"市场推广专员","work_introduce":"1、网络推广渠道搭建维护，包括QQ空间、微博、豆瓣等；\n2、负责软硬广投放，网络舆情监控，公关稿撰写，事件营销策划；\n3、标书制作和撰写，甲方沟通工作。"}],"cart":{"cart_skill":"CET-6，优秀的听说写能力\n计算机二级，熟悉计算机各项操作\n高级营销员，国家职业资格四级"},"exchange":"work_title-edu_title-cart_title-self_title"};
	var jsonMsg = eval("(" + getSubmsg() + ")");
	
	var name = jsonMsg['base']['name'];
	if(!name || name == '五百丁' || name == '') {
		alert("你的姓名没有填写，建议填写后再导出。");
		return false;
	}
	
	var age = jsonMsg['base']['age'];
	if(!age || age == ''){
		alert("你的年龄没有填写，建议填写后再导出。");
		return false;
	}
	
	var mobile = jsonMsg['base']['mobile'];
	if(!mobile || mobile == '13888888888' || mobile == ''){
		alert("你的手机没有填写，建议填写后再导出。");
		return false;
	}
	
	var email = jsonMsg['base']['email'];
	if(!email || email == 'service@500d.me' || email == ''){
		alert("你的邮箱没有填写，建议填写后再导出。");
		return false;
	}
	
	var b_n = navigator.appName;
	var b_v = null;
	if(navigator.appVersion) {
		var b_vs = navigator.appVersion.split(";");
		if(b_vs.length > 1 && b_vs[1])
			b_v = b_vs[1].replace(/[ ]/g, "");
	}
	var check = false;
	if(b_n && b_v && b_n == "Microsoft Internet Explorer" && (b_v == "MSIE6.0" || b_v == "MSIE7.0" || b_v == "MSIE8.0")) {
		check = true;
	}
	if(compareArray(baseMsg['edu'], jsonMsg['edu'], ["edu_school"], ["edu_time", "edu_major"]))
		check = true;
	if(compareArray(baseMsg['work'], jsonMsg['work'], [], ["work_time", "work_company", "work_position"]))
		check = true;
	if(compareArray(baseMsg['experball'], jsonMsg['experball'], [], ["work_time", "work_company"]))
		check = true;
	if(compareArray(baseMsg['experdall'], jsonMsg['experdall'], [], ["work_time", "work_company"]))
		check = true;
	if(!check) {
		alert("请完善你的简历信息，教育背景、工作经历、校外实践或项目经历中至少填写一项。");
		return false;
	}

	return true;
}

/**
 * 对比两个数组
 * 参数：旧对象，新对象，对比notequalkeys（不相等）, notemptykeys(不为空)
 * true:修改
 * false:未修改
 */
function compareArray(oObjs, nObjs, notequalkeys, notemptykeys) {
	if(!oObjs && !nObjs)
		return false;
	if(oObjs && !nObjs)
		return false;
	if(oObjs && oObjs.length == nObjs.length) {
		if(nObjs.length == 0)
			return false;
		for(var index in nObjs) {
			if(compareObject(oObjs[index], nObjs[index], notequalkeys, notemptykeys))
				return true;
		}
	} else {
		if(nObjs.length == 0)
			return false;
		for(var index in nObjs) {
			if(compareObject(null, nObjs[index], notequalkeys, notemptykeys))
				return true;
		}
	}
	return false;
}
function compareObject(oObj, nObj, notequalkeys, notemptykeys) {
	if(!oObj && !nObj)
		return false;
	if(oObj && !nObj)
		return false;
	if(!notequalkeys || !notemptykeys) {
		return false;
	} else {
		if(notequalkeys.length != 0) {
			for(var index in notequalkeys) {
				var key = notequalkeys[index];
				var nVal = nObj[key];
				var oVal = "";
				if(oObj && oObj[key])
					oVal = oObj[key];
				if(!nVal || nVal == oVal)
					return false;
			}
		}
		if(notemptykeys.length != 0) {
			for(var index in notemptykeys) {
				var key = notemptykeys[index];
				var nVal = nObj[key];
				if(!nVal || nVal == "")
					return false;
			}
		}
		return true;
	}
}
/**
 * 获取信息
 * @param clazz 获取的区域样式选择器
 * @returns 用户填写的信息
 */
function getMsg(clazz) {
	var isArr = have_edit_area_item_clazz.indexOf(clazz) != -1;
	var returnArr = [];
	var returnJson = {};
	var selectObj = $("." + clazz);
	if(clazz == "edit_custom"){ //自定义项，需要增加标题
		$(page).find("div.edit_custom").each(function(index, element){
			var isShow = $(element).find("input[type='hidden']").val();
			returnJson["isShow"] = isShow;
			var custom_title = $(element).find("input[type='text']").val();
			returnJson["custom_title"] = custom_title;
			var custom_content = getItem($(element).find("div.edit_custom_content"));
			returnJson["custom_content"] = custom_content;
			var id = $(element).attr("data-sort");
			returnJson["id"] = id;
			returnArr.push(returnJson);
			returnJson = {};
		});
	} else {
		selectObj.each(function(){
			if(isArr) {
				selectObj.find(edit_area_item).each(function(){
					for(var i = 0; i < msgs[clazz].length; i++) {
						var msgs_value = getItem($(this).find("." + msgs[clazz][i]));
						if(typeof(msgs_value) == "undefined")
							msgs_value = "";
						returnJson[getKey(msgs[clazz][i])] = msgs_value;
					}
					returnArr.push(returnJson);
					returnJson = {};
				});
			} else {
				for(var i = 0; i < msgs[clazz].length; i++) {
					var msgs_value = getItem(selectObj.find("." + msgs[clazz][i]));
					if(typeof(msgs_value) == "undefined")
						msgs_value = "";
					returnJson[getKey(msgs[clazz][i])] = msgs_value;
				}
			}
		});
	}
	if(isArr)
		return returnArr;
	else
		return returnJson;
}
/**
 * 获取JSON的KEY，去掉edit_
 */
function getKey(key) {
	if(key.indexOf(edit_head) == 0)
		key = key.substring(edit_head.length);
	return key;
}
/**
 * 开始换行
 * @param obj 对象
 */
function getItem(obj) {	
	var itemmsg = "";
	if(obj.find("input:first-child").length == 1){
		itemmsg = obj.find("input:first-child").val();
	} else if(obj.length > 1) { // 如果是多个
		$(obj).each(function(){
			itemmsg += getItem($(this)) + "\n";
		});
	} else if(obj.children(":not(.msg_tip)").length == 0) { // 去除提示框
		itemmsg = obj.text().replace(/\t/g, "");
	} else { // 多个子元素分行
		$(obj.children()).each(function(){
			if($(this).children().length == 0) {
				if($(this).text().replace(/\n/g, "") == "")
					itemmsg += "\n";
				else
					itemmsg += $(this).text().replace(/\n/g, "") + "\n";
			} else if($(this).children()[0].tagName == "BR")//回车和填充时，为兼容谷歌浏览器，会在<p></p>之间加入<br/>
				itemmsg += this.textContent + "\n";
			else
				itemmsg += getItem($(this)) + "\n";
		});
	}
	if(itemmsg != null && itemmsg.length >= 1 && itemmsg.substring(itemmsg.length - 1) == "\n") {
		itemmsg = itemmsg.substring(0, itemmsg.length - 1);
	}
	return itemmsg;
}
/**
 * 设置头像
 * @param value 头像地址
 */
function setPhoto(value) {
	$(".edit_photo").text(value);
}
/**
 * 字体工具栏
 */
function initFontUtils(){
	$("#fontBar").change(function(){
		var fontSize = $(this).val();
		setFontSize(fontSize);
	});
}
/**
 * 设置字体大小
 */
function setFontSize(size) {
	if(!size)
		return;
	$.get(wbdcnf.base + "/editresume/fontsize.jhtml", {"size" : size}, function(result){
		if(result) {
			$(".base_style .base_content .msg_title").css("font-size", size + "pt");
			$("div[contenteditable] p").css("font-size", size + "pt");
		}
	});
}
//=====================设置系统信息===========================//
/**
 * 提示
 */
function notice(msg) {
	$(".notice_tip").each(function(){
		$(this).text(msg).fadeIn(400, function(){
			var notice_tip = $(this);
			setTimeout(function(){
				notice_tip.fadeOut(400);
			}, 1200);
		});
	});
}
/**
 * 错误提示
 */
function error(msg) {
	$(".notice_tip").css("background", "#f66000").each(function(){
		$(this).text(msg).fadeIn(400, function(){
			var notice_tip = $(this);
			setTimeout(function(){
				notice_tip.fadeOut(400);
			}, 1200);
		});
	});
}
/**
 * IE7和IE8不支持IndexOf方法
 */
function addArrayIndexOf() {
	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function(elt /*, from*/) {
			var len = this.length >>> 0;
			var from = Number(arguments[1]) || 0;
			from = (from < 0) ? Math.ceil(from) : Math.floor(from);
			if (from < 0)
				from += len;
			for (; from < len; from++) {
				if (from in this && this[from] === elt)
					return from;
			}
			return -1;
		};
	}
}
/**
 * 设置添加信息
 * @param obj 添加信息
 */
function setAddmsgs(obj) {
	addmsgs = obj;
}
/**使用提示**/
function guide(){
	var url;
	if(guideindex == 0){
		url = $("#guideimg").attr("src").replace("guide", "guide1");
	}else if(guideindex == 1){
		$("#guideimg").parent().parent().hide();
		$.ajax({type : "get", async : false, url : wbdcnf.base + "/editresume/guidecookie.jhtml", data : {}, success : function(data) {
		}});
	}
	$("#guideimg").attr("src", url);
	guideindex++;
}
/**直接给可以编辑的元素加上edit_border，避免编辑时出现文字移位，先填完信息，再添加边框，减少对之前功能的修改**/	
function addEdit_border(){
	$(msgs["edit_base"]).each(function(index, value){
		$(page).find("." + value).each(function(){
			$(this).addClass("edit_border");
		});
	});
	$(msgs["edit_want"]).each(function(index, value){
		$(page).find("." + value).each(function(){
			$(this).addClass("edit_border");
		});
	});
	$(msgs["edit_edu"]).each(function(index, value){
		$(page).find("." + value).each(function(){
			$(this).addClass("edit_border");
		});
	});
	$(msgs["edit_work"]).each(function(index, value){
		$(page).find("." + value).each(function(){
			$(this).addClass("edit_border");
		});
	});
	$(msgs["edit_cart"]).each(function(index, value){
		$(page).find("." + value).each(function(){
			$(this).addClass("edit_border");
		});
	});
	$(msgs["edit_honor"]).each(function(index, value){
		$(page).find("." + value).each(function(){
			$(this).addClass("edit_border");
		});
	});
}
//移位、增加、删减项
function itemChange(obj){
	var key = $(obj).attr("data-key");
	if(key == "add") { // 添加
		var addkey = $(obj).attr("data-id");
		$(obj).closest(".edit_item").find(".edit_area_items").append(addmsgs[addkey]);
	}
	if(key == "up") { // 添加
		var this_item = $(obj).closest(".edit_item");
		var this_prev = this_item.prevAll(".edit_item:not(.hidden)");
		if(this_prev.length >= 1)
			this_prev.eq(0).before(this_item);
	}
	if(key == "down") { // 添加
		var this_item = $(obj).closest(".edit_item");
		var this_next = this_item.nextAll(".edit_item:not(.hidden)");
		if(this_next.length >= 1)
			this_next.eq(0).after(this_item);
	}
	checkPageSize();
}
//替换换行
function replaceBr(isIE, html){
	html ="<p>" + html.replace(new RegExp("<br />", "gm"), "</p><p>") + "</p>";						
	return html;
}
function guid() {
    var guid = "";
    for (var i = 1; i <= 32; i++){
      var n = Math.floor(Math.random() * 16.0).toString(16);
      guid += n;
      if(i == 8 || i == 12 || i == 16 || i == 20)
        guid += "";
    }
    return guid;    
}