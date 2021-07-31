const { Pool, Client } = require('pg');
const fs     = require('fs');
const stream = fs.createWriteStream('film.txt', { flags : 'w' });


const pool = new Pool({
  user: 'agoutam',
  host: 'localhost',
  database: 'dvdrental',
  port: 5432,
});

let tableQuery = `CREATE TABLE IF NOT EXISTS "dvdrental"."film" (
  "category" varchar,
  "film_id" smallint,
  "title" varchar,
  "description" text,
  "release_year" smallint,
  "language" varchar,
  "rental_duration" tinyint,
  "rental_rate" float,
  "length" smallint,
  "replacement_cost" float,
  "rating" varchar,
  "last_updated" timestamp,
  "special_features" text,
  "fulltext" text,
  "actors" frozen<set<frozen<actor>>>,
  PRIMARY KEY ("category", "film_id")
)
WITH CLUSTERING ORDER BY ("film_id" ASC);`;

let psql = `select f.film_id, f.title, f.description, f.release_year, f.rental_duration, f.rental_rate, f.length,
  f.replacement_cost, f.rating, f.last_update, f.special_features, f.fulltext, l."name" as "language",
  c2."name" as category, json_agg(json_build_object('first_name', a2.first_name, 'last_name', a2.last_name)) as actors
from film f
left join "language" l using(language_id)
left join (select c.name, fc.film_id from category c left join film_category fc using(category_id)) c2 on c2.film_id = f.film_id
left join (select a.first_name, a.last_name, fa.film_id from actor a left join film_actor fa using(actor_id)) a2 on a2.film_id = f.film_id
group by f.film_id, l."name", c2.name;`

pool.query(psql, (err, res) => {
  console.error(err);
  if (err) return;

  let row_count = res.rowCount;

  let row = res.rows[0];
  // console.log("fulltext ", `${row.fulltext}`);
  // console.log("actors", `${JSON.stringify(row.actors)}`)
  // pool.end();
  // stream.end();
  // return;
  console.log("row_count ", row_count);

  let query = "INSERT INTO dvdrental.film (category,film_id,title,description,release_year,language," +
    "rental_duration,rental_rate,length,replacement_cost,rating,last_updated,special_features,fulltext,actors) VALUES (";

  stream.write(tableQuery);
  for (let i = 0; i < row_count; i++) {
    let row = res.rows[i];

    let cqlRow1 = `'${row.category}',${row.film_id},'${row.title}','${row.description}',${row.release_year},`;
    let cqlRow2 = `'${row.language}',${row.rental_duration},${row.rental_rate},${row.length},${row.replacement_cost},`;
    let cqlRow3 = `'${row.rating}',toTimestamp(now()),'${row.special_features}','${row.fulltext.replace(/'/g, '"')}',${listOfUdtToString(row.actors)});`;
    stream.write(query);
    stream.write(cqlRow1);
    stream.write(cqlRow2);
    stream.write(cqlRow3);

  }

  stream.end();
  pool.end();
});

function getTime(d) {
  return +d;
}

function listOfUdtToString(list) {
  let str = "{";
  for (let x of list) {
    str += `${udtToString(x)},`;
  }
  str = str.substr(0, str.length - 1);
  return str + "}";
}

function udtToString(actor) {
  let str = "{";
  for (let x in actor) {
    str += `${x}:'${actor[x]}',`;
  }
  str = str.substr(0, str.length - 1);
  return str + "}";
}
