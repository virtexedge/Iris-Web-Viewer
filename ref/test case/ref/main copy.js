// System Variables
var iris = {

    name: "Iris Web Viewer",
    version: "0.4.0",

    shortdescription: "3D Model Exchange Format Viewer",

    description: "A light weight 3D Model Viewer for viewing Exchange Format files without the need for larger packages to be preinstalled on a computer. For use in viewing *.stl and *.obj files.",

    disclaimer: "Note: This app is still in 'Beta' and should not be used for final production decisions. It should only be used for non-critical reference and conceptual views. You can file any bugs found on our Github page.",
}

var User = {
    LoggedIn: false,

    ID: "xxxxxxxx-id-xxxxxxxx",

    Name: "default user name",

    ImgUrl: "",

    Email: ""
}

/* Uncomment for Debuging
var originalLog = log
log=function(obj){
    originalLog(JSON.parse(JSON.stringify(obj)))
}
*/

// The WebGL Canvas
var canvas;

// The WebGL Context
var gl;

var safeToDraw = true;

var cubeImage;
var cubeTexture;

// Properties GUI
var gui;

// Holder for vxProperties object
var properties;

// Stats Marker for FPS/MS etc...
var stats = new Stats();

var CurrentCMD;


var DoDebug = false;

// Model Center
var modelprop_Center = [0, 0, 0];
var Cur_Center = [0, 0, 0];


//var meshcolor = new vxColour(0.05, 0.5, 0.75, 1);
var meshcolor = new vxColour(0.65, 0.65, 0.65, 1);
var selectedcolor = new vxColour(0.93, 0.463, 0.05, 1);

var modelprop_Radius = 1;

var numOfFaces = 1;



// Render State, Shaded, Wireframe, etc...
//**************************************************

vxRenderState = {
    Wireframe: 0,
    Shaded: 1,
    Textured: 2,
    SurfaceNormal: 3
};

var RenderState = vxRenderState.Textured;

var ShowEdges = true;

vxShaderState = {
    Diffuse: 0,
};
var ShaderState = vxShaderState.Diffuse;


// View Projection Type
//**************************************************
vxProjectionType = {
    Perspective: 0,
    Ortho: 1
};

var ProjectionType = vxProjectionType.Perspective;



//The Selection Index
var HoverIndex = 0;

var treeHasFocus = 0;


//This is a collection of all of the current models. A model is defined as a
// individual file.
var ModelCollection = [];

//This is a collection of all of the current meshes
var MeshCollection = [];

var MeshCollectionPart = [];

//This is a collection of all of the current meshes
var SelectedMeshCollection = [];

// Collection of Measurements
var MeasureCollection = [];


//Grid Variables
var GridMesh = new vxMeshPart('GridMesh');
var XAxisMesh = new vxMeshPart('X Axis');
var YAxisMesh = new vxMeshPart('Y Axis');
var ZAxisMesh = new vxMeshPart('Z Axis');

//var Cntr_Mesh = new vxMeshPart('Center');

var HoveredMesh = new vxMeshPart('Hovered Mesh');

var ViewCenter = new vxVertex3D();

//var cubeVerticesIndexBuffer;
var numOfElements = 0;
var rotX = -45;
var rotY = 30;
var panX = 0;
var panY = 0;

var currotX = 0;
var currotY = 0;
var curZoom = 0;

var lastCubeUpdateTime = 0;

var Zoom = -100;

var mvMatrix;
var perspectiveMatrix;
var elmntID;

// Mouse State Struct
var MouseState = {
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    LeftButtonDown: false,
    MiddleButtonDown: false,
    RightButtonDown: false,
    ZoomEnabled: true,
};


// Keyboard State
var KeyboardState = {
    Shift: false,
};

var meshNodeId = "node_mesh";
var measureNodeId = "node_measure";

var status;

// Modals
var modalIntro = document.getElementById('modal_intro');
var modalOpenFile = document.getElementById('modal_openFile');
var modalLoadFile = document.getElementById('modal_loadFile');
var modalLoadFileResults = document.getElementById('modal_openFileResults');



var loadingPrgrsBar = document.getElementById('loading-prgrsbar');

