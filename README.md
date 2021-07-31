# Project structre

 - <CASSANDRA_TABLE>.js is script for CASSANDRA TABLE;

 - Relevant postgres queries are written inside the script itself

 - rental_part.js is another approach to create CQL batch file of chunks 10000 rows for `rental` table


# Running Scripts
 - Run `npm install pg` before running any script
 - Change PG config as per your psql server


# Cassandra data model
![cassasndra model](diagram.png)
