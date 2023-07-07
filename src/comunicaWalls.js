import { QueryEngine } from '@comunica/query-sparql'

export async function queryComunicaWalls() {
  const myEngine = new QueryEngine();

  const graphs = document.getElementById("GRAPH-input").value.split(',')
  const query = `PREFIX beo: <http://pi.pauwel.be/voc/buildingelement#> 
  PREFIX bpt: <https://w3id.org/bpt#> 
  select * where { 
    ?wall a beo:Wall .
    ?wall bpt:hasGlobalIdIfcRoot ?GlobalId
  } limit 100 `
  const bindingsStream = await myEngine.queryBindings(query, {
    sources: graphs,
  });

  const bindings = await bindingsStream.toArray(); console.log(bindings);
  //clear result box
  document.getElementById("results-box-content").innerHTML = "";
  //start table component
  let tableContent = "<table>" 

  tableContent +="<tr>"
  const headers = bindings[0].entries._root.entries
  for (var y = 0; y<headers.length; y++) {
    tableContent += "<th>"+headers[y][0]+"</th>"
  }
  tableContent +="</tr>"

  for (var i = 0; i<bindings.length; i++) {
    const binding1 = bindings[i]
    const results = binding1.entries._root.entries
    //create table header


    //create table rows
    tableContent += "<tr>"
    for (var x = 0; x<results.length; x++) {
      if (results[x][1].termType === "Literal") {
        console.log(results[x][0] +": "+ results[x][1].value)
        
        tableContent += "<td>"+results[x][1].value+"</td>"
      }
      if (results[x][1].termType !== "Literal") {
        console.log(results[x][0] +": "+ results[x][1].value.split("#", 2)[1])
        tableContent += "<td><a target='_blank' href='"+results[x][1].value+"'>"+results[x][1].value.split("#", 2)[1]+"</a></td>"
      }
    }
    tableContent += "</tr>"
  } 
  //end
  tableContent += "</table>" 

  //add table to results box
  document.getElementById("results-box-content").innerHTML = tableContent
}
window.queryComunicaWalls = queryComunicaWalls;
queryComunicaWalls()