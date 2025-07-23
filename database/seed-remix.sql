-- Will create the production and test databases for remix and add starter data in remix-starter-data.sql to production database.

\echo 'Remix production database will be created if it does not exist / deleted and recreated if it does exist. Starter data will then be added to the database. Okay to proceed?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE remix;
CREATE DATABASE remix;
\connect remix

\i remix-schema.sql
\i remix-starter-data.sql

\echo 'Remix testing database will be created if it does not exist / deleted and recreated if it does exist. Okay to proceed?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE remix_test;
CREATE DATABASE remix_test;
\connect remix_test

\i remix-schema.sql