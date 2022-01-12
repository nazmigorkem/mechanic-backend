import express from 'express';
import mssql from 'mssql';
const app = express.Router();

app.get('/', async (req: express.Request, res: express.Response) => {
	const result = await mssql.query(`SELECT SSN, companyID, role ,firstName + ' ' + lastName [Customer Name], age, salary, gender
	FROM Employee`);
	res.send(result.recordset);
});

export default app;
