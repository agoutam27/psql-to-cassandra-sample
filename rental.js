const { Pool, Client } = require('pg');
const fs     = require('fs');
const stream = fs.createWriteStream('rental.txt', { flags : 'w' });

const pool = new Pool({
  user: 'agoutam',
  host: 'localhost',
  database: 'dvdrental',
  port: 5432,
});

const keyMap = {
  rental_id: {key: 'rental_id', type: 'int'},
  rental_date: {key: 'rental_date', type: 'ts'},
  film_id: {key: 'film_id', type: 'int'},
  store_id: {key: 'store_id', type: 'int'},
  customer_id: {key: 'customer_id', type: 'int'},
  staff_id: {key: 'staff_id', type: 'int'},
  return_date: {key: 'return_date', type: 'ts'},
  amount: {key: 'amount', type: 'int'},
  payment_date: {key: 'payment_date', type: 'ts'},
}

let psql = `select r.rental_id, r.rental_date, i.film_id, i.store_id, r.customer_id, r.return_date, r.staff_id,
  p.amount, p.payment_date, r.last_update
from rental r 
left join inventory i using(inventory_id)
left join payment p using(rental_id);`;

// pool.query(psql, (err, res) => {
//   console.error(err);
//   if (err) return;

//   let row_count = res.rowCount;

//   console.log("row_count ", row_count);

//   let query = "INSERT INTO dvdrental.rental (rental_id,rental_date,film_id,store_id,customer_id," +
//     "staff_id,return_date,amount,payment_date,last_updated) VALUES (";

//   for (let i = 0; i < row_count; i++) {
//     let row = res.rows[i];

//     let cqlRow1 = `${row.rental_id},${getTime(row.rental_date)},${row.film_id},${row.store_id},`;
//     let cqlRow2 = `${row.customer_id},${row.staff_id},${getTime(row.return_date)},${row.amount},${getTime(row.payment_date)},`;
//     let cqlRow3 = `toTimestamp(now()));`;
//     stream.write(query);
//     stream.write(cqlRow1);
//     stream.write(cqlRow2);
//     stream.write(cqlRow3);

//   }

//   stream.end();
//   pool.end();
// });

pool.query(psql, (err, res) => {
  console.error(err);
  if (err) return;

  let row_count = res.rowCount;

  console.log("row_count ", row_count);

  let query = "INSERT INTO dvdrental.rental (";
  let cqlRow = ") VALUES(";

  for (let i = 0; i < row_count; i++) {
    let row = res.rows[i];
    let q = query, c = cqlRow;
    for (let key in keyMap) {
      if (row[keyMap[key].key] != null && row[keyMap[key].key] != undefined) {
        q += keyMap[key].key + ",";
        if (keyMap[key].type == 'int') {
          c += row[keyMap[key].key] + ",";
        } else if (keyMap[key].type == "ts") {
          c += getTime(row[keyMap[key].key]) + ",";
        }
      }

    }
    q += "last_updated";
    c += "toTimestamp(now())";
    
    stream.write(q);
    stream.write(c + ");");
    stream.write('\n');

  }

  stream.end();
  pool.end();
});


function getTime(d) {
  return +d;
}
