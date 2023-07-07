import { QueryEngine } from '@comunica/query-sparql'
import { pickIfcItemsByGUIDs } from './app.js'

export async function selectElements() {
    const myEngine = new QueryEngine();
    const graphs = document.getElementById("GRAPH-input").value.split(',')
    const bindingsStream = await myEngine.queryBindings(`
    PREFIX fog: <https://w3id.org/fog#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>    
    PREFIX bot: <https://w3id.org/bot#>				
      SELECT Distinct ?GUIDs WHERE { 
        ?Pyloon rdfs:label "Pyloon" ;
            bot:containsElement ?ifcElement .
        ?ifcElement rdfs:label ?label ;
            fog:hasIfcId-guid ?GUIDs .
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
window.selectElements = selectElements;
selectElements()