function InitVariables() {
    log("InitVariables()");

    // First set up Splash Screen (modal_intro)
    window.document.title = "IRIS Viewer  - [v. " + iris.version + " - Beta]"
    document.getElementById("intro_text_title").innerHTML = iris.name;
    //document.getElementById("intro_text_version").innerHTML = "[v. " + iris.version + " - Beta]";
    document.getElementById("intro_text_subtitle").innerHTML = iris.shortdescription;

    document.getElementById("intro_text_description").innerHTML = iris.description;
    document.getElementById("intro_text_disclaimer").innerHTML = "Note: This app is still in 'Beta' and should not be used for final production decisions. It should only be used for non-critical reference and conceptual views. You can file any bugs found on our Github page.";

    //  document.getElementById("menubar_text_cornerTitle").innerHTML = iris.name + " - [v. " + iris.version + " - Beta]";

    var versionSVGURL = "https://img.shields.io/badge/build-beta%20%5Bv.%20" + iris.version + "%5D-green.svg";

    // Set Version Text Elements
    var image = document.getElementById("img_version_launch");
    //image.src = versionSVGURL;

    var version_image = document.getElementById("img_version_footer");
    //version_image.src = versionSVGURL;


    // Setup Signin Info
    var dev_signedIn = document.getElementById("dev_signedIn");
    dev_signedIn.style.display = 'none';

    var btn_googleSignIn = document.getElementById("btn_googleSignIn");
    btn_googleSignIn.style.display = 'block';


    status = document.getElementById('footer_text');
    document.getElementById('footer_text').innerHTML = "Welcome to Iris";

    // Now set up the 3D info
    canvas = document.getElementById('glcanvas3D');
    loadingPrgrsBar.style.width = "20%";

    setTimeout(function() { InitRibbon(); }, 10);
}

function InitRibbon()
{
    var ribbon = new RibbonControl("div_ribbon");
    var irisTab = new RibbonTab("Iris");
    var mainTab = new RibbonTab("Main");
    var viewTab = new RibbonTab("View");
    var toolTab = new RibbonTab("Tools");

    ribbon.addTab(irisTab);
    ribbon.addTab(mainTab);
    ribbon.addTab(viewTab);
    ribbon.addTab(toolTab);

    // Iris Tab
    irisTab.tabBtn.addEventListener("click", function() {
          
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("div_main").style.marginLeft = "250px";
    document.getElementById("glcanvas3D").style.marginLeft = "250px";
    //document.getElementById("div_ribbon").style.marginLeft = "250px";
    document.getElementById("model_treeview").style.marginLeft = "250px";
      });
    mainTab.tabBtn.click();

    // Add in Controls
    var newBtn = new RibbonButton("New", "new_32", false);
    newBtn.btn.addEventListener("click", function() {
          window.location.reload(true);
      });

    mainTab.addItem(newBtn);

    var openBtn = new RibbonButton("Open", "open_32", false);
    openBtn.btn.addEventListener("click", function() {
          $('#menu_file_openSelect').click();
      });

    mainTab.addItem(openBtn);
    mainTab.addBreak();

    var importBtn = new RibbonButton("Import", "import");
    importBtn.btn.addEventListener("click", function() {
        modalOpenFile.style.display = "block";
        CloseSidebar();
      });
    mainTab.addItem(importBtn);

    var exportBtn = new RibbonButton("Export", "export");
    exportBtn.btn.addEventListener("click", function() {
    document.getElementById("modal_exportFile").style.display = "block";
    CloseSidebar();
      });
    mainTab.addItem(exportBtn);



    mainTab.addSeperator();
    mainTab.addItem(new RibbonButton("Save As"));

    var drpdwn= new RibbonDropdown("Save As");
    mainTab.addItem(drpdwn);
    drpdwn.addItem("Item 1");
    drpdwn.addItem("Item 2");
    drpdwn.addItem("Item 3");
    drpdwn.addItem("Item 4");
    drpdwn.addItem("Item 5");

function SendMessage(e) {
    console.log(e);
}
    document.addEventListener("OnRibbonSelectionChange", SendMessage, false);
    
    mainTab.addItem(new RibbonButton("Save As"));
    mainTab.addItem(new RibbonButton("Save As"));
    mainTab.addItem(new RibbonButton("Save As"));
    mainTab.addItem(new RibbonButton("Save As"));
    mainTab.addItem(new RibbonButton("Save As"));
    mainTab.addItem(new RibbonButton("Save As"));



    ribbon.init();  


    setTimeout(function() { InitDebugStats(); }, 10);
}

function InitDebugStats() {
    log("InitDebugStats()");
    // Setup Stats Panel
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    //log(stats.dom);
    stats.dom.style.top = window.innerHeight - 75 + "px";
    //hide it normally
    stats.dom.style.display = 'none';
    //stats.dom.style.bottom = 32+"px"
    document.body.appendChild(stats.dom);
    loadingPrgrsBar.style.width = "30%";

    setTimeout(function() { InitProperties(); }, 100);
}

function InitProperties() {
    log("InitProperties()");
    // Now Setup the Properties GUI
    gui = new dat.GUI({ autoplace: false, width: 300 });

    gui.domElement.id = 'prop_dat_gui';

    var prop = document.getElementById('cntrl_properties');
    var customContainer = $(prop).append($(gui.domElement));

    //initialise model properties
    properties = new ModelProp(gui, "");
    loadingPrgrsBar.style.width = "40%";
    setTimeout(function() { InitWebGL(); }, 100);

}


