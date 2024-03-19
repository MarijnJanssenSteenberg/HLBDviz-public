import { IfcViewerAPI } from 'web-ifc-viewer';
import { MeshLambertMaterial, MeshBasicMaterial, LineBasicMaterial, Color, Mesh, BoxGeometry } from 'three';
import { ClippingEdges } from 'web-ifc-viewer/dist/components/display/clipping-planes/clipping-edges';
import { IFCSPACE, IFCOPENINGELEMENT, IFCFURNISHINGELEMENT, IFCWALL, IFCWINDOW, IFCCURTAINWALL, IFCMEMBER, IFCPLATE, IFCWALLSTANDARDCASE, IFCDOOR, IFCSLAB, IfcWindowStandardCase } from 'web-ifc';
import { CSS2DRenderer , CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import _ from 'lodash';
import { IFCBUILDINGELEMENTPROXY } from 'web-ifc/web-ifc-api.js';

// Functions
import { queryComunica } from './comunica.js'
import { queryComunicaWalls } from './comunicaWalls.js'
import { queryComunicaGlobalIdProps } from './comunicaGlobalIdProps.js'
import { queryComunicaGlobalIdPropsAsset } from './comunicaGlobalIdPropsAsset.js'
import { queryComunicaGlobalIdPropsThesaurus } from './comunicaGlobalIdPropsThesaurus.js'
import { queryComunicaGlobalIdPhotos } from './comunicaGlobalIdPhotos.js'
import { queryComunicaGlobalIdLocation } from './comunicaGlobalIdLocation.js'
import { fetchImages } from './fetchImages.js'
import { queryComunicaElementName } from './comunicaElement.js'
import { queryComunicaGlobalIdInterventions } from './comunicaGlobalIdInterventions.js'

// import { selectElements } from './selectElements.js' ;
import { selectElementsReplaced } from './selectElementsReplaced.js' ;
import { selectElementsStatus } from './selectElementsStatus.js' ;
// import { selectElementsRepaired } from './selectElementsRepaired.js' ;
// import { selectElementsRepairedMeerw } from './selectElementsRepairedMeerw.js' ;

const container = document.getElementById('viewer-container');
const viewerColor = new Color('#E5EBF7');
const viewer = new IfcViewerAPI({ container, backgroundColor: viewerColor });
viewer.axes.setAxes();
viewer.shadowDropper.darkness = 1.5;

viewer.IFC.setWasmPath("../Heritage-LBDviz/dist/"); //Github Pages hosting
// viewer.IFC.setWasmPath("dist/"); //Local hosting

viewer.IFC.loader.ifcManager.applyWebIfcConfig({
    USE_FAST_BOOLS: true,
    COORDINATE_TO_ORIGIN: true
  });

const lineMaterial = new LineBasicMaterial({ color: 0x555555 });
const baseMaterial = new MeshBasicMaterial({ color: 0xffffff, side: 2 });
viewer.IFC.selector.preselection.material = new MeshLambertMaterial({ transparent: true, opacity: 0.2, color: 0x630D80, depthTest: false, }); 
viewer.IFC.selector.selection.material = new MeshLambertMaterial({ transparent: true, opacity: 0.7, color: 0x630D80, depthTest: false, }); 

let first = true;
let model;

//
// LOAD IFC
//
let hasHashGUID = false;
let hashGUID = 'X';
if (window.location.hash.substring(1) !== '') {
  hashGUID = window.location.hash.substring(1);
  hasHashGUID = true;
  console.log(hashGUID);
  document.getElementById("selected-guid").innerHTML = hashGUID;
}

async function loadDefaultIfc(url) {
  const overlay = document.getElementById('loading-overlay');
  const progressText = document.getElementById('loading-progress');
  overlay.classList.remove('hidden');
  progressText.innerText = `Loading...`;

  const model = await viewer.IFC.loadIfcUrl(url);
  model.material.forEach(mat => mat.side = 2);

  viewer.IFC.loader.ifcManager.parser.setupOptionalCategories({
    [IFCSPACE]: true,
    [IFCOPENINGELEMENT]: false
  });

  if(first) first = false;
  else {
    ClippingEdges.forceStyleUpdate = true;
  }

  viewer.edges.create(`${model.modelID}`, model.modelID, lineMaterial, baseMaterial);
  await viewer.shadowDropper.renderShadow(model.modelID);

  overlay.classList.add('hidden');

  if (hasHashGUID === true) {
    await viewer.IFC.selector.pickIfcItemsByID(model.modelID, pickIfcItemByGUID(hashGUID), true, false);
  }  
}
loadDefaultIfc("https://raw.githubusercontent.com/MarijnJanssenSteenberg/Heritage-LBDviz/main/resources/IFC/MonumentOpDeDam_zonderBestrating.ifc");

const scene = viewer.context.getScene();

//
// window. functions
//

window.onmousemove = () => viewer.IFC.selector.prePickIfcItem();
window.onclick = async () => {
    const result = await viewer.IFC.selector.pickIfcItem(false);
    if(!result) return;
    const {modelID, id} = result;
    const props = await viewer.IFC.getProperties(modelID, id, true, false);
    console.log(props.GlobalId.value);
    // document.getElementById("results-box-content").innerHTML = JSON.stringify(props);
    document.getElementById("gallery").innerHTML = "";
    document.getElementById("element-name").innerHTML = "";
    document.getElementById("selected-guid").innerHTML = props.GlobalId.value;
    queryComunicaElementName();
    return props.GlobalId
};
viewer.clipper.active=true;

window.ondblclick = () => {
    viewer.IFC.selector.highlightIfcItem(true);
};



window.onkeydown = (event) => {

    if(event.code === 'Escape') {
        resetViewerUI();
        resetFilters();
    }
    else if(event.code === 'KeyF') {
        fetchImages();
    }
    else if(event.code === 'KeyS') {
        pickIfcItemsByGUIDs(['2s4IjT4M5DQObqvIOMvgxP', '1IFFpeGSDBCgUeNT6G1HH_'])
    } 


    else if(event.code === 'Delete') {
        viewer.dimensions.delete();
      }
    

    else if(event.code === 'KeyP') {
        viewer.clipper.createPlane();
    }
    else if(event.code === 'KeyO') {
        viewer.clipper.deletePlane();
    }
    else if(event.code === 'KeyT') {
        viewer.clipper.toggle();
    }

    else if(event.code === 'KeyQ') {
      queryComunica()
    }        
    else if(event.code === 'KeyW') {
      queryComunicaWalls()
    }  
    else if(event.code === 'KeyT') {
      queryComunicaGlobalIdProps()
    }  
};

// dimensions tool 
let isActive = false;

const activate = () => {
  viewer.dimensions.active = true;
  viewer.dimensions.previewActive = true;
  window.ondblclick = () => {
    viewer.dimensions.create();
  }
  console.log('Dimensions activated');
}
const deactivate = () => {
  viewer.dimensions.active = false;
  viewer.dimensions.previewActive = false;
  console.log('Dimensions deactivated');
}
window.addEventListener('keydown', (event) => {
  if (event.shiftKey && event.code === 'KeyD') {
    isActive ? deactivate() : activate();
    isActive = !isActive;
  }
});
document.getElementById('dimensions-button').addEventListener('click', () => {
    isActive ? deactivate() : activate();
    isActive = !isActive;
});

// reset
function resetViewerUI() {
  viewer.IFC.selector.unpickIfcItems();
  viewer.IFC.selector.unHighlightIfcItems();
  document.getElementById("results-box-content").innerHTML = "";
  document.getElementById("gallery").innerHTML = "";
  document.getElementById("element-name").innerHTML = "";
  document.getElementById("selected-guid").innerHTML = "";
}

function resetFilters() {
  viewer.IFC.loader.ifcManager.removeSubset(0,FilterMaterial);
  viewer.IFC.loader.ifcManager.removeSubset(0,SubsetMaterial01);   
  viewer.IFC.loader.ifcManager.removeSubset(0,SubsetMaterial02); 
  viewer.IFC.loader.ifcManager.removeSubset(0,SubsetMaterial03);  
  viewer.IFC.loader.ifcManager.removeSubset(0,SubsetMaterialOpname); 
  viewer.IFC.loader.ifcManager.removeSubset(0,SubsetMaterialHerplaatsing); 
}


//
// Menu functions
//

// accordion
var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    } 
  });
}


