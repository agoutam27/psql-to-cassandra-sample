/*
  Another approach to write query in chunk (using 10000 results - hard coded )
*/

const { Pool, Client } = require('pg');
const fs     = require('fs');

const pool = new Pool({
  user: 'agoutam',
  host: 'localhost',
  database: 'dvdrental',
  port: 5432,
});


let psql = `select r.rental_id, r.rental_date, i.film_id, i.store_id, r.customer_id, r.return_date, r.staff_id,
  p.amount, p.payment_date, r.last_update
from rental r 
left join inventory i using(inventory_id)
left join payment p using(rental_id)`


pool.query("select count(*) from rental", async (err, res) => {
  if(err) {
    throw new Error(err);
  }

  let totalCount = res.rows[0].count;
  console.log("total_count", totalCount, res.rows);
  let totalFetched = 0;
  while (totalFetched < totalCount) {
    let res = await pool.query(psql + ` LIMIT 10000 OFFSET ${totalFetched}`);
    console.log("fetched", res.rowCount);
    write(res, totalFetched/10000);
    totalFetched += 10000;
  }
  pool.end();
});


function write(res, i) {

  const stream = fs.createWriteStream(`rental_${i}.txt`, { flags : 'w' });


  let row_count = res.rowCount;

  console.log("row_count ", row_count);

  let query = "INSERT INTO dvdrental.rental (rental_id,rental_date,film_id,store_id,customer_id," +
    "staff_id,return_date,amount,payment_date,last_updated) VALUES (";

  for (let i = 0; i < row_count; i++) {
    let row = res.rows[i];

    let cqlRow1 = `${row.rental_id},${getTime(row.rental_date)},${row.film_id},${row.store_id},`;
    let cqlRow2 = `${row.customer_id},${row.staff_id},${getTime(row.return_date)},${row.amount},${getTime(row.payment_date)},`;
    let cqlRow3 = `toTimestamp(now()));`;
    stream.write(query);
    stream.write(cqlRow1);
    stream.write(cqlRow2);
    stream.write(cqlRow3);

  }
  stream.end();

}

function getTime(d) {
  return +d;
}