function InitWebGL() {
    log("InitWebGL()");

    //Initialise Web GL
    webGLStart();
    loadingPrgrsBar.style.width = "65%";

    setTimeout(function() { InitListerners(); }, 200);

}

function InitListerners() {
    log("InitListerners()");


    //Initialise Input Handlers
    InitInputHandlers();

    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    canvas.onmousemove = handleMouseMove;

    // hook up cross browser mouse scrolls
    document.addEventListener('DOMMouseScroll', MouseWheelHandler, { passive: true }); // for Firefox
    document.addEventListener("mousewheel", MouseWheelHandler, { passive: true }); // everyone else
    loadingPrgrsBar.style.width = "75%";

    setTimeout(function() { InitTreeNodes(); }, 10);

}

function InitTreeNodes() {
    log("InitTreeNodes()");
    Resize();
    loadingPrgrsBar.style.width = "70%";
    AddTreeNode(meshNodeId, "Meshes", "tree_root", "folder", true);

    AddTreeNode(measureNodeId, "Measurements", "tree_root", "folder", true);
    loadingPrgrsBar.style.width = "100%";

    var dev_signedIn = document.getElementById("profile_img");
    dev_signedIn.style.display = 'none';

    setTimeout(function() { FinaliseInit(); }, 150);

}

function FinaliseInit() {
    log("FinaliseInit()");
    SetMenuBarValues();
    $('#loading').fadeOut();
}


window.onload = function() {

    setTimeout(function() { InitVariables(); }, 10);

};

function AddTreeNode(id, labelText, rootToAddTo) {
    AddTreeNode(id, labelText, rootToAddTo, "");
}

function AddTreeNode(id, labelText, rootToAddTo, icon) {
    AddTreeNode(id, labelText, rootToAddTo, "", true);
}

var nodeCount = 0;

function AddTreeNode(id, labelText, rootToAddTo, icon, isExpanded) {


    // First get the tree root
    var rootNode = document.getElementById(rootToAddTo + "_ul");

    // Next create the li element which will encapslate the entire tree node GUI item
    var li = document.createElement("li");

    var cnvs = document.createElement("CANVAS");
    cnvs.setAttribute("data-id", "id"); // added line
    cnvs.style.width = "100%";
    cnvs.style.height = "18px";
    li.appendChild(cnvs);




    //Now Add an Input

    //     <input type="checkbox" id="node-0-1-0" />
    var inp1 = document.createElement("INPUT");
    inp1.setAttribute("type", "checkbox"); // added line
    inp1.setAttribute("id", id); // added line


    if (isExpanded === true)
        inp1.setAttribute("checked", "true"); // added line

    li.appendChild(inp1);

    // Now Create the Nested label which holds the check box
    var chkLbl = document.createElement("LABEL");

    var inp2 = document.createElement("INPUT");
    inp2.setAttribute("id", id); // added line
    inp2.setAttribute("type", "checkbox"); // added line
    inp2.setAttribute("checked", "checked"); // added line
    chkLbl.appendChild(inp2);

    var spn = document.createElement("SPAN");
    chkLbl.appendChild(spn);

    li.appendChild(chkLbl);

    // Finally create the end Text
    var txtLbl = document.createElement("LABEL");
    var txt = document.createTextNode(labelText);
    txtLbl.setAttribute("for", id);
    txtLbl.setAttribute("data-icon", icon);
    txtLbl.appendChild(txt);
    li.appendChild(txtLbl);

    // Finally Append a 'ul' element so that it can parent other nodes
    var newul = document.createElement("ul");
    newul.setAttribute("id", id + "_ul"); // added line
    li.appendChild(newul);

    rootNode.appendChild(li);


    //$(".ui-cntrl-treeview").mouseenter(function(){treeHasFocus = 1;});
    //$(".ui-cntrl-treeview").mouseleave(function(){treeHasFocus = 0;});
    txtLbl.onmouseover = function() { crntTreeHighlight = labelText };
    //$(id).mouseleave(function(){console.log("mouse left");});
}
var crntTreeHighlight = "";