// tabs
export function openOptionsTab(evt, optionsTab) {
  var i, optionstabcontent, optionstablinks;
  optionstabcontent = document.getElementsByClassName("optionstabcontent");
  for (i = 0; i < optionstabcontent.length; i++) {
    optionstabcontent[i].style.display = "none";
  }
  optionstablinks = document.getElementsByClassName("optionstablinks");
  for (i = 0; i < optionstablinks.length; i++) {
    optionstablinks[i].className = optionstablinks[i].className.replace(" active", "");
  }
  document.getElementById(optionsTab).style.display = "block";
  evt.currentTarget.className += " active";

}
window.openOptionsTab = openOptionsTab;
document.getElementById("defaultOptionsOpen").click();


export function openQueryTab(evt, queryTab) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(queryTab).style.display = "block";
  evt.currentTarget.className += " active";

}
window.openQueryTab = openQueryTab;
document.getElementById("defaultOpen").click();



//
// Select by GUID(s)
//


// Subset for specific elements by GUIDs
const FilterMaterial = new MeshLambertMaterial({ transparent: true, opacity: 0.7, color: 0xC81919, depthTest: false, })  
export function pickIfcItemsByGUIDs(GUIDs) {
  if (document.getElementById("selected-guid").innerHTML !== hashGUID) {  
    resetViewerUI();
    resetFilters();
    viewer.IFC.getAllItemsOfType(0, IFCBUILDINGELEMENTPROXY, true)
    .then((ifcElements) => {
      const map = new Map();
      ifcElements.forEach((element) => {
        const expressID = element.expressID;
        const globalID = element.GlobalId.value;
        // map.set(expressID, globalID);
        map.set(globalID, expressID);
      });

      function getValuesFromMap(keys) {
        const values = [];
        keys.forEach((key) => {
          const value = map.get(key);
          values.push(value);
        });
        return values;
      }

      const selectvalues = getValuesFromMap(GUIDs);
      console.log(selectvalues); 

      viewer.IFC.selector.pickIfcItemsByID(0, selectvalues, true, false);
      viewer.IFC.selector.highlightIfcItemsByID(0, selectvalues, true, false);

      viewer.IFC.loader.ifcManager.createSubset({
        modelID: 0,
        scene: scene,
        ids: selectvalues,
        removePrevious: true,
        material: FilterMaterial,
      });
    });
  }
}

