'use strict';

const axios = require('axios');
const express = require('express');
const cheerio = require('cheerio');
const app = express();

const log = console.log;
const get_prices = async () => {
	try {
		const url = 'http://www.coinmarketcap.com';
		const { data } = await axios({
			method: 'GET',
			url: url
		});
		const $ = cheerio.load(data);

		const e_selector =
			'#__next > div > div.main-content > div.sc-57oli2-0.comDeo.cmc-body-wrapper > div > div > div.h7vnx2-1.bFzXgL > table > tbody > tr';

		const keys = [
			'rank',
			'name',
			'price',
			'24hr',
			'7d',
			'marketCap',
			'volume',
			'circulatingSupply'
		];

		const coins = [];

		$(e_selector).each((idx, elem) => {
			let keyIdx = 0;
			const coinObj = {};

			if (idx <= 9) {
				$(elem)
					.children()
					.each((childIdx, childElem) => {
						let td_value = $(childElem).text();
						if (keyIdx === 1 || keyIdx === 6) {
							td_value = $(
								'p:first-child',
								$(childElem).html()
							).text();
						}

						if (td_value) {
							coinObj[keys[keyIdx]] = td_value;
							keyIdx++;
						}
					});

				coins.push(coinObj);
			}
		});
		return coins;
	} catch (error) {
		console.error(error);
	}
};

app.get('/api/crypto-price', async (req, res) => {
	try {
		const prices = await get_prices();

		return res.status(200).json({
			result: prices
		});
	} catch (error) {
		return res.status(500).json({
			err: err.toString()
		});
	}
});

//Server
const port = process.env.PORT || 3000;

const server = () => {
	app.listen(`${port}`, () => {
		log(`listening on port ${port}`);
	});
};

server();