function AddTreeNodeTexture(id, rootToAddTo, newImg, size) {


    // First get the tree root
    var rootNode = document.getElementById(rootToAddTo + "_ul");

    // Next create the li element which will encapslate the entire tree node GUI item
    var li = document.createElement("li");

    var cnvs = document.createElement("CANVAS");
    cnvs.setAttribute("data-id", "id"); // added line
    cnvs.style.width = "100%";
    cnvs.style.height = size;
    li.appendChild(cnvs);

    //Now Add an Input

    //     <input type="checkbox" id="node-0-1-0" />
    var inp1 = document.createElement("INPUT");
    inp1.setAttribute("type", "checkbox"); // added line
    inp1.setAttribute("id", id); // added line


    //if (isExpanded === true)
    inp1.setAttribute("checked", "true"); // added line

    li.appendChild(inp1);

    // Now Create the Nested label which holds the check box
    var chkLbl = document.createElement("LABEL");

    var inp2 = document.createElement("INPUT");
    inp2.setAttribute("id", id); // added line
    inp2.setAttribute("type", "checkbox"); // added line
    inp2.setAttribute("checked", "checked"); // added line
    chkLbl.appendChild(inp2);

    var spn = document.createElement("SPAN");
    chkLbl.appendChild(spn);

    li.appendChild(chkLbl);

    // Finally create the end Text
    var txtLbl = document.createElement("LABEL");
    var txt = document.createTextNode("img: ");
    var img = document.createElement("IMG");
    txtLbl.setAttribute("for", id);
    txtLbl.setAttribute("data-status", "texture");

    txtLbl.appendChild(newImg);
    li.appendChild(txtLbl);

    // Finally Append a 'ul' element so that it can parent other nodes
    var newul = document.createElement("ul");
    newul.setAttribute("id", id + "_ul"); // added line
    li.appendChild(newul);

    rootNode.appendChild(li);
}

function InitialiseModel(model) {
    ModelCollection.push(model);
}


function addResultsItem(note) {
    // First get the tree root
    var rootDiv = document.getElementById("div_results");


    /*
      <div class="modal-result-item" type="error" >
        <img class ="modal-result-item-img" data-icon="error"/>
        <span class="modal-result-item-title">Error Loading File</span>
        <span class="modal-result-item-file">filename.txt</span>
        <hr id="splitter" />
        <span class="modal-result-item-txt">There was an error when loading the file default.txt. "Could not find material file 'None.mtl' referenced in cube.obj. Make sure you've selected all referenced files when selecting."</span>
      </div>
    */
    var errortype = note.type == 0 ? "error" : "warning";

    // first create the div which will encapsulate the entire note
    var noteDiv = document.createElement("div");
    noteDiv.setAttribute("class", "modal-result-item");
    noteDiv.setAttribute("type", errortype);


    // Now create the image icon
    var noteImg = document.createElement("IMG");
    noteImg.setAttribute("class", "modal-result-item-img");
    noteImg.setAttribute("data-icon", errortype);
    noteDiv.appendChild(noteImg);

    // Now create the title
    var titleSpan = document.createElement("SPAN");
    titleSpan.setAttribute("class", "modal-result-item-title");
    titleSpan.innerHTML = note.title;
    noteDiv.appendChild(titleSpan);

    // next create the file name
    var fileSpan = document.createElement("SPAN");
    fileSpan.setAttribute("class", "modal-result-item-file");
    fileSpan.innerHTML = note.fileName;
    noteDiv.appendChild(fileSpan);

    // add a hr splitter
    var spltr = document.createElement("br");
    spltr.setAttribute("id", "splitter");
    noteDiv.appendChild(spltr);


    // next create the error description
    var descpSpan = document.createElement("SPAN");
    descpSpan.setAttribute("class", "modal-result-item-txt");
    descpSpan.innerHTML = note.descp;
    noteDiv.appendChild(descpSpan);

    // finally append the note
    rootDiv.appendChild(noteDiv);
}

/*

V 293256
F 32584

V 1082016
F 120224
*/


$(window).resize(function() {

    Resize();
});

// Handles Resizing
function Resize() {
    canvas.width = $(window).width();
    canvas.height = $(window).height() - 132;

    document.getElementById("model_treeview").style.maxHeight = ($(window).height() - 156) + "px";
    document.getElementById("treeview_capsuleDiv").style.width = document.getElementById("model_treeview").style.width;

    var footer = document.getElementById('div_footer');

    stats.dom.style.top = window.innerHeight - 75 + "px";
    //footer.bottom = -30 + "px";
    //footer.left = 0 + "px";

    gl.viewport(0, 0, canvas.width, canvas.height);
}





$(".ui-cntrl-treeview").mouseenter(function() { treeHasFocus = 1; });
$(".ui-cntrl-treeview").mouseleave(function() { treeHasFocus = 0;
    crntTreeHighlight = "" });


