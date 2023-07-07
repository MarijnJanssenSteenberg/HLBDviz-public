import { QueryEngine } from '@comunica/query-sparql'

export async function queryComunicaFindIFC() {
  const myEngine = new QueryEngine();
  console.log(document.getElementById("selected-guid").innerHTML);
  const graphs = document.getElementById("GRAPH-input").value.split(',')
  const bindingsStream = await myEngine.queryBindings(`
  PREFIX bot: <https://w3id.org/bot#> 
  PREFIX rii: <https://janssensteenberg.com/rii#>
  PREFIX fog: <https://w3id.org/fog#>				
  SELECT ?IFClink WHERE {
    ?ifcSite a bot:Site ;
      bot:containsElement ?ifcElement ;
      rii:filePath ?IFClink .
    ?ifcElement fog:hasIfcId-guid ${JSON.stringify(document.getElementById("selected-guid").innerHTML)} .
  }
  LIMIT 1 `, {
    sources: graphs,
  });

  bindingsStream.on('data', (binding) => {
      const IFCLink = binding.get('IFClink').value;
      resolve(IFCLink);
  });

}
window.queryComunicaFindIFC = queryComunicaFindIFC;
queryComunicaFindIFC()