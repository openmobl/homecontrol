enyo.kind({
	name: "HomeControl",
	kind: enyo.VFlexBox,

	_ui: "normal",
	
	_off: {},

	_index: 0,

	_selectedPrimary: -1,
	_selectedSecondary: -1,

	_config: [],
	
	_servers: [],
	
	_controllers: [],

// * Status Info: for showing 1-wire status info (ready for 1.0)
// - Surveillance: support for video/snapshots (ready for 0.7)
// * System Input: system mouse and keyboard controls (ready for 1.0)
// * System Sound: master sound and speaker controls (ready for 1.0)
// * Media Center: media boxes with d-pad controls (ready for 1.0)
// * Music Player: music player applications (ready for 1.0)
// * Video Player: video player applications (ready for 1.0)

/*
	{caption: "Status Info - 1-Wire", value: "StatusInfo:1-wire:hc"},
	{caption: "Surveillance - Cisco IP Cam", value: "Surveillance:cisco:dev"},
	{caption: "Surveillance - TouchPad Cam", value: "Surveillance:touchpad:hc"},
//	{caption: "Surveillance - Web Camera", value: "Surveillance:webcam:hc"},
	{caption: "System Sound - Mac OS X", value: "SystemSound:sound:hc"},
	{caption: "System Sound - Pulseaudio", value: "SystemSound:sound:hc"},
//	{caption: "System Sound - Windows", value: "SystemSound:sound:hc"},
	{caption: "System Input - Mac OS X", value: "SystemInput:input:hc"},
	{caption: "System Input - Linux X11", value: "SystemInput:input:hc"},
//	{caption: "System Input - Windows", value: "SystemInput:input:hc"},
	{caption: "Media Center - Front Row", value: "MediaCenter:frontrow:hc"},
	{caption: "Media Center - Boxee Box", value: "MediaCenter:boxee:dev"},
//	{caption: "Media Center - MythTV", value: "MediaCenter:mythtv:hc"},
	{caption: "Media Center - XBMC", value: "MediaCenter:xbmc:device"},
	{caption: "Music Player - Banshee", value: "MusicPlayer:banshee:hc"},
	{caption: "Music Player - iTunes", value: "MusicPlayer:itunes:hc"},
	{caption: "Music Player - MPD", value: "MusicPlayer:mpd:hc"},
	{caption: "Music Player - RhythmBox", value: "MusicPlayer:rhythmbox:hc"},
//	{caption: "Music Player - Winamp", value: "MusicPlayer:winamp:hc"},
	{caption: "Video Player - Quicktime", value: "VideoPlayer:quicktime:hc"},
	{caption: "Video Player - Totem", value: "VideoPlayer:totem:hc"},
	{caption: "Video Player - VLC", value: "VideoPlayer:vlc:app"},
//	{caption: "Video Player - WMP", value: "VideoPlayer:wmp:hc"},
//	{caption: "IR Device - DVD Player", value: "IRDevice:dvdplayer:dev"},
//	{caption: "IR Device - Projector", value: "IRDevice:projector:dev"},
//	{caption: "Audio Speaker - UPnP/DLNA", value: "UPnPSpeaker:speaker:dev"},
//	{caption: "Television - UPnP/DLNA", value: "UPnPTV:tv:dev"},
*/

	
	components: [
		{kind: "ApplicationEvents", onBack: "handleBackEvent"},

		{kind: "AppMenu", components: [
			{caption: "Devices / Servers", onclick: "showAllServers"},
/*			{caption: "Auto Discover", onclick: "autoDiscover"},*/
			{caption: "Add Server", onclick: "addNewServer"},
			{caption: "Help", onclick: "showHelpInfo"}
		]},

		{name: "hlpPopup", lazy: false, kind: "Popup", style: "width: 80%;max-width: 500px;", components: [
			{content: "Help", flex: 1, style: "text-decoration: underline;text-align: center;margin-bottom: 5px;"},
			{content: "For help you need to see the Home Control " +
				"<a href=http://www.webos-internals.org/wiki/Application:HomeControl>Wiki</a>. " +
				"It lists all the supported features and should answer all the questions you may have.", 
				className: "enyo-item-secondary", style: "margin: 5px;text-align: justify;"},
			{layoutKind: "VFlexLayout", components: [
				{kind: "Button", flex: 1, caption: "Close", onclick: "closeHelpPopup"}
			]}
		]},	


		{name: "lstPopup", lazy: false, kind: "Popup", style: "width: 80%;max-width: 500px;", components: [
			{content: "Configured Devices / Servers", flex: 1, style: "text-decoration: underline;text-align: center;"},
			{name: "srvList", kind: "VirtualList", style: "height: 250px;border-style: groove;", 
				onSetupRow: "setupServerRow", components: [
				{kind: "SwipeableItem", layoutKind: "HFlexLayout", tapHighlight: false, 
					onConfirm: "handleDelServer", components: [
					{name: "itemAddr", content: "", style: "font-size: 16px;", flex: 1},
					{name: "itemType", content: "", className: "enyo-label"}
				]}
			]},
			{layoutKind: "HFlexLayout", components: [
				{kind: "Button", flex: 1, caption: "OK", onclick: "closeAllServers"}
			]}
		]},	

		{name: "srvPopup", lazy: false, kind: "Popup", style: "width: 80%;max-width: 500px;", components: [
			{content: "No Controllers Found", flex: 1, style: "text-decoration: underline;text-align: center;margin-bottom: 5px;"},
			{content: "No servers or supported devices found. You can try the automatic discovery again (will be enabled in version 0.9) or " +
				"add server / device manually if they don't support automatic discovery.", className: "enyo-item-secondary",
				style: "margin: 5px;text-align: justify;"},

			{layoutKind: "VFlexLayout", components: [
/*				{kind: "Button", flex: 1, caption: "Auto Discover", onclick: "autoDiscover"},*/
				{kind: "Button", flex: 1, caption: "Add Manually", onclick: "addNewServer"}
			]}
		]},	

		{name: "addPopup", lazy: false, kind: "Popup", showKeyboardWhenOpening: true, style: "width: 80%;max-width: 500px;", components: [
			{content: "Add New Server", flex: 1, style: "text-decoration: underline;text-align: center;margin-bottom: 5px;"},
			{layoutKind: "HFlexLayout", components: [
				{content: "Server Type", style: "font-size: 16px;color: gray;"},
				{flex: 1, className: "custom-divider", style: "margin-left: 5px;margin-bottom: -5px;"}
			]},
			{name: "serverType", kind: "ListSelector", value: "HC", flex: 1, style: "margin: 5px 5px;", items: [
				{caption: "Home Control Server", value: "HC"},
				{caption: "Boxee App / Device", value: "Boxee"},
				{caption: "XBMC App / Device", value: "XBMC"},
				{caption: "VLC Video Player", value: "VLC"},
				{caption: "Cisco IP Camera", value: "Cisco"}
			]},
			{layoutKind: "HFlexLayout", components: [
				{content: "Server / Device", style: "font-size: 16px;color: gray;"},
				{flex: 1, className: "custom-divider", style: "margin-left: 5px;margin-bottom: -5px;"}
			]},
			{name: "serverAddr", kind: "Input", hint: "Format: <address>:<port>",  
				autocorrect: false, spellcheck: false, autoCapitalize: "lowercase", alwaysLooksFocused: true, style: "margin: 5px 0px;", onclick: "showKeyboard"},
			{layoutKind: "HFlexLayout", components: [
				{kind: "Button", flex: 1, caption: "Cancel", onclick: "cancelAddServer"},
				{kind: "Button", flex: 1, caption: "OK", className: "enyo-button-affirmative", onclick: "handleAddServer"}
			]}
		]},	

		{name: "newPopup", lazy: false, kind: "Popup", showKeyboardWhenOpening: true, style: "width: 80%;max-width: 500px;", components: [
			{content: "Setup New Controller", flex: 1, style: "text-decoration: underline;text-align: center;margin-bottom: 5px;"},
			{layoutKind: "HFlexLayout", components: [
				{content: "Controller Type", style: "font-size: 16px;color: gray;"},
				{flex: 1, className: "custom-divider", style: "margin-left: 5px;margin-bottom: -5px;"}
			]},
			{name: "controllerType", kind: "ListSelector", value: "", flex: 1, style: "margin: 5px 5px;", 
				onChange: "updateAddController", items: []},
			{layoutKind: "HFlexLayout", components: [
				{content: "Server / Device", style: "font-size: 16px;color: gray;"},
				{flex: 1, className: "custom-divider", style: "margin-left: 5px;margin-bottom: -5px;"}
			]},
			{name: "controllerAddr", kind: "ListSelector", value: "", flex: 1, style: "margin: 5px 5px;", items: []},
			{layoutKind: "HFlexLayout", components: [
				{content: "Controller Name", style: "font-size: 16px;color: gray;"},
				{flex: 1, className: "custom-divider", style: "margin-left: 5px;margin-bottom: -5px;"}
			]},
			{name: "controllerName", kind: "Input", hint: "Name for the controller...", autoCapitalize: "title", 
				autocorrect: false, spellcheck: false, alwaysLooksFocused: true, style: "margin: 5px 0px;", onclick: "showKeyboard"},
			{layoutKind: "HFlexLayout", components: [
				{kind: "Button", flex: 1, caption: "Cancel", onclick: "cancelAddController"},
				{kind: "Button", flex: 1, caption: "OK", className: "enyo-button-affirmative", onclick: "handleAddController"}
			]}
		]},	

		{name: "errPopup", lazy: false, kind: "Popup", style: "width: 80%;max-width: 500px;", components: [
			{content: "Unknown Response", flex: 1, style: "text-decoration: underline;text-align: center;margin-bottom: 5px;"},
			{content: "The response from the given server was not recognized. Check that the address was correctly entered.", 
				className: "enyo-item-secondary", style: "margin: 5px;text-align: justify;"},

			{layoutKind: "VFlexLayout", components: [
				{kind: "Button", flex: 1, caption: "Try Again", onclick: "addNewServer"},
				{kind: "Button", flex: 1, caption: "Cancel", onclick: "cancelAddServer"}
			]}
		]},	

		{name: "authPopup", lazy: false, kind: "Popup", style: "width: 80%;max-width: 500px;", components: [
			{content: "401 Unauthorized", flex: 1, style: "text-decoration: underline;text-align: center;margin-bottom: 5px;"},
			{content: "The server you entered requires authentication. You can enter the username and password on the address line:<br><br>" +
				"USER:PASSWD@ADDR:PORT", className: "enyo-item-secondary", style: "margin: 5px;text-align: justify;"},

			{layoutKind: "VFlexLayout", components: [
				{kind: "Button", flex: 1, caption: "Try Again", onclick: "addNewServer"},
				{kind: "Button", flex: 1, caption: "Cancel", onclick: "cancelAddServer"}
			]}
		]},	

		{name: "replyPopup", lazy: false, kind: "Popup", style: "width: 80%;max-width: 500px;", components: [
			{content: "Timeout / No Response", flex: 1, style: "text-decoration: underline;text-align: center;margin-bottom: 5px;"},
			{content: "No response from the given server address. Check that the server is running and that your firewall is not blocking the port.", 
				className: "enyo-item-secondary", style: "margin: 5px;text-align: justify;"},

			{layoutKind: "VFlexLayout", components: [
				{kind: "Button", flex: 1, caption: "Try Again", onclick: "addNewServer"},
				{kind: "Button", flex: 1, caption: "Cancel", onclick: "cancelAddServer"}				
			]}
		]},	
	
		{name: "appPane", kind: "SlidingPane", multiViewMinWidth: 300, flex: 1, className: "hd", style: "background: #666666;", 
			onSlideComplete: "adjustSlidingTag", components: [
			{name: "primaryMenu", width: "320px", components: [
				{name: "primaryPane", kind: "Pane", transitionKind: enyo.transitions.Simple, flex: 1, components: [
					{name: "startup", kind: "Startup", onDone: "handleStartupDone"},
					{layoutKind: "VFlexLayout", flex: 1, components: [
						{kind: "CustomPageHeader", taglines: [{weight: 100, text: "One remote to rule them all!"}], onclick: "handleBackEvent"},

						{name: "controlItems", layoutKind: "VFlexLayout", flex: 1, components: []},

						{name: "primaryToolbar", kind: "Toolbar", pack: "left", className: "enyo-toolbar-light", components: [
							{name: "moreLeft", kind: "ToolButton", icon: "./images/button-more.png", onclick: "updateViewMenus"},
							{kind: "Spacer", flex: 1},
							{name: "addButton", kind: "ActivityButton", caption: "Add New Controller", onclick: "addNewController"},
							{kind: "Spacer", flex: 1},
							{name: "moreRight", kind: "ToolButton", icon: "./images/button-nomore.png"},
						]}
					]}
				]}
			]},
			{name: "defaultView", fixedWidth: true, dragAnywhere: false, peekWidth: 64, width: "704px", components: [
				{name: "primaryTag", kind: "CustomSlidingTag", tagClass: "custom-sliding-tag-normal"}, 


				{name: "defaultPane", kind: "Pane", transitionKind: "enyo.transitions.Simple", flex: 1, components: [
					{layoutKind: "VFlexLayout", flex: 1, align: "center", pack: "center", className: "empty-sliding-view-middle", components: [
						{name: "middleImage", kind: "Image", src: "images/icon-empty.png"}, 
						{name: "middleStatus", content: "No controllers configured...", style: "margin-top: -5px; font-size: 0.7em; color: #999999;"}
					]},
					{layoutKind: "HFlexLayout", flex: 1, className: "empty-sliding-view-middle", components: [
						{layoutKind: "HFlexLayout", flex: 1, style: "margin: 0px -18px;", components: [
							{name: "primaryController", kind: "Pane", style: "background: #D8D8D8;margin: 5px 3px;", transitionKind: "enyo.transitions.Simple", flex: 1, components: []},
							{name: "secondaryController", kind: "Pane", style: "background: #D8D8D8;margin: 5px 3px;", transitionKind: "enyo.transitions.Simple", flex: 1, components: []}
						]}
					]}					
				]}
			]},
			{name: "secondaryMenu", fixedWidth: true, dragAnywhere: false, width: "64px", components: [
				{name: "secondaryTag", kind: "CustomSlidingTag", tagClass: "custom-sliding-tag-mirror"}, 
				
				{name: "secondaryPane", kind: "Pane", transitionKind: enyo.transitions.Simple, flex: 1, components: [
					{layoutKind: "VFlexLayout", flex: 1, components: [
						{kind: "PageHeader", height: "76px", components: [
							{kind: "HFlexBox", flex: 1, className: "custom-page-header", components: [
								{kind: "Image", className: "icon", style: "margin: 0px -0px -12px -10px;", src: "./images/icon-panel.png", onclick: "closePanels"}
							]}
						]},
				
						{name: "controlIcons", layoutKind: "VFlexLayout", flex: 1, components: []},
				
						{name: "secondaryToolbar", kind: "Toolbar", pack: "left", className: "enyo-toolbar-light", components: [
							{name: "more", kind: "ToolButton", icon: "./images/button-more.png", onclick: "updateViewMenus"}
						]}
					]}
				]}
			]}
		]},
		
		{name: "queryServerControllers", kind: "WebService", timeout: 3000}
	],

	rendered: function() {
		this.inherited(arguments);

		this.$.primaryController.hide();
		this.$.secondaryController.hide();

		this.$.addButton.setActive(true);	
		this.$.addButton.setDisabled(true);	
		this.$.addButton.setCaption("Querying Servers...");
		this.$.middleStatus.setContent("Querying devices / servers...");

		enyo.keyboard.setResizesWindow(false);

		this.$.more.hide();
		this.$.moreLeft.hide();
		this.$.moreRight.hide();

		this.adjustSliding();
		
		this.$.primaryTag.hide();
		this.$.secondaryTag.hide();

		if((localStorage) && (localStorage["version"])) {
			version = localStorage["version"];

			if(version != enyo.fetchAppInfo().version) {
				this.$.startup.hideWelcomeText();
			} else {
				this.handleStartupDone();
			}
		}

		localStorage["version"] = enyo.fetchAppInfo().version;

		if((localStorage) && (localStorage["controllers"])) {
			this._config = enyo.json.parse(localStorage["controllers"]);

		// TODO: poista joskus!!!
			
			for(var i = 0; i < this._config.length; i++) {
				if(this._config[i].extension == "TouchPadCam") {
					this._config.splice(i--, 1);
					
					continue;
				}
			
				if(this._config[i].extension == "HomeTheater")
					this._config[i].extension = "MediaCenter";

				if((this._config[i].extension == "Computer") ||
					(this._config[i].extension == "ComputerInput"))
				{
					this._config[i].extension = "SystemInput";
					this._config[i].module = "input";
				}

				if(this._config[i].extension == "StatusInfo")
					this._config[i].module = "1-wire";

				if(this._config[i].module == "boxeebox")
					this._config[i].module = "boxee";
			}

			localStorage["controllers"] = enyo.json.stringify(this._config);
		}

		if((localStorage) && (localStorage["servers"])) {
			this._servers = enyo.json.parse(localStorage["servers"]);
		}

		// Some weird bug with calling webserver on rendered if the server is down,
		// causes white card on launch, with small delay no problems...
		
		setTimeout(this.queryServers.bind(this), 100);
//		this.queryServers();
	},

	resizeHandler: function() {
		this.adjustSliding();
	},
	
	adjustSliding: function() {
		var size = enyo.fetchControlSize(this);

		if(size.w < 768) {
			this._ui = "compact";
		
			enyo.setAllowedOrientation("up");

			this.$.appPane.removeClass("hd");

			this.$.primaryController.applyStyle("margin", "0px -2px");
			this.$.secondaryController.applyStyle("margin", "0px -2px");

			this.$.defaultView.applyStyle("width", (size.w - 64) + "px");
		} else {
			if(size.w < 1024) {
				this._ui = "default";
				
				if((this._selectedPrimary != -1) && (this._selectedSecondary != -1)) {
					this.$.defaultView.setPeekWidth(64);

					this.$.defaultView.applyStyle("width", (size.w - 128) + "px");

					this.$.appPane.selectViewByIndex(1);			
				} else {
					this.$.defaultView.setPeekWidth(320);
	
					this.$.defaultView.applyStyle("width", (size.w - 384) + "px");
				}
			} else {
				this._ui = "normal";
							
				this.$.defaultView.setPeekWidth(320);

				this.$.defaultView.applyStyle("width", (size.w - 384) + "px");

				if((this._selectedPrimary != -1) && (this._selectedSecondary != -1))
					this.$.appPane.selectViewByIndex(1);			
			}
		}
	},
	
	adjustSlidingTag: function() {
		if(this.$.appPane.getViewIndex() == 0) {
			this.$.primaryTag.hide();
			this.$.secondaryTag.hide();
		}
	},

	handleBackEvent: function(inSender, inEvent) {
		if((this._ui == "compact") && (this.$.appPane.getViewIndex() > 0)) {
			if(inEvent)
				enyo.stopEvent(inEvent);

			this.$["extensionView" + this._selectedPrimary].selected(false);

			this.$["extensionIcon" + this._selectedPrimary].setSrc(this._selectedPrimaryIcon);				

			this._selectedPrimary = -1;

			this.$.appPane.back();
		}
	},

	handleStartupDone: function() {
		this.$.primaryPane.selectViewByIndex(1);
	},

	showKeyboard: function() {
		enyo.keyboard.show();
	},
	
	closePanels: function() {
		if(this._selectedSecondary != -1) {
			this.$.secondaryController.hide();
			this.$.secondaryTag.hide();

			if(this._ui != "compact") {
				this.$["extensionViewAlt" + this._selectedSecondary].selected(false);

				this.$["extensionIconAlt" + this._selectedSecondary].setSrc(this._selectedSecondaryIcon);				
			}

			this._selectedSecondary = -1;

			if(this._ui == "default") {
				this.$.appPane.selectViewByIndex(1);			

				var size = enyo.fetchControlSize(this);
							
				this.$.defaultView.setPeekWidth(320);

				this.$.defaultView.applyStyle("width", (size.w - 384) + "px");
			}
		} else if(this._selectedPrimary != -1) {
			this.$.primaryController.hide();			
			this.$.primaryTag.hide();

			this.$["extensionView" + this._selectedPrimary].selected(false);

			this.$["extensionIcon" + this._selectedPrimary].setSrc(this._selectedPrimaryIcon);				

			this._selectedPrimary = -1;
		}

		if((this._selectedPrimary == -1) && (this._selectedSecondary == -1))
			this.$.defaultPane.selectViewByIndex(0);
	},

	queryServers: function() {
		if(this._servers.length == 0) {
			this.$.addButton.setActive(false);
			this.$.addButton.setDisabled(false);	
			this.$.addButton.setCaption("Add New Controller");
			this.$.middleStatus.setContent("No devices / servers found...");
		} else {
			setTimeout(this.stopServerDiscovery.bind(this), 5000);
				
			for(var i = 0; i < this._servers.length; i++) {
				if(this._servers[i].type == "HC") {
					this.$.queryServerControllers.call({}, {url: "http://" + this._servers[i].addr + "/modules?id=" + this._servers[i].addr,
						onSuccess: "handleServerResponse", onFailure: "handleServerError"});
				} else if(this._servers[i].type == "VLC")
					this.addControllerOption("app", "any", "vlc", "VLC", "Video Player", this._servers[i].addr);
				else if(this._servers[i].type == "XBMC")
					this.addControllerOption("app", "any", "xbmc", "XBMC", "Media Center", this._servers[i].addr);
				else if(this._servers[i].type == "Boxee")
					this.addControllerOption("app", "any", "boxee", "Boxee", "Media Center", this._servers[i].addr);
				else if(this._servers[i].type == "Cisco")
					this.addControllerOption("app", "any", "cisco", "Cisco IP Cam", "Surveillance", this._servers[i].addr);
			}
		}
		
		this.setupExtensions();
	},

	setupExtensions: function() {
		var size = enyo.fetchControlSize(this);
		
// HACK - should be fixed, but for some reason can not call updateViewMenus here

		if(this._ui != "compact") {
			if(this._selectedSecondary != -1) {
				this.$.secondaryController.hide();
				this.$.secondaryTag.hide();

				if(this.$["extensionViewAlt" + this._selectedSecondary])
					this.$["extensionViewAlt" + this._selectedSecondary].selected(false);

				this._selectedSecondary = -1;
			}
		
			if(this._selectedPrimary != -1) {
				this.$.primaryController.hide();			
				this.$.primaryTag.hide();

				if(this.$["extensionViewAlt" + this._selectedPrimary])
					this.$["extensionView" + this._selectedPrimary].selected(false);

				this._selectedPrimary = -1;
			}

			this.$.defaultPane.selectViewByIndex(0);
		}

// HACK END

		var maxItems = Math.round((size.h - 188) / 34);

		if(this._config.length <= maxItems) {
			this.$.more.hide();
			this.$.moreLeft.hide();
			this.$.moreRight.hide();
		} else {
			this.$.more.show();
			this.$.moreLeft.show();
			this.$.moreRight.show();
		}
		
		for(var i = 0; i < this._config.length; i++) {
			if(this.$["extensionItem" + i])
				this.$["extensionItem" + i].destroy();

			if(this.$["extensionView" + i])
				this.$["extensionView" + i].destroy();

			if(this._ui != "compact") {
				if(this.$["extensionItemAlt" + i])
					this.$["extensionItemAlt" + i].destroy();

				if(this.$["extensionViewAlt" + i])
					this.$["extensionViewAlt" + i].destroy();
			}
		}

		for(var i = 0; i < this._config.length; i++) {
			this.$.controlItems.createComponent(
				{name: "extensionItem" + i, kind: "SwipeableItem", layoutKind: "HFlexLayout", tapHighlight: true, view: i, align: "center", 
					style: "padding: 0px 10px; min-height: 24px; max-height: 56px;", flex: 1, 
					onConfirm: "handleDelController", onclick: "updatePrimaryView", components: [
						{name: "extensionIcon" + i, kind: "Image", src: this._config[i].icon, style: "margin: 0px 18px -3px 5px;"},
						{content: this._config[i].title, flex: 1, style: "text-transform: capitalize; margin-top: -1px;line-height:13px;"},
						{name: "extensionStatus" + i, content: this._config[i].status, className: "enyo-label", style: "color: gray;margin-right: 10px;"}
				]}, {owner: this});

			if(this._ui != "compact") {
				this.$.controlIcons.createComponent(
					{name: "extensionItemAlt" + i, kind: "SwipeableItem", layoutKind: "HFlexLayout", tapHighlight: true, 
						view: i, onclick: "updateSecondaryView", align: "center", 
						style: "padding: 0px 10px; min-height: 24px; max-height: 56px;", flex: 1, components: [
							{name: "extensionIconAlt" + i, kind: "Image", src: this._config[i].icon, style: "margin: 0px 18px -3px 5px;"}
					]}, {owner: this});
			}
			
			if(i >= maxItems)
				this.$["extensionItem" + i].hide();

			this.$.primaryController.createComponent({name: "extensionView" + i, kind: this._config[i].extension, 
				title: this._config[i].title, module: this._config[i].module, address: this._config[i].address,
				flex: 1, onUpdate: "updateStatus"}, {owner: this});

			if(this._ui != "compact") {
				this.$.secondaryController.createComponent({name: "extensionViewAlt" + i, kind: this._config[i].extension, 
					title: this._config[i].title, module: this._config[i].module, address: this._config[i].address,
					flex: 1}, {owner: this});
			}
		}
		
		this.$.controlItems.render();

		this.$.controlIcons.render();

		this.$.primaryController.render();
		this.$.secondaryController.render();
	},

	updateViewMenus: function() {
		var size = enyo.fetchControlSize(this);
					
		var maxItems = Math.round((size.h - 188) / 34);

		if(this._index == 0) {
			this._index = this._config.length % maxItems;
		} else {
			this._index = 0;
		}

		for(var i = 0; i < this._config.length; i++) {
			if((i < this._index) || (i >= (this._index + maxItems))) {
				this.$["extensionItem" + i].hide();

				if(this._ui != "compact")
					this.$["extensionItemAlt" + i].hide();
			} else {
				this.$["extensionItem" + i].show();			

				if(this._ui != "compact")
					this.$["extensionItemAlt" + i].show();			
			}
		}
		
		if(this.$.appPane.getViewIndex() == 1) {
			if((this._selectedPrimary < this._index) || (this._selectedPrimary >= (this._index + maxItems))) {
				this.$.primaryTag.hide();
			} else {
				this.$.primaryTag.show();
							
				var item = this.$["extensionItem" + this._selectedPrimary];
			
				this.$.primaryTag.setPosition(item.getOffset().top + ((item.hasNode().clientHeight - 50) / 2) + 2);
			}

			if(this._ui != "compact") {
				if((this._selectedSecondary < this._index) || (this._selectedSecondary >= (this._index + maxItems))) {
					this.$.secondaryTag.hide();
				} else {
					this.$.secondaryTag.show();
							
					var item = this.$["extensionItemAlt" + this._selectedSecondary];
			
					this.$.secondaryTag.setPosition(item.getOffset().top + ((item.hasNode().clientHeight - 50) / 2) + 2);
				}
			}
		}
	},
	
	updatePrimaryView: function(inSender) {
		this.$.defaultPane.selectViewByIndex(1);

		if((this._ui == "default") && (this._selectedSecondary != -1)) {
			var size = enyo.fetchControlSize(this);
				
			this.$.defaultView.setPeekWidth(64);

			this.$.defaultView.applyStyle("width", (size.w - 128) + "px");
		}		
		
		if((inSender.view == this._selectedPrimary) && (!this._off["extensionView" + inSender.view])) {
			this.handleBackEvent();

			this._off["extensionView" + inSender.view] = true;
		
			this.$["extensionView" + inSender.view].selected(null);

			this.$["extensionIcon" + inSender.view].applyStyle("opacity", "0.5");

			this.$["extensionIcon" + inSender.view].setSrc(this._selectedPrimaryIcon);

			this.$["extensionStatus" + inSender.view].setContent("off");
			
			if(this._ui != "compact") {
				this.$["extensionViewAlt" + inSender.view].selected(null);

				this.$["extensionIconAlt" + inSender.view].applyStyle("opacity", "0.5");

				this.$["extensionIconAlt" + inSender.view].setSrc(this._selectedPrimaryIcon);
			}
		} else {
			if(this._selectedPrimary != this._selectedSecondary) {
				if(this._off["extensionView" + inSender.view])
					this.$["extensionStatus" + inSender.view].setContent("on");

				this._off["extensionView" + inSender.view] = false;
			}

			if(this._selectedPrimary != -1) {
				this.$["extensionView" + this._selectedPrimary].selected(false);

				this.$["extensionIcon" + this._selectedPrimary].setSrc(this._selectedPrimaryIcon);				
			}
						
			this.$["extensionView" + inSender.view].selected(true);

			this.$["extensionIcon" + inSender.view].applyStyle("opacity", "1.0");

			this._selectedPrimaryIcon = this.$["extensionIcon" + inSender.view].getSrc();

			this.$["extensionIcon" + inSender.view].setSrc("./images/icon-power.png");

			if(this._ui != "compact") {
				this.$["extensionViewAlt" + inSender.view].selected(true);

				this.$["extensionIconAlt" + inSender.view].applyStyle("opacity", "1.0");

				if(inSender.view == this._selectedSecondary)
					this.$["extensionIconAlt" + inSender.view].setSrc("./images/icon-power.png");
			}

			this._selectedPrimary = inSender.view;

			this.$.primaryController.show();
				
			this.$.appPane.selectViewByIndex(1);
			this.$.primaryController.selectViewByIndex(inSender.view);

			this.$.primaryTag.show();

			this.$.primaryTag.setPosition(this.$[inSender.name].getOffset().top + ((inSender.hasNode().clientHeight - 50) / 2) + 2);
		}
	},

	updateSecondaryView: function(inSender) {
		this.$.defaultPane.selectViewByIndex(1);
		
		if((this._ui == "default") && (this._selectedPrimary != -1)) {
			var size = enyo.fetchControlSize(this);
			
			this.$.defaultView.setPeekWidth(64);

			this.$.defaultView.applyStyle("width", (size.w - 128) + "px");
		}		
		
		if((inSender.view == this._selectedSecondary) && (!this._off["extensionView" + inSender.view])) {
			this.handleBackEvent();

			this._off["extensionView" + inSender.view] = true;
		
			this.$["extensionView" + inSender.view].selected(null);

			this.$["extensionIcon" + inSender.view].applyStyle("opacity", "0.5");

			this.$["extensionIcon" + inSender.view].setSrc(this._selectedSecondaryIcon);

			this.$["extensionStatus" + inSender.view].setContent("off");
			
			if(this._ui != "compact") {
				this.$["extensionViewAlt" + inSender.view].selected(null);

				this.$["extensionIconAlt" + inSender.view].applyStyle("opacity", "0.5");

				this.$["extensionIconAlt" + inSender.view].setSrc(this._selectedSecondaryIcon);
			}
		} else {
			if(this._selectedPrimary != this._selectedSecondary) {
				if(this._off["extensionView" + inSender.view])
					this.$["extensionStatus" + inSender.view].setContent("on");

				this._off["extensionView" + inSender.view] = false;
			}

			if(this._selectedSecondary != -1) {
				if(this._ui != "compact") {
					this.$["extensionViewAlt" + this._selectedSecondary].selected(false);

					this.$["extensionIconAlt" + this._selectedSecondary].setSrc(this._selectedSecondaryIcon);				
				}
			}

			this.$["extensionView" + inSender.view].selected(true);

			this.$["extensionIcon" + inSender.view].applyStyle("opacity", "1.0");

			if(inSender.view == this._selectedPrimary) {
				this.$["extensionIcon" + inSender.view].setSrc("./images/icon-power.png");
			}

			if(this._ui != "compact") {
				this.$["extensionViewAlt" + inSender.view].selected(true);

				this.$["extensionIconAlt" + inSender.view].applyStyle("opacity", "1.0");

				this._selectedSecondaryIcon = this.$["extensionIconAlt" + inSender.view].getSrc();

				this.$["extensionIconAlt" + inSender.view].setSrc("./images/icon-power.png");
			}

			this._selectedSecondary = inSender.view;

			this.$.secondaryController.show();
				
			this.$.appPane.selectViewByIndex(1);
			this.$.secondaryController.selectViewByIndex(inSender.view);

			this.$.secondaryTag.show();

			this.$.secondaryTag.setPosition(this.$[inSender.name].getOffset().top + ((inSender.hasNode().clientHeight - 50) / 2) + 2);
		}
	},

	updateStatus: function(inSender, inStatus) {
		if((inStatus) && (!this._off[inSender.name])) {
			this.$[inSender.name.replace("View", "Status")].setContent(inStatus);
		}			
	},
	
	setupServerRow: function(inSender, inIndex) {
		if((inIndex >= 0) && (inIndex < this._servers.length)) {
			this.$.itemAddr.setContent(this._servers[inIndex].addr);

			this.$.itemType.setContent(this._servers[inIndex].type);
			
			return true;
		}
	},
	
	showAllServers: function() {
		this.$.srvList.refresh();
	
		this.$.lstPopup.openAtCenter();
	},

	closeAllServers: function() {
		this.$.lstPopup.close();
	},

	showHelpInfo: function() {
		this.$.hlpPopup.openAtCenter();
	},
	
	closeHelpPopup: function() {
		this.$.hlpPopup.close();
	},

	autoDiscover: function() {
		this.$.srvPopup.close();
	},

	addNewServer: function() {
		this.$.srvPopup.close();

		this.$.addPopup.openAtCenter();
	},
	
	cancelAddServer: function() {
		this.$.serverAddr.setValue("");

		this.$.addPopup.close();
		this.$.errPopup.close();
		this.$.authPopup.close();
		this.$.replyPopup.close();

		enyo.keyboard.hide();

		enyo.keyboard.setManualMode(false);
	},
	
	handleAddServer: function() {
		this.$.addButton.setActive(true);	
		this.$.addButton.setDisabled(true);	
		this.$.addButton.setCaption("Querying Server...");
		this.$.middleStatus.setContent("Querying device/server...");
		
		this.$.addPopup.close();

		enyo.keyboard.hide();

		enyo.keyboard.setManualMode(false);

		var type = this.$.serverType.getValue();
		var addr = this.$.serverAddr.getValue();

		if(type == "HC")
			this.$.queryServerControllers.call({}, {url: "http://" + addr + "/modules?id=" + addr,
				onSuccess: "handleQueryResponse", onFailure: "handleQueryError"});
		else {
			this.$.addButton.setActive(false);
			this.$.addButton.setDisabled(false);	
			this.$.addButton.setCaption("Add New Controller");
				
			if(type == "VLC")
				this.addControllerOption("app", "any", "vlc", "VLC", "Video Player", addr);
			else if(type == "XBMC")
				this.addControllerOption("app", "any", "xbmc", "XBMC", "Media Center", addr);
			else if(type == "Boxee")
				this.addControllerOption("app", "any", "boxee", "Boxee", "Media Center", addr);
			else if(type == "Cisco")
				this.addControllerOption("app", "any", "cisco", "Cisco IP Cam", "Surveillance", addr);

			for(var i = 0; i < this._servers.length; i++) {
				if(this._servers[i].addr == addr)
					this._servers.splice(i--, 1);
			}

			this._servers.push({addr: addr, type: type});

			localStorage["servers"] = enyo.json.stringify(this._servers);

			this.$.middleStatus.setContent(this._servers.length + " devices / servers found...");
		}
	},
	
	handleDelServer: function(inSender, inIndex) {
		var addr = this._servers[inIndex].addr;

		for(var i = 0; i < this._controllers.length; i++) {
			var idx = this._controllers[i].servers.indexOf(addr);

			if(idx != -1) {
				if(this._controllers[i].servers.length > 1)
					this._controllers[i].servers.splice(idx, 1);
				else
					this._controllers.splice(i--, 1);
			}
		}
		
		this._servers.splice(inIndex, 1);
		
		this.$.srvList.refresh();

		localStorage["servers"] = enyo.json.stringify(this._servers);
	},	
	
	addNewController: function() {
		if(this._controllers.length == 0) {
			this.$.srvPopup.openAtCenter();		
		} else {
			this.$.controllerName.setValue("");

			this._controllers.sort(this.sortControllerOptions);

			this.$.controllerType.setItems(this._controllers);
		
			this.$.controllerType.setValue(this._controllers[0].value);

			this.$.controllerAddr.setItems(this._controllers[0].servers);

			this.$.controllerAddr.setValue(this._controllers[0].servers[0]);

			this.$.newPopup.openAtCenter();
		}
	},

	updateAddController: function() {
		for(var i = 0; i < this._controllers.length; i++) {
			if(this._controllers[i].value == this.$.controllerType.getValue()) {
				this.$.controllerAddr.setItems(this._controllers[i].servers);
		
				this.$.controllerAddr.setValue(this._controllers[i].servers[0]);
				
				break;
			}
		}
	},

	cancelAddController: function() {
		this.$.newPopup.close();

		enyo.keyboard.hide();

		enyo.keyboard.setManualMode(false);
	},
	
	handleAddController: function() {
		this.$.newPopup.close();

		enyo.keyboard.hide();

		enyo.keyboard.setManualMode(false);
		
		var controller = this.$.controllerType.getValue().split(":");
	
		this._config.push({extension: controller[0], module: controller[1], icon: "./images/icon-" + 
			controller[0].toLowerCase() +".png", title: this.$.controllerName.getValue(), 
			address: this.$.controllerAddr.getValue(), status: "on"});

		localStorage["controllers"] = enyo.json.stringify(this._config);

		this.setupExtensions();
	},
	
	handleDelController: function(inSender) {
		this._config.splice(inSender.view, 1);

		localStorage["controllers"] = enyo.json.stringify(this._config);

		this.$["extensionItem" + inSender.view].destroy();

		this.$["extensionView" + inSender.view].destroy();

		if(this._ui != "compact") {
			this.$["extensionItemAlt" + inSender.view].destroy();

			this.$["extensionViewAlt" + inSender.view].destroy();
		}
		
		this._off["extensionView" + inSender.view] = false;

		this.setupExtensions();
	},
	
	addControllerOption: function(inCategory, inPlatform, inID, inName, inType, inAddr) {
		var controllerAdded = false;
	
		var value = inType.replace(" ", "") + ":" + inID + ":" + inPlatform;
	
		for(var i = 0; i < this._controllers.length; i++) {
			if(this._controllers[i].value == value) {
				controllerAdded = true;
				
				if(this._controllers[i].servers.indexOf(inAddr) == -1)
					this._controllers[i].servers.push(inAddr);
				
				break;
			}
		}
		
		if(!controllerAdded) {
			this._controllers.push({caption: inType + " - " + inName, 
				category: inCategory, servers: [inAddr], value: value});		
		}
	},

	sortControllerOptions: function(inOptionA, inOptionB) {
		if(inOptionA.category == inOptionB.category) {
			var a = inOptionA.caption.toLowerCase();
			var b = inOptionB.caption.toLowerCase();
		} else {
			var a = inOptionB.category.toLowerCase();
			var b = inOptionA.category.toLowerCase();
		}
		
		return ((a < b) ? -1 : ((a > b) ? 1 : 0));
	},
	
	handleQueryResponse: function(inSender, inResponse) {
		enyo.error("Server query - " + enyo.json.stringify(inResponse));

		this.$.addButton.setActive(false);
		this.$.addButton.setDisabled(false);	
		this.$.addButton.setCaption("Add New Controller");

		if((inResponse) && (inResponse.request) && (inResponse.modules)) {
			this.$.serverAddr.setValue("");

			var addr = inResponse.request;

			for(var i = 0; i < this._servers.length; i++) {
				if(this._servers[i].addr == addr)
					this._servers.splice(i--, 1);
			}

			this._servers.push({addr: addr, type: "HC"});

			localStorage["servers"] = enyo.json.stringify(this._servers);

			for(var i = 0; i < inResponse.modules.length; i++) {
				var category = inResponse.modules[i].category;
				var platform = inResponse.modules[i].platform;

				var id = inResponse.modules[i].id;
				var name = inResponse.modules[i].name;
				var type = inResponse.modules[i].type;

				this.addControllerOption(category, platform, id, name, type, addr);
			}
		} else {
			this.$.errPopup.openAtCenter();
		}

		this.$.middleStatus.setContent(this._servers.length + " devices / servers found...");	
	},
	
	handleQueryError: function(inSender, inResponse) {
		this.$.addButton.setActive(false);
		this.$.addButton.setDisabled(false);	
		this.$.addButton.setCaption("Add New Controller");

		if(this._servers.length == 0)
			this.$.middleStatus.setContent("No devices / servers found...");
		else
			this.$.middleStatus.setContent(this._servers.length + " devices / servers found...");
		
		var regexp = new RegExp("401 Unauthorized");

		if((inResponse) && (inResponse.match(regexp) != null))
			this.$.authPopup.openAtCenter();
		else
			this.$.replyPopup.openAtCenter();
	},
	
	stopServerDiscovery: function () {
		this.$.addButton.setActive(false);	
		this.$.addButton.setDisabled(false);	
		this.$.addButton.setCaption("Add New Controller");

		if(this._servers.length == 0)
			this.$.middleStatus.setContent("No devices / servers found...");
		else
			this.$.middleStatus.setContent(this._servers.length + " devices / servers found...");
	},

	handleServerResponse: function(inSender, inResponse) {
		enyo.error("Server query - " + enyo.json.stringify(inResponse));

		if((inResponse) && (inResponse.request) && (inResponse.modules)) {
			for(var i = 0; i < inResponse.modules.length; i++) {
				var category = inResponse.modules[i].category;
				var platform = inResponse.modules[i].platform;

				var id = inResponse.modules[i].id;
				var name = inResponse.modules[i].name;
				var type = inResponse.modules[i].type;

				this.addControllerOption(category, platform, id, name, type, inResponse.request);
			}
		}
	},

	handleServerError: function(inSender, inResponse) {
		enyo.error("DEBUG - " + enyo.json.stringify(inResponse));
	}	
});

