import bodyParser from 'body-parser';
import express from 'express';
import { connection } from './';
import mssql from 'mssql';
const app = express.Router();

app.use(bodyParser.json());

app.get('/', async (req: express.Request, res: express.Response) => {
	const result = await mssql.query(`SELECT * FROM onGoingJobs ORDER BY startDate`);
	for (let i = 0; i < result.recordset.length; i++) {
		const element = result.recordset[i];
		element.startDate = (element.startDate as Date).toLocaleDateString();
	}
	const result2 = await mssql.query(`SELECT * FROM finishedJobs ORDER BY endDate desc`);
	for (let i = 0; i < result2.recordset.length; i++) {
		const element = result2.recordset[i];
		element.startDate = (element.startDate as Date).toLocaleDateString();
		element.endDate = (element.endDate as Date).toLocaleDateString();
		// element.totalTimeSpent = element.totalTimeSpent + (element.totalTimeSpent == 1 ? ' Day': ' Days')
	}
	res.send({ onGoingJobs: result.recordset, finishedJobs: result2.recordset });
});

app.get('/:id', async (req: express.Request, res: express.Response) => {
	const result = await mssql.query(`SELECT * FROM onGoingJobs WHERE receiptID = ${req.params.id}`);
	for (let i = 0; i < result.recordset.length; i++) {
		const element = result.recordset[i];
		element.startDate = (element.startDate as Date).toLocaleDateString();
	}
	res.send(result.recordset);
});

app.post('/:id', async (req: express.Request, res: express.Response) => {
	const { data, quantity } = req.body;
	connection.request().input('receiptID', req.params.id).input('serialNumber', data.serialNumber).input('amount', quantity).execute('sp_orderSparePart');
	res.send('200');
});

export default app;
