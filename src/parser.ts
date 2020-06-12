import csvtojson from "csvtojson";

export const parse = (fileNamePath: string) => {
  return new Promise((resolve, reject) => {
    csvtojson({ noheader: false, trim: true })
      .fromFile(fileNamePath)
      .then((json) => {
        resolve(json);
      });
  });
};