// Handle Tree View Checkbox Toggle
// *****************************************************************************************************
$(".ui-cntrl-treeview").delegate("label input:checkbox", "change", function() {
    var
        checkbox = $(this),
        nestedList = checkbox.parent().next().next(),
        selectNestedListCheckbox = nestedList.find("label:not([for]) input:checkbox");

    // Toggle all Meshes
    if ($(checkbox).attr('id') == meshNodeId) {
        for (var i = 0; i < MeshCollection.length; i++) {

            MeshCollection[i].Enabled = checkbox.is(":checked");
        }
    }

    // Toggle all Measurements
    else if ($(checkbox).attr('id') == measureNodeId) {
        for (var i = 0; i < MeasureCollection.length; i++) {

            MeasureCollection[i].Enabled = checkbox.is(":checked");
        }

        // Parse through individual collections
    } else {

        //Check Meshes
        for (var i = 0; i < MeshCollection.length; i++) {

            if (MeshCollection[i].TreeNodeID == $(checkbox).attr('id')) {
                MeshCollection[i].Enabled = checkbox.is(":checked");
            }
        }
        //Check Models
        for (var i = 0; i < ModelCollection.length; i++) {

            //ModelCollection[i].TrueFunc = !ModelCollection[i].TrueFunc;

            if ("node_" + ModelCollection[i].Name == $(checkbox).attr('id')) {
                ModelCollection[i].SetEnabled(checkbox.is(":checked"));
            }
        }

        //Check Measurements
        for (var i = 0; i < MeasureCollection.length; i++) {

            if ("node_" + MeasureCollection[i].Name == $(checkbox).attr('id')) {
                MeasureCollection[i].Enabled = checkbox.is(":checked");
            }
        }
    }
    /*
          log($(checkbox).attr('id'));
        log(checkbox.is(":checked"));
        */
    if (checkbox.is(":checked")) {
        return selectNestedListCheckbox.prop("checked", true);
    }
    selectNestedListCheckbox.prop("checked", false);
});






// Handles Logging of Text
// *****************************************************************************************************
function log(Text) {
    //console.log(">> "+Text);
    if (DoDebug === true) {
        log(Text);
        //var TextSoFar = $('#console').html();

        //TextSoFar += new Date() + ">> " + Text + "<br/>";

        //$('#console').html(TextSoFar);

        //$('#sonsoleDiv').animate({scrollTop: $('#sonsoleDiv').prop("scrollHeight")}, 50);
    }
}










(function() {

    "use strict";

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //
    // H E L P E R    F U N C T I O N S
    //
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    /**
     * Function to check if we clicked inside an element with a particular class
     * name.
     *
     * @param {Object} e The event
     * @param {String} className The class name to check against
     * @return {Boolean}
     */
    function clickInsideElement(e, className) {
        var el = e.srcElement || e.target;

        if (el.classList.contains(className)) {
            return el;
        } else {
            while (el = el.parentNode) {
                if (el.classList && el.classList.contains(className)) {
                    return el;
                }
            }
        }

        return false;
    }

    /**
     * Get's exact position of event.
     *
     * @param {Object} e The event passed in
     * @return {Object} Returns the x and y position
     */
    function getPosition(e) {
        var posx = 0;
        var posy = 0;

        if (!e) var e = window.event;

        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        return {
            x: posx,
            y: posy
        }
    }

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //
    // C O R E    F U N C T I O N S
    //
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    /**
     * Variables.
     */
    var contextMenuClassName = "context-menu";
    var contextMenuItemClassName = "context-menu__item";
    var contextMenuLinkClassName = "context-menu__link";
    var contextMenuActive = "context-menu--active";

    var taskItemClassName = "glcanvas3D";
    var taskItemInContext;

    var clickCoords;
    var clickCoordsX;
    var clickCoordsY;

    var menu = document.querySelector("#context-menu");
    var menuItems = menu.querySelectorAll(".context-menu__item");
    var menuState = 0;
    var menuWidth;
    var menuHeight;
    var menuPosition;
    var menuPositionX;
    var menuPositionY;

    var windowWidth;
    var windowHeight;

    /**
     * Initialise our application's code.
     */
    function init() {
        contextListener();
        clickListener();
        keyupListener();
        resizeListener();
    }

    /**
     * Listens for contextmenu events.
     */
    function contextListener() {
        document.addEventListener("contextmenu", function(e) {
            taskItemInContext = clickInsideElement(e, taskItemClassName);
            //e.preventDefault();
            if (taskItemInContext) {
                e.preventDefault();
                toggleMenuOn();
                positionMenu(e);
            } else {
                taskItemInContext = null;
                toggleMenuOff();
            }
        });
    }

    /**
     * Listens for click events.
     */
    function clickListener() {
        document.addEventListener("click", function(e) {
            var clickeElIsLink = clickInsideElement(e, contextMenuLinkClassName);

            if (clickeElIsLink) {
                e.preventDefault();
                menuItemListener(clickeElIsLink);
            } else {
                var button = e.which || e.button;
                if (button === 1) {
                    toggleMenuOff();
                }
            }
        });
    }

    /**
     * Listens for keyup events.
     */
    function keyupListener() {
        window.onkeyup = function(e) {
            if (e.keyCode === 27) {
                toggleMenuOff();
            }
        }
    }

    /**
     * Window resize event listener
     */
    function resizeListener() {
        window.onresize = function(e) {
            toggleMenuOff();
        };
    }

    /**
     * Turns the custom context menu on.
     */
    function toggleMenuOn() {
        if (menuState !== 1) {
            menuState = 1;
            menu.classList.add(contextMenuActive);
        }
    }

    /**
     * Turns the custom context menu off.
     */
    function toggleMenuOff() {
        if (menuState !== 0) {
            menuState = 0;
            menu.classList.remove(contextMenuActive);
        }
    }

    /**
     * Positions the menu properly.
     *
     * @param {Object} e The event
     */
    function positionMenu(e) {
        clickCoords = getPosition(e);
        clickCoordsX = clickCoords.x;
        clickCoordsY = clickCoords.y;

        menuWidth = menu.offsetWidth + 4;
        menuHeight = menu.offsetHeight + 4;

        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;

        if ((windowWidth - clickCoordsX) < menuWidth) {
            menu.style.left = windowWidth - menuWidth + "px";
        } else {
            menu.style.left = clickCoordsX + "px";
        }

        if ((windowHeight - clickCoordsY) < menuHeight) {
            menu.style.top = windowHeight - menuHeight + "px";
        } else {
            menu.style.top = clickCoordsY + "px";
        }
    }

    /**
     * Dummy action function that logs an action when a menu item link is clicked
     *
     * @param {HTMLElement} link The link that was clicked
     */
    function menuItemListener(link) {
        log("Task ID - " + taskItemInContext.getAttribute("data-id") + ", Task action - " + link.getAttribute("data-action"));
        toggleMenuOff();
    }

    /**
     * Run the app.
     */
    init();

})();






