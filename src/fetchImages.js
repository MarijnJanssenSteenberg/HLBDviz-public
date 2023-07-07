import { QueryEngine } from '@comunica/query-sparql'
export async function fetchImages() {
    const myEngine = new QueryEngine();
    console.log(document.getElementById("selected-guid").innerHTML);
    const graphs = document.getElementById("GRAPH-input").value.split(',');
    const result = await myEngine.queryBindings(`PREFIX rii: <https://janssensteenberg.com/rii#>
      PREFIX dot: <https://w3id.org/dot#>
      PREFIX nen2660: <https://w3id.org/nen2660/def#>
      PREFIX prov: <http://www.w3.org/ns/prov#>							
      SELECT DISTINCT ?Photo_Link ?Task WHERE { 
        ?ifcElement <https://w3id.org/fog#hasIfcId-guid> ${JSON.stringify(document.getElementById("selected-guid").innerHTML)} ;
          nen2660:isImplementedBy ?element.
        ?element rdfs:label ?Element ;
          rii:hasDescriptionInResource ?photo .
          ?task rdfs:label ?Task .
        ?photo rdfs:label ?Photo ;
          rii:resourceCapturedDuringTask ?task ;
          rii:filePath ?Photo_Link .
      } ORDER BY ?Task
      LIMIT 10 `, {
      sources: graphs,
    });
    
    document.getElementById("gallery").innerHTML = "";
    queryComunicaGlobalIdPhotos()

    const bindings = result;
    const images = [];

    bindings.on('data', (binding) => {
        const imageUrl = binding.get('Photo_Link').value;
        images.push(imageUrl);
    });

    bindings.on('end', () => {
        displayImages(images);
  });
  }
  window.fetchImages = fetchImages; 
  fetchImages(); 


export function displayImages(images) {
  const gallery = document.getElementById('gallery');
  const imageList = document.createElement('ul');
  imageList.classList.add('gallery');

  images.forEach((imageUrl) => {
    const img = document.createElement('img');
    const anchor = document.createElement('a');
    // Set the href attribute of the anchor tag to the URL you want to link to
    anchor.href = imageUrl;
    // Set the target attribute to '_blank' to open the link in a new window/tab
    anchor.target = '_blank';
    img.src = imageUrl;
    img.alt = 'Image from SPARQL query';
    img.width = 100;
    // Append the image element to the anchor tag instead of the list item element
    anchor.appendChild(img);
    imageList.appendChild(anchor);
  });

  gallery.appendChild(imageList);
}

