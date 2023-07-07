import { QueryEngine } from '@comunica/query-sparql'

export async function queryComunicaElementName() {
  const myEngine = new QueryEngine();
  console.log(document.getElementById("selected-guid").innerHTML);
  const graphs = document.getElementById("GRAPH-input").value.split(',')
  const bindingsStream = await myEngine.queryBindings(`				
  SELECT ?label WHERE { 
    ?ifcElement <https://w3id.org/fog#hasIfcId-guid> ${JSON.stringify(document.getElementById("selected-guid").innerHTML)} ;
      rdfs:label ?label .
  }
  LIMIT 1 `, {
    sources: graphs,
  });

  // Consume results as a stream (best performance)
  bindingsStream.on('data', (binding) => {
      const elementName = binding.get('label').value || 'No result found';
      document.getElementById("element-name").innerHTML = elementName;

  });
  // bindingsStream.on('end', () => {
  //     // The data-listener will not be called anymore once we get here.
  // });
  // bindingsStream.on('error', (error) => {
  //     console.error(error);
  // });

}
window.queryComunicaElementName = queryComunicaElementName;
queryComunicaElementName()