// Select element by GUID
export function pickIfcItemByGUID(GUID) {
  viewer.IFC.selector.unpickIfcItems();
  document.getElementById("element-name").innerHTML = "";
  document.getElementById("selected-guid").innerHTML = GUID;
  queryComunicaElementName();

  viewer.IFC.getAllItemsOfType(0, IFCBUILDINGELEMENTPROXY, true)
  .then((ifcElements) => {
    const map = new Map();
    ifcElements.forEach((element) => {
      const expressID = element.expressID;
      const globalID = element.GlobalId.value;
      map.set(globalID, expressID);
    });

    function getValueFromMap(key) {
      const valueArray = [];
      const value = map.get(key);
      valueArray.push(value);
      return valueArray;
    }

    const selectvalue = getValueFromMap(GUID);
    console.log(selectvalue); 

    viewer.IFC.selector.pickIfcItemsByID(0, selectvalue, true, true) ;
  });
}


// Subset by Type and GUIDs
const SubsetMaterial01 = new MeshLambertMaterial({ transparent: true, opacity: 0.7, color: 0xff9900, depthTest: false, })
const SubsetMaterial02 = new MeshLambertMaterial({ transparent: true, opacity: 0.7, color: 0xffff00, depthTest: false, })
const SubsetMaterial03 = new MeshLambertMaterial({ transparent: true, opacity: 0.7, color: 0x00ffff, depthTest: false, })

const SubsetMaterialOpname = new MeshLambertMaterial({ color: 0xffff00 })
const SubsetMaterialHerplaatsing = new MeshLambertMaterial({ color: 0x00ffff })

export function createSubsetByType(results) {  
  resetViewerUI();
  resetFilters();
  viewer.IFC.getAllItemsOfType(0, IFCBUILDINGELEMENTPROXY, true)
  .then((ifcElements) => {
    const map = new Map();
    ifcElements.forEach((element) => {
      const expressID = element.expressID;
      const globalID = element.GlobalId.value;
      // map.set(expressID, globalID);
      map.set(globalID, expressID);
    });

    function getValuesFromMap(keys) {
      const values = [];
      keys.forEach((key) => {
        const value = map.get(key);
        values.push(value);
      });
      return values;
    }

    const types = Array.from(new Set(results.map((result) => result.type)));
    console.log(types);
    types.forEach((type) => {
      console.log(type);
      const GUIDs = results.filter((result) => result.type === type).map((result) => result.guid);
      const selectvalues = getValuesFromMap(GUIDs);
      console.log(selectvalues);

      const materials = {
        '10': SubsetMaterial01,
        '16': SubsetMaterial02,
        '17': SubsetMaterial03,
        'Opname Bestaande Situatie': SubsetMaterialOpname,
        'Herplaatsing': SubsetMaterialHerplaatsing,
      };

      viewer.IFC.loader.ifcManager.createSubset({
        modelID: 0,
        scene: scene,
        ids: selectvalues,
        removePrevious: true,
        material: materials[type],
      });     
    });
  });
}
