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

let connection: mssql.ConnectionPool;

app.use(bodyParser.json());
app.get('/customers', async (req: express.Request, res: express.Response) => {
	const { type } = req.query;
	if (type === 'premium') {
		const result = await mssql.query(`select * from premiumCustomers order by [Number of Visits] desc`);
		res.send(result.recordset);
	} else if (type === 'all') {
		const result = await mssql.query(`select customerID, firstName + ' ' + lastName [Customer Name], contactNumber from customer`);
		res.send(result.recordset);
	}
});

app.get('/employees', async (req: express.Request, res: express.Response) => {
	const result = await mssql.query(`SELECT SSN, companyID, role ,firstName + ' ' + lastName [Customer Name], age, salary, gender
	FROM Employee`);
	res.send(result.recordset);
});

app.get('/jobs', async (req: express.Request, res: express.Response) => {
	const result = await mssql.query(`SELECT * FROM onGoingJobs ORDER BY startDate`);
	for (let i = 0; i < result.recordset.length; i++) {
		const element = result.recordset[i];
		element.startDate = (element.startDate as Date).toLocaleDateString();
	}
	res.send(result.recordset);
});

app.get('/jobs/:id', async (req: express.Request, res: express.Response) => {
	const result = await mssql.query(`SELECT * FROM onGoingJobs WHERE receiptID = ${req.params.id}`);
	for (let i = 0; i < result.recordset.length; i++) {
		const element = result.recordset[i];
		element.startDate = (element.startDate as Date).toLocaleDateString();
	}
	res.send(result.recordset);
});

app.post('/jobs/:id', async (req: express.Request, res: express.Response) => {
	const { data, quantity } = req.body;
	connection.request().input('receiptID', req.params.id).input('serialNumber', data.serialNumber).input('amount', quantity).execute('sp_orderSparePart');
	res.send('200');
});

app.get('/parts/:id', async (req: express.Request, res: express.Response) => {
	const result = await mssql.query(
		`SELECT o.receiptID, s.brand, s.serialNumber, s.partType, r.amount FROM onGoingJobs o inner join ReceiptSparePart r on o.receiptID = r.receiptID inner join SparePart s on r.serialNumber = s.serialNumber where o.receiptID = ${req.params.id}
		`
	);
	const spareParts = await mssql.query(`SELECT * FROM SparePart`);
	const { recordset: brandSetObject } = await mssql.query(`SELECT DISTINCT brand FROM SparePart`);
	const brandsWithParts: { [key: string]: any } = getItems(brandSetObject, spareParts);
	const resultParts: any[] = [];
	for (const brand of Object.keys(brandsWithParts)) {
		for (let i = 0; i < result.recordset.length; i++) {
			const part = result.recordset[i];
			if (brandsWithParts[brand].find((y: any) => y.serialNumber === part.serialNumber)) {
				resultParts.push(part);
			}
		}
	}
	res.send(resultParts);
});

app.get('/parts', async (req: express.Request, res: express.Response) => {
	const result = await mssql.query(`SELECT * FROM SparePart`);
	const { recordset: brandSetObject } = await mssql.query(`SELECT DISTINCT brand FROM SparePart`);

	const brandsWithParts: { [key: string]: any } = getItems(brandSetObject, result);
	res.send(brandsWithParts);
});

app.listen(process.env.PORT, async () => {
	connection = await mssql.connect(config);
	// const result = await mssql.query(`select * from Customer`);

	console.log(`Listening on port ${process.env.PORT}.`);
});

function getItems(brandSetObject: mssql.IRecordSet<any>, result: mssql.IResult<any>) {
	const brandSet = new Set();
	for (let i = 0; i < brandSetObject.length; i++) {
		const element = result.recordset[i];
		brandSet.add(element.brand);
	}
	const brandsWithParts: { [key: string]: any } = {};
	brandSet.forEach((iterator: any) => {
		let elementArr: any[] = [];
		for (let i = 0; i < result.recordset.length; i++) {
			const element = result.recordset[i];
			if (!elementArr.find((x: any) => x.partType === element.partType) && element.brand === iterator) {
				elementArr.push(element);
			}
		}
		brandsWithParts[iterator] = elementArr;
	});
	return brandsWithParts;
}