// Load File Results
//******************************************************************

$("#btn_fileLoadResults_Close").click(function() {
    modalLoadFileResults.style.display = "none";
    // reanable zoom
    MouseState.ZoomEnabled = true;
});




// Side Bar
//******************************************************************
$("#sidebar_file_new").click(function() {
    // Reload the window
    window.location.reload(true);
});
$("#sidebar_file_import").click(function() {
    //$('#menu_file_openSelect').click();
    modalOpenFile.style.display = "block";

    CloseSidebar();
});
$("#sidebar_file_export").click(function() {
    document.getElementById("modal_exportFile").style.display = "block";
    CloseSidebar();
});



// export the file
var textFile = null;

function makeTextFile(text) {
    var data = new Blob([text], { type: 'text/plain' });

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    // returns a URL you can use as a href
    return textFile;
};


$("#btn_file_export_do").click(function() {

    // first get which type of exporter we're using
    var combobox = document.getElementById("modal_exportFile_choice");

    switch (combobox.selectedIndex) {
        case 0: // STL
            io_export_stl();
    }

});
$("#btn_file_export_cancel").click(function() {
    document.getElementById("modal_exportFile").style.display = "none";
});

function OnFileExportTypeChange() {
    var combobox = document.getElementById("modal_exportFile_choice");
    var idx = combobox.selectedIndex;
    var content = combobox.options[idx].innerHTML;
}


// Handle Location To Open File From
$("#btn_openfile_local").click(function() {
    $('#menu_file_openSelect').click();
});

$("#btn_openfile_gdrive").click(function() {
    loadPicker();
});


function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
}

$("#btn_social_github").click(function() {
    /*
  chrome.browser.openTab({
      url: 'https://github.com/r4tch31/Iris-Web-Viewer/wiki'
    });
*/
    openInNewTab('https://github.com/VirtexEdgeDesign/Iris-Web-Viewer/wiki');
});

$("#btn_social_fb").click(function() {
    openInNewTab('https://www.facebook.com/VirtexEdgeDesign');
});

$("#btn_social_twtr").click(function() {
    openInNewTab('https://www.twitter.com/VirtexEdge');
});


// File
//******************************************************************
$("#menu_file_new").click(function() {
    //chrome.runtime.reload();
    window.location.reload(true);
});

$("#menu_file_open").click(function() {
    $('#menu_file_openSelect').click();
});

$("#menu_file_quit").click(function() {
    window.close();
});






// View
//******************************************************************

// Projection Events
$("#menu_view_perspec").click(function() {
    SetViewToPerspective();
});
$("#menu_view_ortho").click(function() {
    SetViewToOrtho();
});


