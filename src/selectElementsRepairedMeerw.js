import { QueryEngine } from '@comunica/query-sparql'
import { pickIfcItemsByGUIDs } from './app.js'

export async function selectElementsRepairedMeerw() {
    const myEngine = new QueryEngine();
    const graphs = document.getElementById("GRAPH-input").value.split(',')
    const bindingsStream = await myEngine.queryBindings(`
    PREFIX fog: <https://w3id.org/fog#>
    PREFIX nen2660: <https://w3id.org/nen2660/def#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rii: <https://janssensteenberg.com/rii#>    
    PREFIX cto: <https://w3id.org/cto#>	
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT Distinct ?GUIDs WHERE { 
        ?ifcElement fog:hasIfcId-guid ?GUIDs .
        ?ifcElement nen2660:isImplementedBy ?elementNew .
        ?elementNew cto:isSubjectOfTask ?task .
        ?task cto:hasTaskContext ?intervention .
        ?intervention rdf:type rii:Repair ;
            rdfs:label "Meerw"@nl .
      }
      `, {
        sources: graphs,
    });
    

    const guids = [];
    bindingsStream.on('data', (binding) => {
        const guid = binding.get('GUIDs').value;
        guids.push(guid);
    });
    bindingsStream.on('end', () => {
        console.log(guids);
        pickIfcItemsByGUIDs(guids);
    });

}
window.selectElementsRepairedMeerw = selectElementsRepairedMeerw;
selectElementsRepairedMeerw()