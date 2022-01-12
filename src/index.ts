import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
const app = express();
import mssql from 'mssql';
import bodyParser from 'body-parser';

const config: mssql.config = {
	user: process.env.MSSQL_USERNAME,
	password: process.env.MSSQL_PASSWORD,
	server: process.env.MSSQL_SERVERNAME as string,
	database: process.env.MSSQL_DATABASE,
	options: {
		trustedConnection: true,
		trustServerCertificate: true,
		useUTC: true,
	},
};

app.use(bodyParser.json());

import customers from './customers';
import employees from './employees';
import jobs from './jobs';
import parts from './parts';

app.use('/customers', customers);
app.use('/employees', employees);
app.use('/jobs', jobs);
app.use('/parts', parts);

export let connection: mssql.ConnectionPool;
app.listen(process.env.PORT, async () => {
	connection = await mssql.connect(config);
	// const result = await mssql.query(`select * from Customer`);

	console.log(`Listening on port ${process.env.PORT}.`);
});