// Set the view events
$("#menu_view_iso").click(function() { SetViewToIso(); });
$("#menu_view_top").click(function() { SetViewToTop(); });
$("#menu_view_bottom").click(function() { SetViewToBottom(); });
$("#menu_view_front").click(function() { SetViewToFront(); });
$("#menu_view_back").click(function() { SetViewToBack(); });
$("#menu_view_left").click(function() { SetViewToLeft(); });
$("#menu_view_right").click(function() { SetViewToRight(); });

$("#menu_view_zoomIn").click(function() { AdjustZoom(0.75); });
$("#menu_view_zoomOut").click(function() { AdjustZoom(1.25); });
$("#menu_view_zoomFit").click(function() { FitZoom(); });

// Rendering Style
//******************************************************************
$("#menu_view_textured").click(function() {
    SetShadingToTextured();
});
$("#menu_view_shaded").click(function() {
    SetShadingToShaded();
});
$("#menu_view_wireframe").click(function() {
    SetShadingToWireframe();
});

// Show Edges
$("#menu_view_doEdge").click(function() {
    SetEdgeRendering(true);
});
$("#menu_view_noEdge").click(function() {
    SetEdgeRendering(false);
});

// Custom Rendering
$("#menu_view_surfaceNormal").click(function() {
    SetShadingToNormal();
});


// Tools
//******************************************************************

$("#menu_tools_measure").click(function() {
    CurrentCMD = null;
    CurrentCMD = new vxMeasureCMD();
    CurrentCMD.Init();
});

$("#menu_tools_measure_angle").click(function() {
    CurrentCMD = null;
    CurrentCMD = new vxMeasureAngleCMD();
    CurrentCMD.Init();
});

$("#menu_tools_debug").click(function() {

    if (stats.dom.style.display == 'none') {
        stats.dom.style.display = 'block';
        DoDebug = true;
    } else {
        stats.dom.style.display = "none";
        DoDebug = false;
    }
});


// About
//******************************************************************
// Get the modal
var modal = document.getElementById('modal_about');
$("#menu_about_about").click(function() {
    CloseSidebar();
    modal.style.display = "block";
});

/*
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];


// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}
*/
// When the user clicks anywhere outside of the modal, close it

var modal_intro = document.getElementById('modal_intro');

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }

    if (event.target == modal_intro) {
        modal_intro.style.display = "none";
    }


    if (event.target == modalOpenFile) {
        modalOpenFile.style.display = "none";
    }
};


// Accordian
//******************************************************************
var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
    acc[i].onclick = function() {
        this.classList.toggle("active");
        this.nextElementSibling.classList.toggle("show");
    };
}


// Sidebar
//******************************************************************
// Get the modal
$("#btn_logo").click(function() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("div_main").style.marginLeft = "250px";
    document.getElementById("glcanvas3D").style.marginLeft = "250px";
    document.getElementById("top_menu").style.marginLeft = "250px";
    document.getElementById("model_treeview").style.marginLeft = "250px";

    //document.body.style.color = "rgba(0,0,0,0.4)";
});
$("#btn_closeSidebar").click(function() {
    CloseSidebar();
    //document.body.style.backgroundColor = "white";
});

function CloseSidebar() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("div_main").style.marginLeft = "0";
    document.getElementById("glcanvas3D").style.marginLeft = "0";
    document.getElementById("div_ribbon").style.marginLeft = "0";
    document.getElementById("model_treeview").style.marginLeft = "0";
}








// Context Menu
// ***************************************************************
$("#SetViewToSel").click(function() {
    modelprop_Center = SelectedMeshCollection[0].Center;
});

$("#SetViewToOrig").click(function() {
    modelprop_Center = [0, 0, 0];
});
$("#cntx_properties").click(function() {
    OpenProperties();
});

$("#btn_closeProperties").click(function() {
    CloseProperties();
});


function OpenProperties() {
    document.getElementById("cntrl_properties").style.marginRight = "300px";
}

function CloseProperties() {
    document.getElementById("cntrl_properties").style.marginRight = "0px";
}


// Show Intro Modal at Start
modal_intro.style.display = "block";








function InitInputHandlers() {

    $(document).keydown(function(e) {
        if (e.keyCode == 16) {
            KeyboardState.Shift = true;
        }
    });

    $(document).keyup(function(e) {
        if (e.keyCode == 16) {
            KeyboardState.Shift = false;
        }
    });

}



var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

