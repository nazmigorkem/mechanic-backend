import express from 'express';
const app = express();
import dotenv from 'dotenv';
import mssql from 'mssql';
import bodyParser from 'body-parser';

const config: mssql.config = {
	user: 'sa',
	password: '1234',
	server: 'MONSTER',
	database: 'MechanicDatabase',
	options: {
		trustedConnection: true,
		trustServerCertificate: true,
		useUTC: true,
	},
};
dotenv.config();

export let connection: mssql.ConnectionPool;

app.use(bodyParser.json());
import customers from './customers';
import employees from './employees';
import jobs from './jobs';
import parts from './parts';

app.use('/customers', customers);
app.use('/employees', employees);
app.use('/jobs', jobs);
app.use('/parts', parts);

app.listen(process.env.PORT, async () => {
	connection = await mssql.connect(config);
	// const result = await mssql.query(`select * from Customer`);

	console.log(`Listening on port ${process.env.PORT}.`);
});
