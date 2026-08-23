async function test() {
  const res = await fetch("http://localhost:8000/api/farmer/animals", {
    headers: { "Authorization": "Bearer farmer1_id:FARMER" }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
