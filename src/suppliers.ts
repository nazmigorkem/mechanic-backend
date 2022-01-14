import bodyParser from 'body-parser';
import express from 'express';
import { connection } from './';
import mssql from 'mssql';
const app = express.Router();

app.use(bodyParser.json());

app.get('/', async (req: express.Request, res: express.Response) => {
	const { recordset: supplierRecordSet } = await mssql.query(`SELECT * FROM Supplier`);
	res.send({ suppliers: supplierRecordSet });
});

export default app;
