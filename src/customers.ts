import express from 'express';
import mssql from 'mssql';
const app = express.Router();

app.get('/', async (req: express.Request, res: express.Response) => {
	const { type } = req.query;
	if (type === 'premium') {
		const result = await mssql.query(`select * from premiumCustomers order by [Number of Visits] desc`);
		res.send(result.recordset);
	} else if (type === 'all') {
		const result = await mssql.query(`select customerID, firstName + ' ' + lastName [Customer Name], contactNumber from customer`);
		res.send(result.recordset);
	}
});

export default app;
