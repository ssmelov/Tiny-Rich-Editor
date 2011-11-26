/*
 *	TinyRichEditor - jQuery plugin v.1.0.0
 *	Copyright 2011 Sergey Smelov
*/

(function($) {
	
	$.treditor = {
	
		defaults : {
			width:	500,
			height: 250,
			buttonbar: "bold italic strikethrough | unorderedlist orderedlist | alignleft aligncenter alignright",
			bodyStyle: "margin:4px; font:10pt Arial,Verdana; cursor:text"
		},
		buttons :
		{
			bold : { name : "bold", title: "Bold", command: "bold", imgIndex : 0 },
			italic : { name: "italic", title: "Italic", command: "italic", imgIndex : 1 },
			strikethrough : { name: "strikethrough", title:"Strikethrough", command: "strikethrough", imgIndex : 3 },
			unorderedlist : { name : "unorderedlist", title: "Unordered list", command: "insertunorderedlist", imgIndex : 12 },
			orderedlist : { name: "orderedlist", title: "Ordered list", command: "insertorderedlist", imgIndex : 13 },
			alignleft : { name: "alignleft", title: "Align left", command: "justifyleft", imgIndex : 16 },
			aligncenter: { name: "aligncenter", title: "Align center", command: "justifycenter", imgIndex : 17},
			alignright : { name: "alignright", title: "Align right", command: "jutifyright", imgIndex : 18 }
		},
		imagesPath : function() { return imagesPath(); }
	};
	
	$.fn.treditor = function(options) {
		
		return this.each(function(idx, elem) {
			if (elem.tagName == "TEXTAREA")
			{
				new treditor(elem, options);
			}			
		});		
	};	
	
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
		
		//hide textarea
		editor.area = $(textarea)
						.hide()
						.blur(function() { alert('hello world!') });
	
		//create main container
		editor.main = $("<div>").addClass("tre-main")
								.width(editor.settings.width)
								.height(editor.settings.height);
		
		//create button bar
		createButtonBar(editor);
		
		//create iframe
		createIFrame(editor);
	};
		
	/////////////////////
	//Event Handlers	
	/////////////////////
	function buttonClick(e) {
	
		var editor = this,
		    buttonDiv = e.target,
			buttonName = $.data(buttonDiv, 'buttonName'),
			button = $.treditor.buttons[buttonName];
									
		if (!execCommand(editor, button.command, buttonDiv))
			return false;			
	};
		

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
			
		editor.frame.show();
		
		var wid = editor.main.width();	
		editor.buttonbar.height(25);
		editor.frame.width(wid).height(200);
		editor.area.width(wid).height(25);

		try {
			if (isIE) editor.doc.body.contentEditable = true;
			else editor.doc.designMode = 'on';
		}
		catch(e) {
		}
		
	};	
	
	function execCommand(editor, command, button) {
		
		return editor.doc.execCommand(command, 0, null);
					
	};	
		
}) (jQuery);




