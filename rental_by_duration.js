const { Pool, Client } = require('pg');
var fs     = require('fs');
var stream = fs.createWriteStream('rental_by_duration.txt', { flags : 'w' });


const pool = new Pool({
  user: 'agoutam',
  host: 'localhost',
  database: 'dvdrental',
  port: 5432,
});

let tableQuery = `CREATE TABLE IF NOT EXISTS "dvdrental"."rental_by_duration" (
  "rental_age" bigint,
  "rental_id" smallint,
  "customer_id" smallint,
  "rental_date" timestamp,
  "film_id" smallint,
  "last_updated" timestamp,
  PRIMARY KEY ("rental_age", "film_id", "customer_id")
)
WITH CLUSTERING ORDER BY ("film_id" ASC, "customer_id" ASC);`;


let psql = `select r.rental_id, r.rental_date, i.film_id, r.customer_id,
  r.last_update, (extract (EPOCH from r.return_date) - extract (EPOCH from r.rental_date)) rental_age
from rental r left join inventory i using(inventory_id) where r.return_date is not null;`

pool.query(psql, (err, res) => {
  console.error(err);
  if (err) return;

  let row_count = res.rowCount;

  console.log("row_count ", row_count);

  stream.write(tableQuery);
  let query = "INSERT INTO dvdrental.rental_by_duration (rental_age,film_id,customer_id,rental_id,rental_date,last_updated) VALUES (";

  for (let i = 0; i < row_count; i++) {
    let row = res.rows[i];

    let cqlRow1 = `${getTime(row.rental_age)},${row.film_id},${row.customer_id},${row.rental_id},${getTime(row.rental_date)},toTimestamp(now()));`;
    stream.write(query);
    stream.write(cqlRow1);
  }

  stream.end();
  pool.end();
});

function getTime(d) {
  return +d;
}
