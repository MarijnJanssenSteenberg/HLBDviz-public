
import { QueryEngine } from '@comunica/query-sparql'

export async function queryComunicaGlobalIdInterventions() {
  const myEngine = new QueryEngine();
  console.log(document.getElementById("selected-guid").innerHTML);
  const graphs = document.getElementById("GRAPH-input").value.split(',')
  const bindingsStream = await myEngine.queryBindings(`PREFIX nen2660: <https://w3id.org/nen2660/def#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX cto: <https://w3id.org/cto#>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX fog: <https://w3id.org/fog#>
  
  select Distinct ?Element ?Intervention ?Value ?Describtion
  where { 
    ?ifcElement fog:hasIfcId-guid `+JSON.stringify(document.getElementById("selected-guid").innerHTML)+` ;
      nen2660:isImplementedBy ?element .
    ?element rdfs:label ?Element ;
      cto:isSubjectOfTask ?task .
    ?task cto:hasTaskContext ?intervention .
    ?intervention rdfs:label ?Intervention ;
      rdf:value ?Value ;
      rdfs:comment ?Describtion .
  } limit 10 `, {
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
window.queryComunicaGlobalIdInterventions = queryComunicaGlobalIdInterventions;
queryComunicaGlobalIdInterventions()