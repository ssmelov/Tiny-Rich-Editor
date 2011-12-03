/*
 *	TinyRichEditor - jQuery plugin v.1.0.0
 *	Copyright 2011 Sergey Smelov
*/

(function($) {
	
	$.treditor = {
	
		defaults : {
			width:	500,
			height: 250,
			buttonbar: "bold italic strikethrough | unorderedlist orderedlist | alignleft aligncenter alignright | link image | source",
			bodyStyle: "margin:4px; font:10pt Arial,Verdana; cursor:text"
		},
		buttons :
		{
			bold : { name : "bold", title: "Bold", command: "bold", imgIndex : 0 },
			italic : { name: "italic", title: "Italic", command: "italic", imgIndex : 1 },
			strikethrough : { name: "strikethrough", title:"Strikethrough", command: "strikethrough", imgIndex : 2 },
			unorderedlist : { name : "unorderedlist", title: "Unordered list", command: "insertunorderedlist", imgIndex : 3 },
			orderedlist : { name: "orderedlist", title: "Ordered list", command: "insertorderedlist", imgIndex : 4 },
			alignleft : { name: "alignleft", title: "Align left", command: "justifyleft", imgIndex : 5 },
			aligncenter: { name: "aligncenter", title: "Align center", command: "justifycenter", imgIndex : 6},
			alignright : { name: "alignright", title: "Align right", command: "justifyright", imgIndex : 7 },
			link : { name: "link", title: "Hyperlink", command: "link", imgIndex : 10 },
			image : { name: "image", title: "Image", command: "image", imgIndex : 9 },
			source : { name: "source", title: "Show source", command: "source", imgIndex : 12 }
		}
	}
	
	$.fn.treditor = function(options) {
		
		return this.each(function(idx, elem) {
			if (elem.tagName == "TEXTAREA")
			{
				new treditor(elem, options);
			}			
		});		
	}
	
	///////////////////////
	//Private Variables	
	///////////////////////
	var isIE = $.browser.msie;
	
	
	///////////////////////
	//Constructor		
	///////////////////////
	treditor = function(textarea, options) {
	
		var editor = this;
		
		//merge defaults and options without modifying defaults
		editor.settings = $.extend({}, $.treditor.defaults, options);
		
		editor.disabled=false;
		
		//hide textarea
		editor.area = $(textarea)
						.hide()
						.blur(function() { 
							updateIFrame(editor);
						});
	
		//create main container
		editor.main = $("<div>").addClass("tre-main")
								.width(editor.settings.width)
								.height(editor.settings.height);
		
		//create button bar
		createButtonBar(editor);
		
		//create iframe
		createIFrame(editor);
	}
		
	/////////////////////
	//Event Handlers	
	/////////////////////
	function buttonClick(e) {
			
		var editor = this,
		    li = e.target,
			buttonName = $.data(li, 'buttonName'),
			button = $.treditor.buttons[buttonName];
		
		if (buttonName == "source") {
							
			if (editor.disabled)
			{				
				editor.disabled=false;
				editor.frame.css("display","block");
				editor.area.css("display","none");
				enableButtons(editor);											
				$(li).css('backgroundPosition', 12 * -24);
				$(li).removeAttr('title');
				$(li).attr('title', 'Show source');
			}
			else
			{
				editor.disabled=true;
				editor.frame.css("display","none");
				editor.area.css("display","block");
				disableButtons(editor);
				$(li).css('backgroundPosition', 13 * -24);
				$(li).removeAttr('title');
				$(li).attr('title', 'Show rich text');				
			}			
		}
		else if (!execCommand(editor, button.command, li))
			return false;

		focus(editor);
	}

	function hoverIn(e) {
		$(e.target).addClass("tre-hover");
	}
	
	function hoverOut(e) {
		$(e.target).removeClass("tre-hover");
	}

	//////////////////////
	//Private Functions
	//////////////////////
	
	function createButtonBar(editor) {
	
		//create the button-bar
		var buttonbar = editor.buttonbar = $("<div>").addClass("tre-button-bar").appendTo(editor.main);
		
		//add the first group to toolbar
		var ul = $("<ul></ul>").appendTo(buttonbar);
		
		//add buttons to the toolbar
		$.each(editor.settings.buttonbar.split(" "), function(idx, buttonName) {
		
			if (buttonName == "") return true;
		
			if (buttonName == "|")
			{
				$("<li>|</li>").addClass("tre-separator").appendTo(ul);
			}
			else
			{
				var button = $.treditor.buttons[buttonName];
				
				var li = $("<li>")
					.data("buttonName", button.name)
					.addClass('tre-button')
					.attr("title", button.title)
					.bind("click", $.proxy(buttonClick, editor))
					.hover(hoverIn, hoverOut)
					.appendTo(ul);
								
				//prepare button image
				li.css('backgroundPosition', button.imgIndex * -24);
				
			    if (isIE)
					li.attr("unselectable", "on");				
			}
		
		});
			
		editor.main.insertBefore(editor.area).append(editor.area);	
	};
		
	function createIFrame(editor) {
			
		if (editor.frame) 
			editor.frame.remove();
			
		editor.frame = $('<iframe id="tre-iframe" frameborder="0">').hide().appendTo(editor.main);	
		editor.doc = editor.frame[0].contentWindow.document;
		
		editor.doc.open();
		editor.doc.write('<html><head><body style="' + editor.settings.bodyStyle + '"></body></html>');
		editor.doc.close();
				
		//load content
		var code = editor.area.val();		
		code = code.replace(/<(?=\/?script)/ig, "&lt;");
		$(editor.doc.body).html(code);
		

		$(editor.frame[0].contentWindow)
					.blur( function() {
							updateTextArea(editor);
					});		
		
		editor.frame.show();
		
		var wid = editor.main.width();	
		editor.buttonbar.height(25);
		editor.frame.width(wid).height(200);
		editor.area.width(wid).height(200);

		try {
			if (isIE) editor.doc.body.contentEditable = true;
			else editor.doc.designMode = 'on';
		}
		catch(e) {
		}
		
	}
	
	function execCommand(editor, command, button) {	
		return editor.doc.execCommand(command, 0, null);				
	}
		
	function enableButtons(editor) {
		
		$.each(editor.buttonbar.find(".tre-button"), function(idx, elem) {
						
			var button = $.treditor.buttons[$.data(elem, "buttonName")];
			
			if (button.name != "source") {					
				$(elem).removeClass("tre-disabled");			
				$(elem).removeAttr("disabled");		
				$(elem).hover(hoverIn, hoverOut)
			}				
		});	
	}
	
	function disableButtons(editor) {
		
		$.each(editor.buttonbar.find(".tre-button"), function(idx, elem) {
						
			var button = $.treditor.buttons[$.data(elem, "buttonName")];
			
			if (button.name !="source") {			
				$(elem).addClass("tre-disabled");
				$(elem).attr("disabled", "disabled");
				$(elem).unbind('mouseenter mouseleave');
			}
		});
	}
	
	function updateTextArea(editor) {
		
		var html = $(editor.doc.body).html();					
		editor.area.val(html);		
	}
	
	function updateIFrame(editor) {
	
		var html = editor.area.val();		
		//html = html.replace();
		$(editor.doc.body).html(html);	
	}
	
	function focus(editor) {
		
		if (editor.disabled) editor.area.focus();
			else editor.frame[0].contentWindow.focus();      

	}
		
}) (jQuery);