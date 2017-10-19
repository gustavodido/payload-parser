const request = require("request");
const json2csv = require('json2csv');

const TIMEOUT = 3000;

const SUMMARY_COLS = ["Brand Id", "Market Id", "Channel Id", "Skus", "Stores", "Combinations", "Total TI", "Total Rounded TI"];
const RESULT_COLS = ["SKU", "Store", "Cycle Stock", "Safety Stock", "Vis Min Delta", "TI", "Rounded TI", "Capped", "Override"];
const FIELDS = ["skuId", "storeId", "cycleStock", "safetyStock", "visMinDelta", "targetInventory", "roundedTargetInventory", "capped", "overrideType"];

class TIParser {
    constructor() {
        console.log("[TIParser] Created.");
    }

    parse(url, callback) {
    	var self = this;
        console.log("[TIParser] Parsing", url, ".");

        request.get({
            url: url,
            timeout: TIMEOUT,
        }, (error, response, body) => {
            if (error) {
                console.log(error);
                callback(null, error);
            }
            else callback(self.report(JSON.parse(body)));
        });
    }

    report(data) {
    	var report = { summary: {}, results: {}, csv: "" };

        var skus = new Set(), stores = new Set();
        var totalTi = 0, totalRoundedTi = 0;

        for (var i = 0; i < data.skuStore.length; i++) {
            skus.add(data.skuStore[i].skuId);
            stores.add(data.skuStore[i].storeId);

            totalTi += data.skuStore[i].targetInventory;
            totalRoundedTi += data.skuStore[i].roundedTargetInventory;
        }

    	report.summary.columns = SUMMARY_COLS;
    	report.summary.values = [data.brandId, data.marketId, data.channelId, skus.size, stores.size, data.skuStore.length, totalTi, totalRoundedTi]

        report.results.columns = RESULT_COLS;
        report.results.values = data.skuStore.map(ss => [ss.skuId, ss.storeId, ss.cycleStock, ss.safetyStock, ss.visMinDelta, ss.targetInventory, ss.roundedTargetInventory, ss.capped, ss.overrideType]).sort();

        report.csv = json2csv({ data: data.skuStore, fields: FIELDS })

    	return report;
    }
}

module.exports = TIParser