import express from 'express';
import mssql from 'mssql';
const app = express.Router();

app.get('/:id', async (req: express.Request, res: express.Response) => {
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

app.get('/', async (req: express.Request, res: express.Response) => {
	const result = await mssql.query(`SELECT * FROM SparePart`);
	const { recordset: brandSetObject } = await mssql.query(`SELECT DISTINCT brand FROM SparePart`);

	const brandsWithParts: { [key: string]: any } = getItems(brandSetObject, result);
	res.send(brandsWithParts);
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

export default app;