function LeftMouseClickEvent() {

    //Only clear the Selected Mesh Collection if the Shift key is up
    if (KeyboardState.Shift === false)
        SelectedMeshCollection.length = 0;

    if (HoverIndex > 0) {
        var newMesh = new vxMeshPart();

        newMesh.Name = "Face." + HoverIndex;

        newMesh.Model = HoveredMesh.Model;

        var ind = 0;
        //var sel_colour = [ 0.1, 1, 0.6, 1];  
        var center = [0, 0, 0];
        for (var i = 0; i < 9; i += 3) {
            newMesh.mesh_vertices.push(HoveredMesh.mesh_vertices[i]);
            newMesh.mesh_vertices.push(HoveredMesh.mesh_vertices[i + 1]);
            newMesh.mesh_vertices.push(HoveredMesh.mesh_vertices[i + 2]);

            center[0] += parseFloat(HoveredMesh.mesh_vertices[i]);
            center[1] += parseFloat(HoveredMesh.mesh_vertices[i + 1]);
            center[2] += parseFloat(HoveredMesh.mesh_vertices[i + 2]);

            newMesh.vert_uvcoords.push(0);
            newMesh.vert_uvcoords.push(0);

            newMesh.vert_noramls.push(HoveredMesh.vert_noramls[i]);
            newMesh.vert_noramls.push(HoveredMesh.vert_noramls[i + 1]);
            newMesh.vert_noramls.push(HoveredMesh.vert_noramls[i + 2]);

            newMesh.vert_colours.push(selectedcolor.R);
            newMesh.vert_colours.push(selectedcolor.G);
            newMesh.vert_colours.push(selectedcolor.B);
            newMesh.vert_colours.push(selectedcolor.A);

            newMesh.Indices.push(ind);
            ind++;
        }

        newMesh.initBasicTexture();
        newMesh.InitialiseBuffers();
        newMesh.SetCenter();

        center[0] /= -3;
        center[1] /= -3;
        center[2] /= -3;

        newMesh.Center = center;

        //console.log(newMesh.Center);

        SelectedMeshCollection.push(newMesh);



        // Set Properties Data
        properties.remove();
        properties = new FaceProperty(gui, newMesh);
        //properties.setAll();

        if (CurrentCMD)
            CurrentCMD.HandleMouseClick(newMesh);

    }


}




function handleMouseDown(event) {
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;


    // Get's the Mouse State
    switch (event.button) {
        case 0:
            MouseState.LeftButtonDown = true;
            LeftMouseClickEvent();
            break;
        case 1:
            MouseState.MiddleButtonDown = true;
            break;
        case 2:
            MouseState.RightButtonDown = true;
            break;
    }
}

function handleMouseUp(event) {
    mouseDown = false;

    // Get's the Mouse State
    switch (event.button) {
        case 0:
            MouseState.LeftButtonDown = false;
            break;
        case 1:
            MouseState.MiddleButtonDown = false;
            break;
        case 2:
            MouseState.RightButtonDown = false;
            break;
    }
}



function handleMouseMove(event) {

    var rect = canvas.getBoundingClientRect();

    MouseState.prevX = MouseState.x;
    MouseState.prevY = MouseState.y;

    MouseState.x = event.clientX - rect.left;
    MouseState.y = event.clientY - rect.top;

    if (!mouseDown) {
        return;
    }

    if (MouseState.MiddleButtonDown) {
        // Handle rotation
        if (KeyboardState.Shift == false) {
            var newX = event.clientX;
            var newY = event.clientY;

            rotX += newX - lastMouseX;
            rotY += newY - lastMouseY;

            lastMouseX = newX;
            lastMouseY = newY;
        }
        // Handle Panning
        else {
            panX = (MouseState.x - MouseState.prevX) / 500 * Zoom;
            panY = (MouseState.y - MouseState.prevY) / 500 * Zoom;
        }
    }
}
var lastPanX = 0;
var lastPanY = 0;



function ResetRotation() {
    rotY = 0;
    rotX = 0;
}


var treepos = 132;



function MouseWheelHandler(e) {

    if (MouseState.ZoomEnabled == true) {
        // cross-browser wheel delta
        var e = window.event || e; // old IE support
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

        // Move the tree based off of whether it has focus or not

        if (treeHasFocus === 1) {
            var tree = document.getElementById('model_treeview');

            //Set the position based off of the delta
            treepos += delta * 14;
            //set the min as the bar height
            treepos = Math.min(132, treepos);

            //console.log(document.getElementById('model_treeview').clientHeight);
            //console.log(window.innerHeight);
            var allowedMovement = document.getElementById('model_treeview').clientHeight - window.innerHeight + 132;

            if (allowedMovement > 0) {
                //Now set the top bound for the treepos
                treepos = Math.max(-1 * allowedMovement + 132, treepos);

                //now set the css data
                tree.style.top = treepos + "px";
            } else {
                tree.style.top = "132px";
            }
        } else {
            // Set zoom info
            Zoom -= delta * (Zoom / 10);
        }
    }
    //log("Set Zoom: " + Zoom);
    return false;
}