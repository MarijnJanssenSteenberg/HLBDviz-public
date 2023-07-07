import { QueryEngine } from '@comunica/query-sparql'
import { pickIfcItemsByGUIDs } from './app.js'
import { pickIfcItemByGUID } from './app.js'

// import { createSubsetByType } from './app.js' //test

export async function selectElementsReplaced() {
    const myEngine = new QueryEngine();
    const graphs = document.getElementById("GRAPH-input").value.split(',')
    const bindingsStream = await myEngine.queryBindings(`
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX nen2660: <https://w3id.org/nen2660/def#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX fog: <https://w3id.org/fog#>
    PREFIX rii: <https://janssensteenberg.com/rii#>    
    PREFIX bot: <https://w3id.org/bot#>				
      SELECT Distinct ?GUIDs ?label ?Storey WHERE {
        ?storey a bot:Storey ;
            rdfs:label ?Storey ;
            bot:hasElement ?ifcElement. 
        ?ifcElement rdfs:label ?label ;
            fog:hasIfcId-guid ?GUIDs .
        ?ifcElement nen2660:isImplementedBy ?elementNew .
        ?elementNew rii:replacesElement ?element .
      }
      ORDER BY ?label
      `, {
        sources: graphs,
    });
    
    const results = [];
    bindingsStream.on('data', (binding) => {
        const guid = binding.get('GUIDs').value;
        const label = binding.get('label').value;
        const type = binding.get('Storey').value;
        results.push({guid, label, type});
    });

    bindingsStream.on('end', () => {
        console.log(results);
        pickIfcItemsByGUIDs(results.map((result) => result.guid));
        // createSubsetByType(results); //test

        const table = document.createElement('table');
        const headerRow = table.insertRow();
        const headerCellObject = headerRow.insertCell();
        headerCellObject.innerHTML = '<b>Object ID</b>';
        const headerCellStorey = headerRow.insertCell();
        headerCellStorey.innerHTML = '<b>Storey</b>';
        results.forEach(({ guid, label, type }) => {
            const row = table.insertRow();
            const labelCell = row.insertCell();
            labelCell.innerHTML = label;
            labelCell.classList.add('label-cell');  
            labelCell.onclick = () => {
              pickIfcItemByGUID(guid);
            };
            const storeyCell = row.insertCell();
            storeyCell.innerHTML = type;
        });
        document.getElementById('results-box-content').appendChild(table);
    });

}
window.selectElementsReplaced = selectElementsReplaced;
selectElementsReplaced()