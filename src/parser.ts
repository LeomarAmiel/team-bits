import csvtojson from "csvtojson";

interface IOrders {
  orderid: string;
  shopid: string;
  userid: string;
  event_time: string;
}

export const parse = (fileNamePath: string) => {
  return new Promise<IOrders[]>((resolve, reject) => {
    csvtojson({ noheader: false, trim: true })
      .fromFile(fileNamePath)
      .then((json) => {
        resolve(json);
      });
  });
};
