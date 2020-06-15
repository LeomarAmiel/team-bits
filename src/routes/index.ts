import { Express } from "express";
import { parse } from "../parser";
import { add } from "date-fns";

interface IOrders {
  orderid: string;
  shopid: string;
  userid: string;
  event_time: string;
}

export default (app: Express) => {
  app.get("/", async (req, res, next) => {
    const parsedData = await parse(`${__dirname}/order_brush_order.csv`);
    const sortedShopResult = parsedData.sort(
      (
        { shopid, event_time },
        { shopid: secondShopId, event_time: secondEventTime }
      ) => {
        const firstTimestamp = new Date(event_time);
        const secondTimestamp = new Date(secondEventTime);
        if (shopid < secondShopId) {
          return -1;
        }
        if (shopid > secondShopId) {
          return 1;
        }
        if (secondTimestamp < firstTimestamp) {
          return 1;
        }
        if (secondTimestamp > firstTimestamp) {
          return -1;
        }

        return 0;
      }
    );
    const dataSortedByShops = [];
    for (const order of sortedShopResult) {
      if (!dataSortedByShops[dataSortedByShops.length - 1]) {
        dataSortedByShops.push([order]);
        continue;
      }

      if (dataSortedByShops[dataSortedByShops.length - 1].length > 0) {
        const { shopid } = dataSortedByShops[dataSortedByShops.length - 1][0];
        if (shopid === order.shopid) {
          dataSortedByShops[dataSortedByShops.length - 1].push(order);
          continue;
        } else {
          dataSortedByShops.push([order]);
          continue;
        }
      }
      dataSortedByShops.push([order]);
    }

    let submission = [];

    const result = dataSortedByShops.map((shopOrders: IOrders[]) => {
      let userIds = "";
      for (let i = 0; i < shopOrders.length; i++) {
        const timestamp = add(new Date(shopOrders[i].event_time), {
          hours: 1,
        });
        // [userid: 0]
        const uniqueBuyers = {
          [shopOrders[i].userid]: 1,
        };
        let numberOfOrders = 1;
        for (let j = i + 1; j < shopOrders.length; j++) {
          const order = shopOrders[j];
          if (order === undefined) {
            // initial order is the latest order of the shop
            break;
          }
          const nextOrderTimestamp = new Date(order.event_time);
          // next order is an hour more from the initial order
          if (timestamp < nextOrderTimestamp) {
            break;
          }
          numberOfOrders += 1;
          if (!!uniqueBuyers[order.userid]) {
            uniqueBuyers[order.userid] += 1;
          } else {
            uniqueBuyers[order.userid] = 1;
          }
        }
        const buyers = Object.keys(uniqueBuyers);

        const numberOfUniqueBuyers = buyers.length;
        const concentrateRate = numberOfOrders / numberOfUniqueBuyers;
        if (concentrateRate >= 3) {
          userIds += buyers.reduce((acc, key) => {
            if (
              uniqueBuyers[key] >= 3 &&
              !acc.includes(key) &&
              !userIds.includes(key)
            ) {
              if (acc.length === 0 && userIds.length === 0) {
                acc = `${key}`;
                return acc;
              } else if (acc.length > 0 || userIds.length > 0) {
                acc = `${acc}&${key}`;
                return acc;
              }
            }
            return acc;
          }, userIds);
        }
      }
      submission.push({
        shopid: shopOrders[0].shopid,
        userid: userIds.length !== 0 ? userIds : "0",
      });
    });

    res.send(submission);
  });
};
